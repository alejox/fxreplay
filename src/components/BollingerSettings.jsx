// Config helpers and calculation live next to the component, as in MovingAverageSettings.jsx
/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';

export const DEFAULT_BB_CONFIG = {
  period: 20,
  stdDev: 2,
  middleColor: '#facc15',
  bandColor: '#22d3ee',
  lineWidth: 1,
};

const LS_KEY = 'fxreplay_bb_config';

export function loadBBConfig() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_BB_CONFIG;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.period > 0) return { ...DEFAULT_BB_CONFIG, ...parsed };
  } catch { /* fall back to defaults */ }
  return DEFAULT_BB_CONFIG;
}

export function saveBBConfig(config) {
  localStorage.setItem(LS_KEY, JSON.stringify(config));
}

// Middle = SMA(close, period); upper/lower = middle ± stdDev × population std deviation
function calculateBollinger(data, period = 20, stdDev = 2) {
  const result = { upper: [], middle: [], lower: [] };
  if (!data || period < 1 || data.length < period) return result;
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    const mean = sum / period;
    let sqSum = 0;
    for (let j = 0; j < period; j++) {
      const diff = data[i - j].close - mean;
      sqSum += diff * diff;
    }
    const offset = stdDev * Math.sqrt(sqSum / period);
    const time = data[i].time;
    result.middle.push({ time, value: mean });
    result.upper.push({ time, value: mean + offset });
    result.lower.push({ time, value: mean - offset });
  }
  return result;
}

export { calculateBollinger };

export default function BollingerSettings({ config, onChange, onClose }) {
  const [draft, setDraft] = useState(() => ({ ...config }));

  const handleSave = () => {
    const cleaned = {
      period: parseInt(draft.period) || 20,
      stdDev: parseFloat(draft.stdDev) || 2,
      middleColor: draft.middleColor || DEFAULT_BB_CONFIG.middleColor,
      bandColor: draft.bandColor || DEFAULT_BB_CONFIG.bandColor,
      lineWidth: parseInt(draft.lineWidth) || 1,
    };
    if (cleaned.period < 1) return;
    saveBBConfig(cleaned);
    onChange(cleaned);
    onClose();
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_BB_CONFIG });
  };

  return (
    <div className="fibo-settings-popover" style={{ width: '240px' }}>
      <div className="fibo-settings-header">
        <span className="fibo-settings-title">Bandas de Bollinger</span>
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
        <div className="fibo-settings-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">Período:</span>
            <input
              type="number"
              value={draft.period}
              onChange={(e) => setDraft({ ...draft, period: e.target.value })}
              min="1"
              max="500"
              className="fibo-value-input"
              style={{ width: '45px' }}
            />
          </div>
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
        <div className="fibo-settings-row" style={{ gridTemplateColumns: '24px 1fr' }}>
          <input
            type="color"
            value={draft.middleColor}
            onChange={(e) => setDraft({ ...draft, middleColor: e.target.value })}
            className="fibo-color-input"
            title="Color"
            style={{ width: '20px', height: '20px' }}
          />
          <span className="text-[10px] text-slate-400">Banda media</span>
        </div>
        <div className="fibo-settings-row" style={{ gridTemplateColumns: '24px 1fr' }}>
          <input
            type="color"
            value={draft.bandColor}
            onChange={(e) => setDraft({ ...draft, bandColor: e.target.value })}
            className="fibo-color-input"
            title="Color"
            style={{ width: '20px', height: '20px' }}
          />
          <span className="text-[10px] text-slate-400">Bandas superior / inferior</span>
        </div>
      </div>

      <div className="fibo-settings-actions">
        <button onClick={onClose} className="fibo-cancel-btn">Cancelar</button>
        <button onClick={handleSave} className="fibo-save-btn">Guardar</button>
      </div>
    </div>
  );
}
