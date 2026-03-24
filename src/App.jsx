import React, { useState, useMemo } from 'react';
import { calculateTerm, calculateNonTerm } from './logic/calculator';

const MONTHS = [
  "Apr'26", "May'26", "Jun'26", "Jul'26", "Aug'26", "Sep'26",
  "Oct'26", "Nov'26", "Dec'26", "Jan'27", "Feb'27", "Mar'27"
];

const TERM_INITIAL_INPUTS = {
  team: 'BAU',
  vintage: '0-3 months',
  termPolicies: '',
  avgApe: '',
  riderAttach: '',
  avgRiderApe: '',
  nonTermPolicies: ''
};

const NON_TERM_INITIAL_INPUTS = {
  team: 'BFL',
  vintage: '0-3 months',
  policies: '',
  riderAttach: '',
  avgRiderApe: '',
  ulipApe: '',
  gbsApe: '',
  supremeApe: '',
  savingsApe: '',
  termPolicies: ''
};

const Currency = ({ value }) => (
  <span style={{ whiteSpace: 'nowrap' }}>
    ₹ {new Intl.NumberFormat('en-IN').format(Math.round(value || 0))}
  </span>
);

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, title, message, confirmText = "Clear Everything", btnColor = "#ef4444" }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-text">{message}</p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" style={{ backgroundColor: btnColor }} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [simulator, setSimulator] = useState(null);

  if (!simulator) {
    return (
      <div className="container home-screen">
        <div className="hero-section">
          <span className="hero-tag">FY'27 INCENTIVE PROGRAM</span>
          <h1 className="hero-title">Annual Incentive <span>Simulator</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Simulate and project your annual performance rewards with precision.
          </p>
        </div>

        <div className="options-grid">
          <div className="option-card panel" onClick={() => setSimulator('term')}>
            <div className="option-icon" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>👤</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Term Team</h3>
            <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', backgroundColor: '#1e40af' }}>Launch Simulator</button>
          </div>
          <div className="option-card panel" onClick={() => setSimulator('non-term')}>
            <div className="option-icon" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>👤</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Non-Term Team</h3>
            <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', backgroundColor: '#1e40af' }}>Launch Simulator</button>
          </div>
        </div>
      </div>
    );
  }

  return simulator === 'term' ? (
    <TermSimulator onBack={() => setSimulator(null)} />
  ) : (
    <NonTermSimulator onBack={() => setSimulator(null)} />
  );
};

const TermSimulator = ({ onBack }) => {
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [applyToAll, setApplyToAll] = useState(true);
  const [monthlyInputs, setMonthlyInputs] = useState(
    Array(12).fill(null).map(() => ({ ...TERM_INITIAL_INPUTS }))
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);

  const handleBackClick = () => {
    setIsBackModalOpen(true);
  };

  const inputs = monthlyInputs[selectedMonth];

  const handleClearAll = () => {
    setIsModalOpen(true);
  };

  const confirmClearAll = () => {
    setMonthlyInputs(Array(12).fill(null).map(() => ({ ...TERM_INITIAL_INPUTS })));
    setApplyToAll(true);
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let numVal = value;

    if (name !== 'team' && name !== 'vintage') {
      let strVal = value;
      if (strVal.length > 1 && strVal.startsWith('0')) {
        strVal = strVal.replace(/^0+/, '');
      }
      numVal = strVal === '' ? '' : Number(strVal);

      if (typeof numVal === 'number') {
        numVal = Math.max(0, numVal);
        if (name === 'riderAttach') numVal = Math.min(numVal, 100);
        if (name === 'avgApe') numVal = Math.min(numVal, 10000000);
        if (name === 'avgRiderApe') numVal = Math.min(numVal, 10000000);
        if (['policies', 'termPolicies', 'nonTermPolicies'].includes(name)) numVal = Math.min(numVal, 1000);
      }
    }

    if (applyToAll) {
      setMonthlyInputs(prev => prev.map(m => ({ ...m, [name]: numVal })));
    } else {
      setMonthlyInputs(prev => {
        const next = [...prev];
        next[selectedMonth] = { ...next[selectedMonth], [name]: numVal };
        return next;
      });
    }
  };

  const monthlyResults = useMemo(() =>
    monthlyInputs.map(m => calculateTerm({
      ...m,
      termPolicies: Number(m.termPolicies) || 0,
      avgApe: Number(m.avgApe) || 0,
      riderAttach: Number(m.riderAttach) || 0,
      avgRiderApe: Number(m.avgRiderApe) || 0,
      nonTermPolicies: Number(m.nonTermPolicies) || 0
    })), [monthlyInputs]
  );

  const totals = useMemo(() =>
    monthlyResults.reduce((acc, curr) => ({
      termIncentive: acc.termIncentive + curr.termIncentive,
      riderIncentive: acc.riderIncentive + curr.riderIncentive,
      nonTermIncentive: acc.nonTermIncentive + curr.nonTermIncentive,
      totalIncentive: acc.totalIncentive + curr.totalIncentive
    }), { termIncentive: 0, riderIncentive: 0, nonTermIncentive: 0, totalIncentive: 0 }),
    [monthlyResults]
  );

  return (
    <div className="container" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={confirmClearAll}
        onCancel={() => setIsModalOpen(false)}
        title="Clear All Data?"
        message="Are you sure you want to clear all data for all 12 months? This action cannot be undone."
      />
      <ConfirmationModal
        isOpen={isBackModalOpen}
        onConfirm={onBack}
        onCancel={() => setIsBackModalOpen(false)}
        title="Go Back to Overview?"
        message="Any unsaved progress for the current session may be lost. Are you sure you want to go back?"
        confirmText="Go to homepage"
        btnColor="var(--primary)"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <button className="btn btn-secondary" onClick={handleBackClick}>
          ← Back to Overview
        </button>
        <button type="button" className="btn btn-danger" onClick={handleClearAll}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Clear All
        </button>
      </div>

      <div className="simulator-layout">
        <div className="form-card panel">
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Term Team</p>
              <h3 style={{ fontSize: '1.25rem' }}>{applyToAll ? "Global Config" : `Config: ${MONTHS[selectedMonth]}`}</h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', backgroundColor: 'var(--bg-alt)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                <input type="checkbox" checked={applyToAll} onChange={(e) => {
                  const checked = e.target.checked;
                  setApplyToAll(checked);
                  if (checked) {
                    setMonthlyInputs(prev => prev.map(() => prev[selectedMonth]));
                  }
                }} />
                Apply to all
              </label>
            </div>
          </div>

          <div className="input-group">
            <label>Team</label>
            <select name="team" value={inputs.team} onChange={handleChange}>
              <option value="BAU">BAU</option>
              <option value="BFL">BFL</option>
            </select>
          </div>
          <div className="input-group">
            <label>Vintage</label>
            <select name="vintage" value={inputs.vintage} onChange={handleChange}>
              <option value="0-3 months">0-3 months</option>
              <option value="3-6 months">3-6 months</option>
              <option value=">6 months">{">6 months"}</option>
            </select>
          </div>

          <div style={{ borderBottom: '1.5px solid var(--border)', margin: '0.25rem 0' }}></div>

          <div className="input-group">
            <label>No. of Term Policies</label>
            <input type="number" name="termPolicies" value={inputs.termPolicies} onChange={handleChange} placeholder="0" />
          </div>
          <div className="input-group">
            <label>Average Term APE (₹)</label>
            <input type="number" name="avgApe" value={inputs.avgApe} onChange={handleChange} placeholder="0" />
          </div>
          <div className="input-group">
            <label>Rider Attachment (%)</label>
            <input type="number" name="riderAttach" value={inputs.riderAttach} onChange={handleChange} placeholder="0" />
          </div>
          <div className="input-group">
            <label>Average Rider APE (₹)</label>
            <input type="number" name="avgRiderApe" value={inputs.avgRiderApe} onChange={handleChange} placeholder="0" />
          </div>

          <div style={{ borderBottom: '1.5px solid var(--border)', margin: '0.25rem 0' }}></div>

          <div className="input-group">
            <label>No. of Non-Term Policies</label>
            <input type="number" name="nonTermPolicies" value={inputs.nonTermPolicies} onChange={handleChange} placeholder="0" />
          </div>
        </div>

        <div className="results-container">
          <div className="summary-cards">
            <div className="sum-card highlight">
              <span className="label">Annual Projection</span>
              <span className="value"><Currency value={totals.totalIncentive} /></span>
            </div>
            <div className="sum-card panel">
              <span className="label">Monthly Average</span>
              <span className="value"><Currency value={totals.totalIncentive / 12} /></span>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Term Incentive</th>
                  <th>Rider Incentive</th>
                  <th>Non-Term Incentive</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {monthlyResults.map((res, idx) => (
                  <tr key={MONTHS[idx]} style={{ backgroundColor: selectedMonth === idx ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent' }}>
                    <td style={{ fontWeight: 600 }}>{MONTHS[idx]}</td>
                    <td><Currency value={res.termIncentive} /></td>
                    <td><Currency value={res.riderIncentive} /></td>
                    <td><Currency value={res.nonTermIncentive} /></td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}><Currency value={res.totalIncentive} /></td>
                    <td>
                      <button
                        className={`btn ${selectedMonth === idx ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={() => {
                          setSelectedMonth(idx);
                          setApplyToAll(false);
                        }}
                      >
                        {selectedMonth === idx ? 'Editing' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td>FY'27 Total</td>
                  <td><Currency value={totals.termIncentive} /></td>
                  <td><Currency value={totals.riderIncentive} /></td>
                  <td><Currency value={totals.nonTermIncentive} /></td>
                  <td><Currency value={totals.totalIncentive} /></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const NonTermSimulator = ({ onBack }) => {
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [applyToAll, setApplyToAll] = useState(true);
  const [monthlyInputs, setMonthlyInputs] = useState(
    Array(12).fill(null).map(() => ({ ...NON_TERM_INITIAL_INPUTS }))
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);

  const handleBackClick = () => {
    setIsBackModalOpen(true);
  };

  const inputs = monthlyInputs[selectedMonth];

  const handleClearAll = () => {
    setIsModalOpen(true);
  };

  const confirmClearAll = () => {
    setMonthlyInputs(Array(12).fill(null).map(() => ({ ...NON_TERM_INITIAL_INPUTS })));
    setApplyToAll(true);
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let numVal = value;

    if (name !== 'team' && name !== 'vintage') {
      let strVal = value;
      if (strVal.length > 1 && strVal.startsWith('0')) {
        strVal = strVal.replace(/^0+/, '');
      }
      numVal = strVal === '' ? '' : Number(strVal);

      if (typeof numVal === 'number') {
        numVal = Math.max(0, numVal);
        if (name === 'riderAttach') numVal = Math.min(numVal, 100);
        if (['ulipApe', 'gbsApe', 'supremeApe', 'savingsApe'].includes(name)) numVal = Math.min(numVal, 1000000000);
        if (name === 'avgRiderApe') numVal = Math.min(numVal, 10000000);
        if (['policies', 'termPolicies', 'nonTermPolicies'].includes(name)) numVal = Math.min(numVal, 1000);
      }
    }

    if (applyToAll) {
      setMonthlyInputs(prev => prev.map(m => ({ ...m, [name]: numVal })));
    } else {
      setMonthlyInputs(prev => {
        const next = [...prev];
        next[selectedMonth] = { ...next[selectedMonth], [name]: numVal };
        return next;
      });
    }
  };

  const monthlyResults = useMemo(() =>
    monthlyInputs.map(m => calculateNonTerm({
      ...m,
      policies: Number(m.policies) || 0,
      riderAttach: Number(m.riderAttach) || 0,
      avgRiderApe: Number(m.avgRiderApe) || 0,
      ulipApe: Number(m.ulipApe) || 0,
      gbsApe: Number(m.gbsApe) || 0,
      supremeApe: Number(m.supremeApe) || 0,
      savingsApe: Number(m.savingsApe) || 0,
      termPolicies: Number(m.termPolicies) || 0
    })), [monthlyInputs]
  );

  const totals = useMemo(() =>
    monthlyResults.reduce((acc, curr) => ({
      ulipIncentive: acc.ulipIncentive + curr.ulipIncentive,
      gbsIncentive: acc.gbsIncentive + curr.gbsIncentive,
      supremeIncentive: acc.supremeIncentive + curr.supremeIncentive,
      savingsIncentive: acc.savingsIncentive + curr.savingsIncentive,
      riderIncentive: acc.riderIncentive + curr.riderIncentive,
      termIncentive: acc.termIncentive + curr.termIncentive,
      totalIncentive: acc.totalIncentive + curr.totalIncentive
    }), { ulipIncentive: 0, gbsIncentive: 0, supremeIncentive: 0, savingsIncentive: 0, riderIncentive: 0, termIncentive: 0, totalIncentive: 0 }),
    [monthlyResults]
  );

  return (
    <div className="container" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={confirmClearAll}
        onCancel={() => setIsModalOpen(false)}
        title="Clear All Data?"
        message="Are you sure you want to clear all data for all 12 months? This action cannot be undone."
      />
      <ConfirmationModal
        isOpen={isBackModalOpen}
        onConfirm={onBack}
        onCancel={() => setIsBackModalOpen(false)}
        title="Go Back to Overview?"
        message="Any unsaved progress for the current session may be lost. Are you sure you want to go back?"
        confirmText="Go to homepage"
        btnColor="var(--primary)"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <button className="btn btn-secondary" onClick={handleBackClick}>
          ← Back to Overview
        </button>
        <button type="button" className="btn btn-danger" onClick={handleClearAll}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Clear All
        </button>
      </div>

      <div className="simulator-layout">
        <div className="form-card panel">
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Non-Term Team</p>
              <h3 style={{ fontSize: '1.25rem' }}>{applyToAll ? "Global Config" : `Config: ${MONTHS[selectedMonth]}`}</h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', backgroundColor: 'var(--bg-alt)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                <input type="checkbox" checked={applyToAll} onChange={(e) => {
                  const checked = e.target.checked;
                  setApplyToAll(checked);
                  if (checked) {
                    setMonthlyInputs(prev => prev.map(() => prev[selectedMonth]));
                  }
                }} />
                Apply to all
              </label>
            </div>
          </div>

          <div className="input-group">
            <label>Team</label>
            <select name="team" value={inputs.team} onChange={handleChange}>
              <option value="BAU">BAU</option>
              <option value="BFL">BFL</option>
            </select>
          </div>
          <div className="input-group">
            <label>Vintage</label>
            <select name="vintage" value={inputs.vintage} onChange={handleChange}>
              <option value="0-3 months">0-3 months</option>
              <option value=">3 months">{">3 months"}</option>
            </select>
          </div>

          <div style={{ borderBottom: '1.5px solid var(--border)', margin: '0.25rem 0' }}></div>

          <div className="input-group">
            <label>Total policies issued</label>
            <input type="number" name="policies" value={inputs.policies} onChange={handleChange} placeholder="0" />
          </div>
          <div className="input-group">
            <label>Rider Attachment (%)</label>
            <input type="number" name="riderAttach" value={inputs.riderAttach} onChange={handleChange} placeholder="0" />
          </div>
          <div className="input-group">
            <label>Avg Rider APE (₹)</label>
            <input type="number" name="avgRiderApe" value={inputs.avgRiderApe} onChange={handleChange} placeholder="0" />
          </div>

          <div style={{ borderBottom: '1.5px solid var(--border)', margin: '0.25rem 0' }}></div>

          <div className="input-group">
            <label>Total ULIP APE (₹)</label>
            <input type="number" name="ulipApe" value={inputs.ulipApe} onChange={handleChange} placeholder="0" />
          </div>
          <div className="input-group">
            <label style={{ opacity: inputs.team === 'BFL' ? 0.5 : 1 }}>Total GBS APE (₹)</label>
            <input
              type="number"
              name="gbsApe"
              value={inputs.team === 'BFL' ? '' : inputs.gbsApe}
              onChange={handleChange}
              placeholder="0"
              disabled={inputs.team === 'BFL'}
              style={{
                backgroundColor: inputs.team === 'BFL' ? 'var(--bg-alt)' : 'white',
                cursor: inputs.team === 'BFL' ? 'not-allowed' : 'text'
              }}
            />
          </div>
          <div className="input-group">
            <label>Total Supreme APE (₹)</label>
            <input type="number" name="supremeApe" value={inputs.supremeApe} onChange={handleChange} placeholder="0" />
          </div>
          <div className="input-group">
            <label>Total Savings APE (₹)</label>
            <input type="number" name="savingsApe" value={inputs.savingsApe} onChange={handleChange} placeholder="0" />
          </div>

          <div style={{ borderBottom: '1.5px solid var(--border)', margin: '0.25rem 0' }}></div>

          <div className="input-group">
            <label>No. of Term Policies</label>
            <input type="number" name="termPolicies" value={inputs.termPolicies} onChange={handleChange} placeholder="0" />
          </div>
        </div>

        <div className="results-container">
          <div className="summary-cards">
            <div className="sum-card highlight">
              <span className="label">Annual Projection</span>
              <span className="value"><Currency value={totals.totalIncentive} /></span>
            </div>
            <div className="sum-card panel">
              <span className="label">Monthly Average</span>
              <span className="value"><Currency value={totals.totalIncentive / 12} /></span>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>ULIP</th>
                  <th>Other Non Term</th>
                  <th>Rider</th>
                  <th>Term</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {monthlyResults.map((res, idx) => (
                  <tr key={MONTHS[idx]} style={{ backgroundColor: selectedMonth === idx ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent' }}>
                    <td style={{ fontWeight: 600 }}>{MONTHS[idx]}</td>
                    <td><Currency value={res.ulipIncentive} /></td>
                    <td><Currency value={res.gbsIncentive + res.savingsIncentive + res.supremeIncentive} /></td>
                    <td><Currency value={res.riderIncentive} /></td>
                    <td><Currency value={res.termIncentive} /></td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}><Currency value={res.totalIncentive} /></td>
                    <td>
                      <button
                        className={`btn ${selectedMonth === idx ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={() => {
                          setSelectedMonth(idx);
                          setApplyToAll(false);
                        }}
                      >
                        {selectedMonth === idx ? 'Editing' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td>FY'27 Total</td>
                  <td><Currency value={totals.ulipIncentive} /></td>
                  <td><Currency value={totals.gbsIncentive + totals.savingsIncentive + totals.supremeIncentive} /></td>
                  <td><Currency value={totals.riderIncentive} /></td>
                  <td><Currency value={totals.termIncentive} /></td>
                  <td><Currency value={totals.totalIncentive} /></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
