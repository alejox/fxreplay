// Config helpers live next to the component, as in RSISettings.jsx; the %B math lives in BollingerSettings.jsx
/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';

export const DEFAULT_BBPCT_CONFIG = {
  period: 20,
  stdDev: 2,
  upper: 1,
  lower: 0,
  color: '#ec4899',
  lineWidth: 2,
};

const LS_KEY = 'fxreplay_bbpct_config';

export function loadBBPctConfig() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_BBPCT_CONFIG;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.period > 0) return { ...DEFAULT_BBPCT_CONFIG, ...parsed };
  } catch { /* fall back to defaults */ }
  return DEFAULT_BBPCT_CONFIG;
}

export function saveBBPctConfig(config) {
  localStorage.setItem(LS_KEY, JSON.stringify(config));
}

const parseLevel = (value, fallback) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

export default function BollingerPercentBSettings({ config, onChange, onClose }) {
  const [draft, setDraft] = useState(() => ({ ...config }));

  const handleSave = () => {
    const cleaned = {
      period: parseInt(draft.period) || 20,
      stdDev: parseFloat(draft.stdDev) || 2,
      upper: parseLevel(draft.upper, 1),
      lower: parseLevel(draft.lower, 0),
      color: draft.color || DEFAULT_BBPCT_CONFIG.color,
      lineWidth: parseInt(draft.lineWidth) || 2,
    };
    if (cleaned.period < 1) return;
    saveBBPctConfig(cleaned);
    onChange(cleaned);
    onClose();
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_BBPCT_CONFIG });
  };

  return (
    <div className="fibo-settings-popover" style={{ width: '220px' }}>
      <div className="fibo-settings-header">
        <span className="fibo-settings-title">%B de Bollinger</span>
        <div className="flex items-center gap-1">
          <button onClick={handleReset} className="fibo-settings-icon-btn" title="Restaurar por defecto">
            <RotateCcw size={13} />
          </button>
          <button onClick={onClose} className="fibo-settings-icon-btn" title="Cerrar">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="fibo-settings-list">
        <div className="fibo-settings-row" style={{ gridTemplateColumns: '24px 1fr' }}>
          <input
            type="color"
            value={draft.color}
            onChange={(e) => setDraft({ ...draft, color: e.target.value })}
            className="fibo-color-input"
            title="Color"
            style={{ width: '20px', height: '20px' }}
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Período:</span>
            <input
              type="number"
              value={draft.period}
              onChange={(e) => setDraft({ ...draft, period: e.target.value })}
              min="1"
              max="500"
              className="fibo-value-input"
              style={{ width: '50px' }}
            />
          </div>
        </div>
        <div className="fibo-settings-row" style={{ gridTemplateColumns: '1fr' }}>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">Desv.:</span>
            <input
              type="number"
              value={draft.stdDev}
              onChange={(e) => setDraft({ ...draft, stdDev: e.target.value })}
              min="0.1"
              max="10"
              step="0.1"
              className="fibo-value-input"
              style={{ width: '45px' }}
            />
          </div>
        </div>
        <div className="fibo-settings-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">Superior:</span>
            <input
              type="number"
              value={draft.upper}
              onChange={(e) => setDraft({ ...draft, upper: e.target.value })}
              step="0.1"
              className="fibo-value-input"
              style={{ width: '45px' }}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">Inferior:</span>
            <input
              type="number"
              value={draft.lower}
              onChange={(e) => setDraft({ ...draft, lower: e.target.value })}
              step="0.1"
              className="fibo-value-input"
              style={{ width: '45px' }}
            />
          </div>
        </div>
      </div>

      <div className="fibo-settings-actions">
        <button onClick={onClose} className="fibo-cancel-btn">Cancelar</button>
        <button onClick={handleSave} className="fibo-save-btn">Guardar</button>
      </div>
    </div>
  );
}
