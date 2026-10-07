import React, { useState, useEffect, useRef } from 'react';
import './PivotTable.css';

// ─── Màu xen kẽ cho ô có số (theo index color-code trong mỗi group) ─────────
// Giống ảnh mẫu: index chẵn → xanh lá, index lẻ → xanh dương
const CC_COLORS = ['#27ae60', '#2980b9']; // xanh lá, xanh dương

// ─── Màu header material (navy) + cột sub-total (cam) ────────────────────────
// Tất cả group dùng cùng tone như ảnh: header navy, sub-total cam
const MAT_HEADER_BG  = '#1a2744';   // navy đậm
const MAT_SUBTOT_BG  = '#e67e22';   // cam

// ─── Sub-header color-code row ────────────────────────────────────────────────
const CC_HEADER_BG   = '#4a5568';   // xám than

// ─── Legend ───────────────────────────────────────────────────────────────────
const LEGEND = [
  { color: '#27ae60', label: 'Đã nhập (Color 1)' },
  { color: '#2980b9', label: 'Đã nhập (Color 2)' },
  { color: '#fff',    label: 'Kế hoạch cắt', border: '#c0c7d0' },
];

// ══════════════════════════════════════════════════════════════════════════════
// Popup nhập số lượng
// ══════════════════════════════════════════════════════════════════════════════
function CellEditPopup({ info, onConfirm, onCancel }) {
  const { size, cc, mat, currentQty, maxQty, accentColor } = info;
  const [qty, setQty] = useState(currentQty);
  const inputRef      = useRef(null);

  useEffect(() => { inputRef.current?.select(); }, []);
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onCancel]);

  const clamp = n => Math.max(0, Math.min(maxQty, parseInt(n, 10) || 0));
  const pct   = maxQty > 0 ? Math.round((qty / maxQty) * 100) : 0;

  return (
    <div className="popup-overlay" onClick={onCancel}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="popup-hdr" style={{ background: accentColor }}>
          <span className="popup-hdr-title">Nhập Số Lượng Sản Xuất</span>
          <button className="popup-x" onClick={onCancel}>✕</button>
        </div>

        <div className="popup-body">

          {/* Dòng 1: Size + Color Code */}
          <div className="popup-row">
            <div className="popup-chip">
              <div className="popup-chip-lbl">Size</div>
              <div className="popup-chip-val" style={{ color: accentColor }}>{size}</div>
            </div>
            <div className="popup-chip">
              <div className="popup-chip-lbl">Color Code</div>
              <div className="popup-chip-val" style={{ color: accentColor }}>{cc}</div>
            </div>
          </div>

          {/* Dòng 2: Material */}
          <div className="popup-mat-row">
            <div className="popup-chip popup-chip-full">
              <div className="popup-chip-lbl">Material</div>
              <div className="popup-chip-val popup-chip-mat-val">{mat}</div>
            </div>
          </div>

          {/* Stepper */}
          <div className="popup-qty-wrap">
            <div className="popup-qty-meta">
              <span className="popup-qty-lbl">Số lượng sản xuất (pcs)</span>
              <span className="popup-qty-max">Tối đa: <b>{maxQty}</b></span>
            </div>
            <div className="popup-stepper" style={{ '--accent': accentColor }}>
              <button className="popup-step-btn" onClick={() => setQty(q => Math.max(0, q-1))} disabled={qty <= 0}>−</button>
              <input
                ref={inputRef}
                type="number" min="0" max={maxQty}
                className="popup-step-input"
                value={qty}
                onChange={e => setQty(clamp(e.target.value))}
                onKeyDown={e => { if (e.key === 'Enter') onConfirm(qty); }}
              />
              <button className="popup-step-btn" onClick={() => setQty(q => Math.min(maxQty, q+1))} disabled={qty >= maxQty}>＋</button>
            </div>
            {/* Progress */}
            <div className="popup-prog-track">
              <div className="popup-prog-fill" style={{
                width: `${pct}%`,
                background: pct === 100 ? '#27ae60' : pct >= 50 ? '#2980b9' : '#e67e22',
              }} />
            </div>
            <div className="popup-prog-label">{qty} / {maxQty} ({pct}%)</div>
          </div>

          {/* Buttons */}
          <div className="popup-actions">
            <button className="popup-btn-cancel" onClick={onCancel}>✕ Hủy</button>
            <button className="popup-btn-ok" style={{ background: accentColor }} onClick={() => onConfirm(qty)}>
              ✔ Xác nhận
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PivotTable
// ══════════════════════════════════════════════════════════════════════════════
export default function PivotTable({ pivot, onCellEdit }) {
  const [popupInfo, setPopupInfo] = useState(null);
  const [cellData,  setCellData]  = useState({});   // key → prodQty

  if (!pivot) return null;
  const { materials, sizes, cells, totals } = pivot;

  const key = (size, mat, cc) => `${size}|${mat}|${cc}`;

  function openPopup(size, mat, cc, baseQty, ccIdx) {
    if (baseQty <= 0) return;
    setPopupInfo({
      size, mat, cc,
      currentQty:  cellData[key(size, mat, cc)] ?? 0,
      maxQty:      baseQty,
      accentColor: CC_COLORS[ccIdx % CC_COLORS.length],
    });
  }

  function handleConfirm(qty) {
    const k = key(popupInfo.size, popupInfo.mat, popupInfo.cc);
    setCellData(prev => ({ ...prev, [k]: qty }));
    onCellEdit?.(popupInfo.size, popupInfo.mat, popupInfo.cc, qty);
    setPopupInfo(null);
  }

  return (
    <div className="pt-wrapper">

      {/* Legend */}
      <div className="pt-legend">
        {LEGEND.map(l => (
          <div key={l.label} className="pt-leg-item">
            <span className="pt-leg-dot" style={{ background: l.color, border: l.border ? `1px solid ${l.border}` : 'none' }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="pt-scroll">
        <table className="pt-tbl">
          <thead>
            {/* Row 1: Size | G-Total | Material groups */}
            <tr>
              <th rowSpan={2} className="th-fixed th-size">Size</th>
              <th rowSpan={2} className="th-fixed th-gtot">G-Total</th>
              {materials.map(mat => (
                <th key={mat.label}
                  colSpan={mat.colorCodes.length + 1}
                  className="th-mat">
                  {mat.label}
                </th>
              ))}
            </tr>
            {/* Row 2: color codes + Total */}
            <tr>
              {materials.map(mat => [
                ...mat.colorCodes.map((cc, ci) => (
                  <th key={`${mat.label}-${cc}`} className="th-cc">{cc}</th>
                )),
                <th key={`${mat.label}-tot`} className="th-subtot">Total</th>,
              ])}
            </tr>
          </thead>

          <tbody>
            {sizes.map((size, si) => {
              const row = cells[size] || {};
              return (
                <tr key={size} className={si % 2 === 0 ? 'tr-even' : 'tr-odd'}>
                  <td className="td-fixed td-size">{size}</td>
                  <td className="td-fixed td-gtot">{row.gTotal > 0 ? row.gTotal : ''}</td>

                  {materials.map(mat => {
                    const mr = row[mat.label] || {};
                    return [
                      ...mat.colorCodes.map((cc, ci) => {
                        const base    = mr[cc] || 0;
                        const prod    = cellData[key(size, mat.label, cc)] ?? 0;
                        const hasData = base > 0;
                        const hasProd = prod > 0;
                        const accent  = CC_COLORS[ci % CC_COLORS.length];

                        // ô đã nhập SL → màu accent; có plan → số màu accent nền trong; không có → trống, không đổi màu
                        const bg  = hasProd ? accent : undefined;   // không set bg → kế thừa tr-even/tr-odd
                        const fg  = hasProd ? '#fff'  : hasData ? accent : undefined;

                        return (
                          <td key={key(size, mat.label, cc)}
                            className={`td-cell ${hasData ? 'td-clickable' : 'td-no-data'} ${hasProd ? 'td-prod' : ''}`}
                            style={{ ...(bg ? { background: bg } : {}), ...(fg ? { color: fg } : {}) }}
                            onClick={() => openPopup(size, mat.label, cc, base, ci)}
                            title={hasData ? `Kế hoạch: ${base} | Click để nhập SL SX` : undefined}
                          >
                            {hasData ? (hasProd ? prod : base) : ''}
                          </td>
                        );
                      }),

                      // Sub-total column
                      <td key={`${size}-${mat.label}-tot`}
                        className="td-subtot"
                        style={{ background: mr.matTotal > 0 ? MAT_SUBTOT_BG : '', color: mr.matTotal > 0 ? '#fff' : '' }}>
                        {mr.matTotal > 0 ? mr.matTotal : ''}
                      </td>,
                    ];
                  })}
                </tr>
              );
            })}

            {/* Total row */}
            <tr className="tr-total">
              <td className="td-fixed td-tot-label">Total</td>
              <td className="td-fixed td-tot-gtot">{totals.gTotal || ''}</td>
              {materials.map(mat => {
                const mt = totals[mat.label] || {};
                return [
                  ...mat.colorCodes.map((cc, ci) => (
                    <td key={`tot-${mat.label}-${cc}`} className="td-tot-cell">
                      {mt[cc] > 0 ? mt[cc] : ''}
                    </td>
                  )),
                  <td key={`tot-${mat.label}-sub`}
                    className="td-tot-sub"
                    style={{ background: MAT_SUBTOT_BG }}>
                    {mt.matTotal > 0 ? mt.matTotal : ''}
                  </td>,
                ];
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pt-hint">
        💡 <b>Click</b> vào ô có số để nhập SL sản xuất &nbsp;|&nbsp; Ô xám nhạt = không có kế hoạch
      </div>

      {popupInfo && (
        <CellEditPopup info={popupInfo} onConfirm={handleConfirm} onCancel={() => setPopupInfo(null)} />
      )}
    </div>
  );
}
