import { useState } from 'react';
import { ArrowLeft, Gauge } from 'lucide-react';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const num = (v, fallback) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Signal Converter — shows how a control signal is fundamentally a 0–100%
 * level, and how that maps onto the common BMS standards (0–10V, 4–20mA) and
 * an engineering range. A hands-on companion to the Module 1 signals lesson.
 */
export function SignalConverter({ onBack }) {
  const [pct, setPct] = useState(50);
  const [engMin, setEngMin] = useState('0');
  const [engMax, setEngMax] = useState('50');
  const [unit, setUnit] = useState('°C');

  const lo = num(engMin, 0);
  const hi = num(engMax, 100);
  const volts = (pct / 100) * 10;
  const ma = 4 + (pct / 100) * 16;
  const eng = lo + (pct / 100) * (hi - lo);

  const Readout = ({ label, value, suffix, hint }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-3xl font-bold font-mono text-cyan-300">
        {value}
        <span className="text-lg text-slate-500"> {suffix}</span>
      </div>
      <div className="text-xs text-slate-500 mt-1">{hint}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition"
      >
        <ArrowLeft size={18} /> back to tools
      </button>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Gauge className="text-cyan-400" />
          <h1 className="text-3xl font-bold tracking-tight">Signal Converter</h1>
        </div>
        <p className="text-slate-400 mb-8">
          Every analog control signal is really just a 0–100% level. Drag the level and watch how
          it maps onto the standards a BMS controller actually wires.
        </p>

        {/* Master level control */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-sm text-slate-300">Signal level</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={100}
                value={Math.round(pct)}
                onChange={(e) => setPct(clamp(num(e.target.value, 0), 0, 100))}
                className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right font-mono text-cyan-400 outline-none focus:border-cyan-500"
              />
              <span className="text-cyan-400 font-mono">%</span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={pct}
            onChange={(e) => setPct(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        {/* Live conversions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <Readout label="0–10 V signal" value={volts.toFixed(2)} suffix="V" hint="0V = 0%, 10V = 100%" />
          <Readout label="4–20 mA signal" value={ma.toFixed(2)} suffix="mA" hint="4mA = 0%, 20mA = 100%" />
          <Readout
            label="Engineering value"
            value={eng.toFixed(1)}
            suffix={unit}
            hint={`${lo}${unit} = 0%, ${hi}${unit} = 100%`}
          />
        </div>

        {/* Engineering range config */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
          <div className="text-sm text-slate-400 mb-3">Engineering range (what the sensor reads)</div>
          <div className="grid grid-cols-3 gap-3">
            <label className="text-xs text-slate-500">
              Min
              <input
                type="number"
                value={engMin}
                onChange={(e) => setEngMin(e.target.value)}
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded px-2 py-2 font-mono text-slate-100 outline-none focus:border-cyan-500"
              />
            </label>
            <label className="text-xs text-slate-500">
              Max
              <input
                type="number"
                value={engMax}
                onChange={(e) => setEngMax(e.target.value)}
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded px-2 py-2 font-mono text-slate-100 outline-none focus:border-cyan-500"
              />
            </label>
            <label className="text-xs text-slate-500">
              Unit
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded px-2 py-2 font-mono text-slate-100 outline-none focus:border-cyan-500"
              />
            </label>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-900/40 rounded-2xl p-5">
          <h3 className="text-cyan-300 font-semibold mb-2">How it maps</h3>
          <ul className="space-y-1.5 text-sm text-slate-300">
            <li>Volts = level ÷ 100 × 10</li>
            <li>mA = 4 + (level ÷ 100 × 16)</li>
            <li>Engineering = min + (level ÷ 100 × (max − min))</li>
          </ul>
          <p className="text-xs text-slate-500 mt-3">
            To go the other way — say you measured 14 mA — the level is (14 − 4) ÷ 16 × 100 = 62.5%.
          </p>
        </div>
      </div>
    </div>
  );
}
