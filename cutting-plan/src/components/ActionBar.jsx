import React, { useRef } from 'react';
import './ActionBar.css';

export default function ActionBar({ onAddPlan, onImport, onExportCSV, onToggleRaw, rawVisible, onToggleTV, tvMode }) {
  const fileRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onImport(ev.target.result);
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  }

  return (
    <div className="action-bar">
      <div className="action-left">
        <button className="btn btn-green" onClick={onAddPlan}>
          ＋ Thêm Kế Hoạch (Add Plan)
        </button>

        <button className="btn btn-blue" onClick={() => fileRef.current.click()}>
          ⬆ Nhập / Dán Dữ Liệu JSON (Import)
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <button className="btn btn-outline" onClick={onExportCSV}>
          📄 Xuất CSV
        </button>

        <button
          className={`btn btn-outline ${rawVisible ? 'btn-active' : ''}`}
          onClick={onToggleRaw}
        >
          🗂 Dữ liệu gốc
        </button>
      </div>

      <div className="action-right">
        <button
          className={`btn btn-outline tv-btn ${tvMode ? 'btn-active' : ''}`}
          onClick={onToggleTV}
        >
          🖥 Chế Độ TV Xưởng Cắt
        </button>
      </div>
    </div>
  );
}
