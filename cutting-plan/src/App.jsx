import { useState, useMemo } from 'react';
import { RAW_DATA } from './data/sampleData';
import { buildPivot, formatPlanDate, inputToKey } from './utils/pivotUtils';
import FilterBar from './components/FilterBar';
import ActionBar from './components/ActionBar';
import PivotTable from './components/PivotTable';
import './App.css';

// ─── Sort sizes for display ──────────────────────────────────────────────────
function sizeOrder(s) {
  const n = parseFloat(s);
  const isHalf = s.toString().endsWith('T');
  return n * 10 + (isHalf ? 1 : 0); // higher = larger size
}

export default function App() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [data, setData]             = useState(RAW_DATA);
  const [rawVisible, setRawVisible] = useState(false);
  const [tvMode, setTvMode]         = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters]       = useState({
    date:      '2026-10-05',
    machine:   '',
    model:     '',
    component: '',
  });

  // ── Derive filter options from current data ────────────────────────────────
  const options = useMemo(() => {
    const machines   = [...new Set(data.map(r => r.machine).filter(Boolean))];
    const models     = [...new Set(data.map(r => r.modelCode))];
    const components = [...new Set(data.map(r => r.component))];
    return { machines, models, components };
  }, [data]);

  // ── Filter rows ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const dateKey = inputToKey(filters.date); // YYYYMMDD
    return data.filter(r => {
      if (filters.date      && r.planDate   !== dateKey)        return false;
      if (filters.machine   && r.machine    !== filters.machine) return false;
      if (filters.model     && r.modelCode  !== filters.model)   return false;
      if (filters.component && r.component  !== filters.component) return false;
      return true;
    });
  }, [data, filters]);

  // ── Production qty overrides: key `${size}|${mat}|${cc}` → number ───────
  const [prodQty, setProdQty] = useState({});

  function handleCellEdit(size, mat, cc, val) {
    const key = `${size}|${mat}|${cc}`;
    setProdQty(prev => ({ ...prev, [key]: val }));
  }

  // ── Build pivot ────────────────────────────────────────────────────────────
  const pivot = useMemo(() => buildPivot(filtered), [filtered]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleFilterChange(key, value) {
    setFilters(f => ({ ...f, [key]: value }));
  }

  function handleImport(text) {
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        setData(prev => [...prev, ...json]);
        alert(`✅ Đã nhập ${json.length} dòng.`);
      } else {
        alert('❌ File JSON phải là một mảng (array).');
      }
    } catch {
      alert('❌ Không thể parse JSON. Vui lòng kiểm tra lại file.');
    }
  }

  function handleExportCSV() {
    const headers = ['planDate','modelCode','modelName','component','partNameVN','grade','material','colorCode','size','qty','color'];
    const rows    = filtered.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','));
    const csv     = [headers.join(','), ...rows].join('\n');
    const blob    = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = `cutting-plan-${filters.date || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Add Plan modal state ───────────────────────────────────────────────────
  const emptyForm = { planDate:'', modelCode:'', modelName:'', component:'', partNameVN:'', grade:'A', material:'', colorCode:'', size:'', qty:1, color:'WHITE' };
  const [form, setForm] = useState(emptyForm);

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'qty' ? Number(value) : value }));
  }

  function submitAdd() {
    if (!form.planDate || !form.modelCode || !form.material || !form.size) {
      alert('Vui lòng điền đầy đủ: Plan Date, Model Code, Material, Size.');
      return;
    }
    setData(prev => [...prev, { ...form, planDate: form.planDate.replace(/-/g,'') }]);
    setForm(emptyForm);
    setShowAddModal(false);
  }

  // ── Display date label ─────────────────────────────────────────────────────
  const dateLabel = filters.date
    ? `${filters.date} (${filters.date.replace(/-/g,'').slice(0,4)}/${filters.date.replace(/-/g,'').slice(4,6)}/${filters.date.replace(/-/g,'').slice(6,8)})`
    : 'Tất cả ngày';

  return (
    <div className={`app-shell ${tvMode ? 'tv-mode' : ''}`}>
      {/* ── Filter Bar ── */}
      <FilterBar filters={filters} options={options} onChange={handleFilterChange} />

      {/* ── Action Bar ── */}
      <ActionBar
        onAddPlan   ={() => { setForm({ ...emptyForm, planDate: filters.date }); setShowAddModal(true); }}
        onImport    ={handleImport}
        onExportCSV ={handleExportCSV}
        onToggleRaw ={() => setRawVisible(v => !v)}
        rawVisible  ={rawVisible}
        onToggleTV  ={() => setTvMode(v => !v)}
        tvMode      ={tvMode}
      />

      {/* ── Pivot Table ── */}
      {!rawVisible && (
        <div className="content-area">
          {filtered.length === 0 ? (
            <div className="empty-state">Không có dữ liệu cho bộ lọc hiện tại.</div>
          ) : (
            <PivotTable pivot={pivot} onCellEdit={handleCellEdit} />
          )}
        </div>
      )}

      {/* ── Raw Data Table ── */}
      {rawVisible && (
        <div className="content-area">
          <div className="table-scroll">
            <table className="raw-table">
              <thead>
                <tr>
                  {['Plan Date','Model Code','Model Name','Component','Part Name','Grade','Material','Color Code','Size','Qty','Color']
                    .map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i}>
                    <td>{r.planDate}</td>
                    <td>{r.modelCode}</td>
                    <td>{r.modelName}</td>
                    <td>{r.component}</td>
                    <td>{r.partNameVN}</td>
                    <td>{r.grade}</td>
                    <td>{r.material}</td>
                    <td>{r.colorCode}</td>
                    <td>{r.size}</td>
                    <td>{r.qty}</td>
                    <td>{r.color}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add Plan Modal ── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>＋ Thêm Kế Hoạch Mới</h3>
            <div className="modal-grid">
              {[
                ['Plan Date', 'planDate', 'date'],
                ['Model Code', 'modelCode', 'text'],
                ['Model Name', 'modelName', 'text'],
                ['Component', 'component', 'text'],
                ['Part Name (VN)', 'partNameVN', 'text'],
                ['Grade', 'grade', 'text'],
                ['Material', 'material', 'text'],
                ['Color Code', 'colorCode', 'text'],
                ['Size', 'size', 'text'],
                ['Qty', 'qty', 'number'],
                ['Color', 'color', 'text'],
              ].map(([label, name, type]) => (
                <React.Fragment key={name}>
                  <label>{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleFormChange}
                    step={type === 'number' ? '1' : undefined}
                  />
                </React.Fragment>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-green" onClick={submitAdd}>✔ Lưu</button>
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>✕ Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
