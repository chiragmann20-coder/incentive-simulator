
/**
 * Calculation logic for the Annual Incentive Simulator
 * Based on Annual Calculator.xlsx
 */

export const TERM_SLABS = {
  BAU: {
    "0-3 months": [
      { min: 0, rate: 0 },
      { min: 100000, rate: 0.08 },
      { min: 125000, rate: 0.0825 },
      { min: 150000, rate: 0.085 },
      { min: 175000, rate: 0.0875 },
      { min: 200000, rate: 0.09 },
      { min: 225000, rate: 0.0925 }
    ],
    "3-6 months": [
      { min: 0, rate: 0 },
      { min: 135600, rate: 0.08 },
      { min: 160600, rate: 0.0825 },
      { min: 185600, rate: 0.085 },
      { min: 210600, rate: 0.0875 },
      { min: 235600, rate: 0.09 },
      { min: 260600, rate: 0.0925 }
    ],
    ">6 months": [
      { min: 0, rate: 0 },
      { min: 163100, rate: 0.08 },
      { min: 188100, rate: 0.0825 },
      { min: 213100, rate: 0.085 },
      { min: 238100, rate: 0.0875 },
      { min: 263100, rate: 0.09 },
      { min: 288100, rate: 0.0925 }
    ]
  },
  BFL: {
    "0-3 months": [
      { min: 0, rate: 0 },
      { min: 80000, rate: 0.08 },
      { min: 125000, rate: 0.0825 },
      { min: 150000, rate: 0.085 },
      { min: 175000, rate: 0.0875 },
      { min: 200000, rate: 0.09 },
      { min: 225000, rate: 0.0925 }
    ],
    "3-6 months": [
      { min: 0, rate: 0 },
      { min: 115000, rate: 0.08 },
      { min: 160600, rate: 0.0825 },
      { min: 185600, rate: 0.085 },
      { min: 210600, rate: 0.0875 },
      { min: 235600, rate: 0.09 },
      { min: 260600, rate: 0.0925 }
    ],
    ">6 months": [
      { min: 0, rate: 0 },
      { min: 135000, rate: 0.08 },
      { min: 188100, rate: 0.0825 },
      { min: 213100, rate: 0.085 },
      { min: 238100, rate: 0.0875 },
      { min: 263100, rate: 0.09 },
      { min: 288100, rate: 0.0925 }
    ]
  }
};

export const NON_TERM_SLABS = {
  BAU: {
    "0-3 months": [
      { min: 0, rate: 0 },
      { min: 300000, rate: 0.02 },
      { min: 600001, rate: 0.04 },
      { min: 1000001, rate: 0.07 }
    ],
    ">3 months": [
      { min: 0, rate: 0 },
      { min: 500000, rate: 0.02 },
      { min: 700001, rate: 0.04 },
      { min: 1200001, rate: 0.07 }
    ]
  },
  BFL: {
    "0-3 months": [
      { min: 0, rate: 0 },
      { min: 100000, rate: 0.025 },
      { min: 250001, rate: 0.045 },
      { min: 500001, rate: 0.055 },
      { min: 1000001, rate: 0.075 },
      { min: 2000001, rate: 0.10 }
    ],
    ">3 months": [
      { min: 0, rate: 0 },
      { min: 150000, rate: 0.025 },
      { min: 300001, rate: 0.045 },
      { min: 500001, rate: 0.055 },
      { min: 1000001, rate: 0.070 },
      { min: 1500001, rate: 0.085 },
      { min: 2000001, rate: 0.10 }
    ]
  }
};

export const TERM_ELIGIBILITY = {
  BFL: {
    "0-3 months": { minNOP: 4, minAPE: 80000 },
    "3-6 months": { minNOP: 5, minAPE: 115000 },
    ">6 months": { minNOP: 6, minAPE: 135000 }
  },
  BAU: {
    "0-3 months": { minNOP: 5, minAPE: 100000 },
    "3-6 months": { minNOP: 6, minAPE: 135600 },
    ">6 months": { minNOP: 7, minAPE: 163100 }
  }
};

const getRate = (slabs, value) => {
  let rate = 0;
  for (const slab of slabs) {
    if (value >= slab.min) {
      rate = slab.rate;
    } else {
      break;
    }
  }
  return rate;
};

export const calculateTerm = (inputs) => {
  const { team, vintage, termPolicies, avgApe, riderAttach, avgRiderApe, nonTermPolicies } = inputs;
  
  const totalApe = termPolicies * avgApe;
  const eligibility = TERM_ELIGIBILITY[team][vintage];

  // Eligibility Check
  if (termPolicies < eligibility.minNOP || totalApe < eligibility.minAPE) {
    return {
      totalApe,
      riderIncentive: 0,
      termIncentive: 0,
      nonTermIncentive: 0,
      totalIncentive: 0
    };
  }

  const riderCount = termPolicies * (riderAttach / 100);
  const riderApe = riderCount * avgRiderApe;
  
  const riderIncentive = 0.25 * riderApe;
  
  const slabs = TERM_SLABS[team][vintage];
  const rate = getRate(slabs, totalApe);
  const termIncentive = rate * totalApe;
  
  const nonTermIncentive = 1000 * nonTermPolicies;
  
  return {
    totalApe,
    riderIncentive,
    termIncentive,
    nonTermIncentive,
    totalIncentive: riderIncentive + termIncentive + nonTermIncentive
  };
};

export const NON_TERM_ELIGIBILITY = {
  BAU: {
    "0-3 months": 300000,
    ">3 months": 500000
  },
  BFL: {
    "0-3 months": 100000,
    ">3 months": 150000
  }
};

export const calculateNonTerm = (inputs) => {
  const { team, vintage, policies, riderAttach, avgRiderApe, ulipApe, gbsApe, supremeApe, savingsApe, termPolicies } = inputs;
  
  const eligibilityMin = NON_TERM_ELIGIBILITY[team][vintage];

  // Eligibility Check
  if (ulipApe < eligibilityMin) {
    return {
      ulipIncentive: 0,
      gbsIncentive: 0,
      savingsIncentive: 0,
      supremeIncentive: 0,
      termIncentive: 0,
      riderIncentive: 0,
      totalIncentive: 0
    };
  }

  const slabs = NON_TERM_SLABS[team][vintage];
  const ulipRate = getRate(slabs, ulipApe);
  const ulipIncentive = ulipRate * ulipApe;
  
  const gbsIncentive = team === "BAU" ? 0.01 * gbsApe : 0;
  const savingsIncentive = 0.10 * savingsApe;
  const supremeIncentive = 0.01 * supremeApe;
  
  const termValue = team === "BAU" ? 1500 : 2000;
  const termIncentive = termValue * termPolicies;
  
  const riderIncentive = 0.25 * (riderAttach / 100) * policies * avgRiderApe;
  
  return {
    ulipIncentive,
    gbsIncentive,
    savingsIncentive,
    supremeIncentive,
    termIncentive,
    riderIncentive,
    totalIncentive: ulipIncentive + gbsIncentive + savingsIncentive + supremeIncentive + termIncentive + riderIncentive
  };
};
