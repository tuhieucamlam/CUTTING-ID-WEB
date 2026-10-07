import React from 'react';
import './FilterBar.css';

export default function FilterBar({ filters, options, onChange }) {
  const { date, machine, model, component } = filters;
  const { machines, models, components } = options;

  return (
    <div className="filter-bar">
      {/* Plan Date */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="dot dot-green">●</span> Plan Date (Ngày KH)
          <span className="label-hint">YYYY/MM/DD</span>
        </label>
        <input
          type="date"
          className="filter-input"
          value={date}
          onChange={e => onChange('date', e.target.value)}
        />
      </div>

      {/* Machine */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="dot dot-green">●</span> Machine (Chọn vào máy)
        </label>
        <select
          className="filter-select"
          value={machine}
          onChange={e => onChange('machine', e.target.value)}
        >
          <option value="">★ Tất cả máy (All Machines)</option>
          {machines.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Model Name */}
      <div className="filter-group">
        <label className="filter-label">
          <a href="#!" className="view-all-link" onClick={e => { e.preventDefault(); onChange('model',''); onChange('component',''); }}>
            🔗 Xem tất cả
          </a>
          <span className="dot dot-orange">●</span> Model Name (Chọn mã hàng)
        </label>
        <select
          className="filter-select"
          value={model}
          onChange={e => onChange('model', e.target.value)}
        >
          <option value="">★ Tất cả mã hàng (All Models)</option>
          {models.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Component */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="dot dot-teal">●</span> Component / Part Name (Chi tiết)
        </label>
        <select
          className="filter-select"
          value={component}
          onChange={e => onChange('component', e.target.value)}
        >
          <option value="">★ Tất cả chi tiết (All Parts)</option>
          {components.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
}
