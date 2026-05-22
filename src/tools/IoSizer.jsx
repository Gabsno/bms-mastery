import { useState } from 'react';
import { ArrowLeft, Cpu, Minus, Plus } from 'lucide-react';

const SPARE = 0.2; // 20% spare I/O — the standard rule of thumb

const TYPES = [
  { key: 'AI', label: 'Analog Inputs', hint: 'sensors — temperature, pressure, humidity' },
  { key: 'AO', label: 'Analog Outputs', hint: 'modulating valves, dampers, VFD speed' },
  { key: 'DI', label: 'Digital Inputs', hint: 'status, alarms, dry contacts' },
  { key: 'DO', label: 'Digital Outputs', hint: 'relays — start/stop motors, coils' },
];

/**
 * Controller I/O Sizer — count the physical points an equipment item needs,
 * then see the count with the standard 20% spare added. A hands-on companion
 * to the controller-selection material in Modules 1, 5 and 7.
 */
export function IoSizer({ onBack }) {
  const [counts, setCounts] = useState({ AI: 6, AO: 4, DI: 6, DO: 4 });

  const setCount = (key, value) =>
    setCounts((c) => ({ ...c, [key]: Math.max(0, Math.min(999, Math.round(value) || 0)) }));

  const withSpare = (key) => Math.ceil(counts[key] * (1 + SPARE));
  const base = TYPES.reduce((s, t) => s + counts[t.key], 0);
  const sized = TYPES.reduce((s, t) => s + withSpare(t.key), 0);

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
          <Cpu className="text-cyan-400" />
          <h1 className="text-3xl font-bold tracking-tight">Controller I/O Sizer</h1>
        </div>
        <p className="text-slate-400 mb-8">
          Count the physical points an equipment item needs, then size the controller with the
          standard 20% spare. Never match a controller exactly to the point count.
        </p>

        <div className="space-y-3 mb-6">
          {TYPES.map((t) => (
            <div key={t.key} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-100">
                    <span className="font-mono text-cyan-400">{t.key}</span> · {t.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.hint}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setCount(t.key, counts[t.key] - 1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={counts[t.key]}
                    onChange={(e) => setCount(t.key, parseInt(e.target.value, 10))}
                    className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-center font-mono text-slate-100 outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => setCount(t.key, counts[t.key] + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2 font-mono">
                {counts[t.key]} points → <span className="text-cyan-400">{withSpare(t.key)}</span> with 20% spare
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Points needed</div>
            <div className="text-4xl font-bold font-mono text-slate-100">{base}</div>
          </div>
          <div className="bg-gradient-to-br from-cyan-950/50 to-slate-900 border border-cyan-800/50 rounded-2xl p-5">
            <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Size controller for</div>
            <div className="text-4xl font-bold font-mono text-cyan-300">{sized}</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-900/40 rounded-2xl p-5">
          <h3 className="text-cyan-300 font-semibold mb-2">Why size up</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Buildings change — tenants fit out, equipment gets added. Adding a point to a controller
            with spare I/O is trivial; adding one to a full controller means a new controller, panel
            space and a site visit. Pick a controller (or controller-plus-expansion) whose AI / AO /
            DI / DO capacities each cover the spared figures above.
          </p>
        </div>
      </div>
    </div>
  );
}
