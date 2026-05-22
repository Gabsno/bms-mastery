import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Flame, Trophy, Zap, BookOpen, Sparkles, ChevronRight, Check, X, RotateCcw,
  Send, ArrowLeft, Sliders, Brain, Target, Coffee, Layers, Settings, KeyRound,
  Gauge, Cpu, Wrench,
} from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { LESSONS } from './lessons.js';
import { AccessGate } from './components/AccessGate.jsx';
import { LibraryView } from './components/LibraryView.jsx';
import { SignalConverter } from './tools/SignalConverter.jsx';
import { IoSizer } from './tools/IoSizer.jsx';
import { trackEvent } from './lib/analytics.js';

// ============================================================================
// CONSTANTS
// ============================================================================

// --- AI Tutor providers -----------------------------------------------------
// Gemini has a genuinely free tier (no credit card); Anthropic is pay-as-you-go.
const PROVIDER_STORAGE = 'bms_ai_provider';
const LEGACY_ANTHROPIC_KEY = 'bms_anthropic_key';
const GEMINI_MODEL = 'gemini-2.0-flash';
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';
const DEFAULT_PROVIDER = 'gemini';
const AI_PROVIDERS = {
  gemini: {
    label: 'Google Gemini',
    badge: 'free',
    keyStorage: 'bms_key_gemini',
    placeholder: 'AIza...',
    signup: 'aistudio.google.com/apikey',
    note: 'Free — no credit card. Sign in with any Google account, create an API key, and paste it here.',
  },
  anthropic: {
    label: 'Anthropic Claude',
    badge: 'paid',
    keyStorage: 'bms_key_anthropic',
    placeholder: 'sk-ant-...',
    signup: 'console.anthropic.com',
    note: 'Pay-as-you-go — needs billing set up. Slightly sharper answers, but not free.',
  },
};
const STATE_STORAGE = 'bms_mastery_v2';
const OLD_STATE_STORAGE = 'bms_mastery_v1';
const DAY = 86400000;
const SR_STEPS = [1, 3, 7, 21]; // spaced-repetition intervals, in days

// ============================================================================
// STORAGE — progress persists in localStorage
// ============================================================================

const loadState = () => {
  try {
    const raw = localStorage.getItem(STATE_STORAGE) || localStorage.getItem(OLD_STATE_STORAGE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveState = (s) => {
  try {
    localStorage.setItem(STATE_STORAGE, JSON.stringify(s));
  } catch {
    /* storage full or blocked — progress just won't persist */
  }
};

const freshState = () => ({
  v: 2,
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  completedLessons: [],
  quizScores: {},
  cards: {},
  currentLesson: 'L1',
});

const initialState = () => {
  const loaded = loadState();
  if (!loaded) return freshState();
  // merge so older saves (which had no `cards`) still load cleanly
  return { ...freshState(), ...loaded, cards: loaded.cards || {}, v: 2 };
};

// ============================================================================
// SPACED REPETITION — every quiz question becomes a flashcard
// ============================================================================

const nowMs = () => Date.now();

// card key = `${lessonId}#${quizIndex}`
function addCardsForLesson(cards, lesson) {
  const next = { ...cards };
  lesson.quiz.forEach((_, qIdx) => {
    const key = `${lesson.id}#${qIdx}`;
    if (!next[key]) {
      next[key] = { lessonId: lesson.id, qIdx, step: 0, due: nowMs() + SR_STEPS[0] * DAY, mastered: false };
    }
  });
  return next;
}

function dueCards(state) {
  const t = nowMs();
  return Object.entries(state.cards || {})
    .filter(([, c]) => !c.mastered && c.due <= t)
    .map(([key, c]) => ({ key, ...c }))
    .filter((c) => {
      const lesson = LESSONS.find((l) => l.id === c.lessonId);
      return lesson && lesson.quiz[c.qIdx];
    });
}

function rescheduleCard(card, grade) {
  if (grade === 'again') {
    return { ...card, step: 0, due: nowMs() + SR_STEPS[0] * DAY, mastered: false };
  }
  const last = SR_STEPS.length - 1;
  if (grade === 'easy' && card.step >= last) {
    return { ...card, mastered: true, due: nowMs() + 365 * DAY };
  }
  let step = card.step;
  if (grade === 'good') step = Math.min(step + 1, last);
  if (grade === 'easy') step = Math.min(step + 2, last);
  return { ...card, step, mastered: false, due: nowMs() + SR_STEPS[step] * DAY };
}

function studyDayUpdate(state) {
  const today = new Date().toDateString();
  if (state.lastStudyDate === today) return { streak: state.streak, lastStudyDate: today };
  const wasYesterday =
    state.lastStudyDate && (new Date(today) - new Date(state.lastStudyDate)) / DAY <= 1.5;
  return { streak: wasYesterday ? state.streak + 1 : 1, lastStudyDate: today };
}

// ============================================================================
// PID SIMULATOR — the centerpiece interactive
// ============================================================================

function PIDSimulator({ onBack }) {
  const [p, setP] = useState(2.0);
  const [i, setI] = useState(0.3);
  const [d, setD] = useState(0.0);
  const [setpoint, setSetpoint] = useState(13);
  const [running, setRunning] = useState(true);
  const [disturbance, setDisturbance] = useState(false);
  const canvasRef = useRef(null);
  const stateRef = useRef({
    pv: 24, // start at 24°C (hot day, AHU just kicked on)
    integral: 0,
    lastError: 0,
    output: 0,
    history: [],
    t: 0,
  });

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const s = stateRef.current;
      const error = setpoint - s.pv;
      s.integral += error * 0.5; // dt = 0.5s
      s.integral = Math.max(-50, Math.min(50, s.integral)); // anti-windup
      const deriv = (error - s.lastError) / 0.5;
      s.lastError = error;

      // PID output: 0 = valve closed (no cooling), 100 = valve open (max cooling)
      // error is negative when PV > SP (too hot), so output should be positive when error is negative
      let output = -(p * error + i * s.integral + d * deriv);
      output = Math.max(0, Math.min(100, output));
      s.output = output;

      // Process model: 1st-order lag. Valve cools, ambient warms.
      const k_cool = 0.6; // cooling capacity coefficient
      const k_warm = disturbance ? 0.25 : 0.15; // ambient heat gain
      const dT = (-k_cool * (output / 100) + k_warm) * 0.5;
      s.pv += dT;
      s.pv += (Math.random() - 0.5) * 0.05; // small sensor noise

      s.t += 0.5;
      s.history.push({ t: s.t, pv: s.pv, sp: setpoint, output });
      if (s.history.length > 240) s.history.shift();

      drawChart();
    }, 100);
    return () => clearInterval(interval);
  }, [p, i, d, setpoint, running, disturbance]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(180, 200, 220, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += W / 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += H / 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    const hist = stateRef.current.history;
    if (hist.length < 2) return;

    const yMin = 8;
    const yMax = 30;
    const toX = (idx) => (idx / 240) * W;
    const toY = (v) => H - ((v - yMin) / (yMax - yMin)) * H;

    ctx.strokeStyle = '#22d3ee';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, toY(setpoint));
    ctx.lineTo(W, toY(setpoint));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    hist.forEach((pt, idx) => {
      const x = toX(idx);
      const y = toY(pt.pv);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = 'rgba(74, 222, 128, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    hist.forEach((pt, idx) => {
      const x = toX(idx);
      const y = H - (pt.output / 100) * H;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText(`PV: ${stateRef.current.pv.toFixed(2)}°C`, 10, 20);
    ctx.fillText(`SP: ${setpoint.toFixed(1)}°C`, 10, 36);
    ctx.fillText(`Valve: ${stateRef.current.output.toFixed(1)}%`, 10, 52);
    ctx.fillText(`Error: ${(setpoint - stateRef.current.pv).toFixed(2)}°C`, 10, 68);
  };

  const reset = () => {
    stateRef.current = { pv: 24, integral: 0, lastError: 0, output: 0, history: [], t: 0 };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition">
        <ArrowLeft size={18} /> back
      </button>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Sliders className="text-cyan-400" />
          <h1 className="text-3xl font-bold tracking-tight">PID Lab</h1>
        </div>
        <p className="text-slate-400 mb-8">
          A simulated AHU cooling loop. Setpoint is the target supply air temperature. The valve modulates between 0%
          (no cooling) and 100% (max cooling). Watch how P, I, D affect the loop.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
          <canvas ref={canvasRef} width={920} height={320} className="w-full rounded-lg bg-slate-950" />
          <div className="flex gap-6 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-orange-400" />Process Variable (temp)</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-cyan-400" />Setpoint</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-400/50" />Valve output</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Slider label="P (Proportional)" value={p} setValue={setP} min={0} max={10} step={0.1} hint="How hard to push proportional to current error" />
          <Slider label="I (Integral)" value={i} setValue={setI} min={0} max={2} step={0.05} hint="How hard to push for persistent error" />
          <Slider label="D (Derivative)" value={d} setValue={setD} min={0} max={3} step={0.05} hint="How hard to dampen fast changes" />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Slider label="Setpoint" value={setpoint} setValue={setSetpoint} min={8} max={20} step={0.5} hint="Target supply air temperature" unit="°C" />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="text-sm text-slate-400 mb-3">Disturbance</div>
            <button
              onClick={() => setDisturbance(!disturbance)}
              className={`w-full px-4 py-2 rounded-lg transition ${
                disturbance
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {disturbance ? 'Sun load ON (heat gain doubled)' : 'Sun load OFF'}
            </button>
            <p className="text-xs text-slate-500 mt-2">Toggle to simulate sudden ambient heat (e.g. solar gain through facade)</p>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <button onClick={() => setRunning(!running)} className="px-4 py-2 bg-cyan-500 text-slate-950 font-semibold rounded-lg hover:bg-cyan-400 transition">
            {running ? 'Pause' : 'Resume'}
          </button>
          <button onClick={reset} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition flex items-center gap-2">
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-900/40 rounded-2xl p-5">
          <h3 className="text-cyan-300 font-semibold mb-3 flex items-center gap-2"><Brain size={18} /> Experiments to try</h3>
          <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
            <li>Set I = 0, D = 0. Vary P from 0.5 to 10. Notice: low P = slow, high P = oscillation. There&apos;s no P that gives zero offset.</li>
            <li>P = 2, D = 0. Add I = 0.3. Watch the loop slowly close the remaining offset.</li>
            <li>Push P high (8+) and watch the loop oscillate. Now add D = 0.5 to dampen it.</li>
            <li>Stable loop, then toggle the sun load. See how fast the system rejects the disturbance — that&apos;s your tuning quality in real life.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, setValue, min, max, step, hint, unit }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="font-mono text-cyan-400">{Number(value).toFixed(step < 1 ? 2 : 1)}{unit || ''}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="w-full accent-cyan-500"
      />
      <p className="text-xs text-slate-500 mt-2">{hint}</p>
    </div>
  );
}

// ============================================================================
// DIAGRAMS (used inside lessons)
// ============================================================================

function TierDiagram() {
  return (
    <div className="my-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/20 border border-purple-700/40 rounded-lg p-3 text-center">
          <div className="text-purple-300 font-semibold text-sm">Tier 3 — Supervisory Layer</div>
          <div className="text-xs text-slate-400 mt-1">Servers • Dashboards • Trends • Alarms • Reports</div>
        </div>
        <div className="flex justify-center"><div className="text-slate-600">↕</div></div>
        <div className="bg-gradient-to-r from-cyan-900/40 to-cyan-800/20 border border-cyan-700/40 rounded-lg p-3 text-center">
          <div className="text-cyan-300 font-semibold text-sm">Tier 2 — Automation Layer</div>
          <div className="text-xs text-slate-400 mt-1">DDC Controllers • JACEs • Programmable Logic • Schedules</div>
        </div>
        <div className="flex justify-center"><div className="text-slate-600">↕</div></div>
        <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 border border-emerald-700/40 rounded-lg p-3 text-center">
          <div className="text-emerald-300 font-semibold text-sm">Tier 1 — Field Layer</div>
          <div className="text-xs text-slate-400 mt-1">Sensors • Actuators • Valves • Dampers • VFDs • Meters</div>
        </div>
      </div>
    </div>
  );
}

function AHUDiagram() {
  const stages = [
    ['Outside Air', 'OA damper'],
    ['Mixing Box', 'MAT sensor'],
    ['Filters', 'filter DP'],
    ['Cooling Coil', 'CHW valve'],
    ['Heating Coil', 'HW valve'],
    ['Supply Fan', 'VFD speed'],
    ['Supply Air', 'SAT sensor'],
  ];
  return (
    <div className="my-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
      <div className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mb-4">AHU air path</div>
      <div className="flex flex-wrap items-center gap-2">
        {stages.map(([name, sub], idx) => (
          <div key={name} className="flex items-center gap-2">
            <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-center min-w-[96px]">
              <div className="text-sm font-semibold text-slate-100">{name}</div>
              <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">{sub}</div>
            </div>
            {idx < stages.length - 1 && <span className="text-slate-600 font-bold">→</span>}
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-500 mt-3">
        Air always flows in this order. The SAT sensor at the end is the AHU&apos;s main feedback point.
      </div>
    </div>
  );
}

// ============================================================================
// LESSON RENDERER
// ============================================================================

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-cyan-300 font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function QuizQuestion({ question, selected, revealed, onSelect }) {
  return (
    <div className="space-y-2">
      {question.options.map((opt, idx) => {
        const isSelected = selected === idx;
        const isCorrect = idx === question.correct;
        let cls = 'border-slate-700 bg-slate-800/50 hover:border-slate-600';
        if (revealed) {
          if (isCorrect) cls = 'border-green-500 bg-green-500/10';
          else if (isSelected) cls = 'border-red-500 bg-red-500/10';
          else cls = 'border-slate-800 bg-slate-900 opacity-60';
        } else if (isSelected) {
          cls = 'border-cyan-500 bg-cyan-500/10';
        }
        return (
          <button
            key={idx}
            onClick={() => !revealed && onSelect(idx)}
            disabled={revealed}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition flex items-center gap-3 ${cls}`}
          >
            <span className="flex-1 text-slate-200">{opt}</span>
            {revealed && isCorrect && <Check size={18} className="text-green-400" />}
            {revealed && isSelected && !isCorrect && <X size={18} className="text-red-400" />}
          </button>
        );
      })}
    </div>
  );
}

function LessonView({ lesson, onComplete, onBack, onAskTutor }) {
  const [stage, setStage] = useState('content'); // content | quiz | done
  const [quizIdx, setQuizIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    trackEvent('lesson-started:' + lesson.id);
  }, [lesson.id]);

  const submitAnswer = () => {
    if (selected === null) return;
    setRevealed(true);
    if (selected === lesson.quiz[quizIdx].correct) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (quizIdx + 1 < lesson.quiz.length) {
      setQuizIdx(quizIdx + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setStage('done');
    }
  };

  const passingScore = lesson.isBoss
    ? Math.ceil(lesson.quiz.length * 0.75)
    : Math.ceil(lesson.quiz.length * 0.6);
  const passed = score >= passingScore;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition">
          <ArrowLeft size={18} /> back to home
        </button>

        <div className="text-xs text-slate-500 mb-2 font-mono">
          MODULE {lesson.moduleNum} · {lesson.module.toUpperCase()} · {lesson.duration} MIN
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-white">{lesson.title}</h1>

        {stage === 'content' && (
          <>
            <div className="bg-gradient-to-br from-orange-950/30 to-slate-900 border border-orange-900/30 rounded-2xl p-5 mb-8">
              <div className="text-xs uppercase tracking-widest text-orange-400 font-semibold mb-2">Hook</div>
              <p className="text-slate-200 leading-relaxed">{lesson.hook}</p>
            </div>

            <div className="prose prose-invert max-w-none space-y-4">
              {lesson.content.map((block, idx) => {
                if (block.type === 'h3')
                  return <h3 key={idx} className="text-xl font-bold text-cyan-300 mt-8 mb-3">{block.text}</h3>;
                if (block.type === 'p')
                  return <p key={idx} className="text-slate-300 leading-relaxed">{renderInline(block.text)}</p>;
                if (block.type === 'bullets')
                  return (
                    <ul key={idx} className="space-y-2">
                      {block.items.map((item, i) => (
                        <li key={i} className="flex gap-3 text-slate-300 leading-relaxed">
                          <span className="text-cyan-500 mt-1.5 flex-shrink-0">▸</span>
                          <span>{renderInline(item)}</span>
                        </li>
                      ))}
                    </ul>
                  );
                if (block.type === 'callout')
                  return (
                    <div key={idx} className="bg-cyan-950/30 border-l-4 border-cyan-500 rounded-r-lg p-4 my-5">
                      <p className="text-cyan-100 italic leading-relaxed">{renderInline(block.text)}</p>
                    </div>
                  );
                if (block.type === 'diagram' && block.kind === 'tiers') return <TierDiagram key={idx} />;
                if (block.type === 'diagram' && block.kind === 'ahu') return <AHUDiagram key={idx} />;
                return null;
              })}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setStage('quiz')}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-4 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Target size={18} /> Quick Check ({lesson.quiz.length} questions)
              </button>
              <button
                onClick={() => onAskTutor(lesson)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-4 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Sparkles size={18} /> Ask the Tutor
              </button>
            </div>
          </>
        )}

        {stage === 'quiz' && (
          <div>
            <div className="text-xs text-slate-500 mb-3 font-mono">
              QUESTION {quizIdx + 1} OF {lesson.quiz.length} · SCORE {score}
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <p className="text-lg text-slate-100 mb-6 leading-relaxed">{lesson.quiz[quizIdx].q}</p>
              <QuizQuestion
                question={lesson.quiz[quizIdx]}
                selected={selected}
                revealed={revealed}
                onSelect={setSelected}
              />
            </div>
            {!revealed ? (
              <button
                onClick={submitAnswer}
                disabled={selected === null}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-6 py-4 rounded-xl transition"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-4 rounded-xl transition flex items-center justify-center gap-2"
              >
                {quizIdx + 1 < lesson.quiz.length ? 'Next question' : 'See result'} <ChevronRight size={18} />
              </button>
            )}
          </div>
        )}

        {stage === 'done' && (
          <div className="text-center py-8">
            <div className={`inline-block p-6 rounded-full mb-6 ${passed ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
              {passed ? <Trophy size={56} className="text-green-400" /> : <RotateCcw size={56} className="text-orange-400" />}
            </div>
            <h2 className="text-3xl font-bold mb-3">{passed ? 'Lesson Complete' : 'Almost there'}</h2>
            <p className="text-xl text-slate-300 mb-8">
              Score: <span className="text-cyan-400 font-mono">{score}/{lesson.quiz.length}</span>
            </p>
            <div className="max-w-md mx-auto bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-900/40 rounded-2xl p-5 mb-8 text-left">
              <div className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mb-2">Key takeaway</div>
              <p className="text-slate-100">{lesson.takeaway}</p>
            </div>
            {passed ? (
              <button
                onClick={() => onComplete(lesson, score)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition inline-flex items-center gap-2"
              >
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={() => {
                  setStage('content');
                  setQuizIdx(0);
                  setScore(0);
                  setSelected(null);
                  setRevealed(false);
                }}
                className="bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition inline-flex items-center gap-2"
              >
                <RotateCcw size={18} /> Try again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// FLASHCARD REVIEW — spaced repetition
// ============================================================================

function FlashcardReview({ queue, onFinish, onBack }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [grades, setGrades] = useState({});
  const [stage, setStage] = useState(queue.length === 0 ? 'empty' : 'review');

  if (stage === 'empty') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-3xl mx-auto p-4 md:p-8">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition">
            <ArrowLeft size={18} /> back to home
          </button>
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full mb-6 bg-green-500/20">
              <Check size={56} className="text-green-400" />
            </div>
            <h2 className="text-3xl font-bold mb-3">All caught up</h2>
            <p className="text-slate-400 mb-8">No flashcards are due right now. Finish a lesson to add cards, or check back later.</p>
            <button onClick={onBack} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition">
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const card = queue[idx];
  const lesson = LESSONS.find((l) => l.id === card.lessonId);
  const question = lesson.quiz[card.qIdx];
  const isCorrect = revealed && selected === question.correct;

  const grade = (g) => {
    const nextGrades = { ...grades, [card.key]: g };
    setGrades(nextGrades);
    if (idx + 1 < queue.length) {
      setIdx(idx + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setGrades(nextGrades);
      setStage('summary');
    }
  };

  if (stage === 'summary') {
    const total = Object.keys(grades).length;
    const right = Object.values(grades).filter((g) => g !== 'again').length;
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-3xl mx-auto p-4 md:p-8">
          <div className="text-center py-12">
            <div className="inline-block p-6 rounded-full mb-6 bg-cyan-500/20">
              <Brain size={56} className="text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Review done</h2>
            <p className="text-xl text-slate-300 mb-2">
              <span className="text-green-400 font-mono">{right}</span> right ·{' '}
              <span className="text-orange-400 font-mono">{total - right}</span> to revisit
            </p>
            <p className="text-slate-500 text-sm mb-8">
              Cards you missed return tomorrow. Cards you nailed move further out — 3, 7, then 21 days.
            </p>
            <button
              onClick={() => onFinish(grades)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition">
          <ArrowLeft size={18} /> back to home
        </button>

        <div className="flex items-center gap-3 mb-1">
          <Brain className="text-cyan-400" />
          <h1 className="text-2xl font-bold">Flashcard Review</h1>
        </div>
        <div className="text-xs text-slate-500 mb-6 font-mono">
          CARD {idx + 1} OF {queue.length} · FROM “{lesson.title.toUpperCase()}”
        </div>

        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${(idx / queue.length) * 100}%` }}
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <p className="text-lg text-slate-100 mb-6 leading-relaxed">{question.q}</p>
          <QuizQuestion question={question} selected={selected} revealed={revealed} onSelect={setSelected} />
        </div>

        {!revealed ? (
          <button
            onClick={() => selected !== null && setRevealed(true)}
            disabled={selected === null}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-6 py-4 rounded-xl transition"
          >
            Check answer
          </button>
        ) : isCorrect ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => grade('good')}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-4 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Check size={18} /> Got it
            </button>
            <button
              onClick={() => grade('easy')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-4 rounded-xl transition"
            >
              Too easy ⏩
            </button>
          </div>
        ) : (
          <button
            onClick={() => grade('again')}
            className="w-full bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold px-6 py-4 rounded-xl transition flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> Noted — show me again tomorrow
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// AI TUTOR
// ============================================================================

function currentProvider() {
  const p = localStorage.getItem(PROVIDER_STORAGE) || DEFAULT_PROVIDER;
  return AI_PROVIDERS[p] ? p : DEFAULT_PROVIDER;
}

function tutorKey(provider) {
  const p = provider || currentProvider();
  const key = localStorage.getItem(AI_PROVIDERS[p].keyStorage);
  if (key) return key;
  if (p === 'anthropic') return localStorage.getItem(LEGACY_ANTHROPIC_KEY) || '';
  return '';
}

// Sends one chat turn to whichever AI provider is configured.
// Returns { text } on success, or { error } ('nokey' | 'network' | a message).
async function callTutorAPI({ system, history, userMsg }) {
  const provider = currentProvider();
  const key = tutorKey(provider);
  if (!key) return { error: 'nokey' };

  try {
    if (provider === 'gemini') {
      const contents = [
        ...history.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.text }],
        })),
        { role: 'user', parts: [{ text: userMsg }] },
      ];
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: system }] },
            contents,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) return { error: data?.error?.message || `HTTP ${res.status}` };
      const text = data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || '')
        .join('')
        .trim();
      return { text: text || 'Sorry — no response.' };
    }

    // anthropic
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1000,
        system,
        messages: [
          ...history.map((m) => ({ role: m.role, content: m.text })),
          { role: 'user', content: userMsg },
        ],
      }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data?.error?.message || `HTTP ${res.status}` };
    const text = data.content
      ?.filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n');
    return { text: text || 'Sorry — no response.' };
  } catch {
    return { error: 'network' };
  }
}

function TutorChat({ lesson, onBack, onOpenSettings }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hey — I'm your BMS tutor. You're on "${lesson?.title || 'BMS Mastery'}". Ask me anything — to explain a concept differently, give Ghana examples, quiz you, or apply it to your VRF / Yakuver work.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');

    if (!tutorKey()) {
      setMessages((m) => [
        ...m,
        { role: 'user', text: userMsg },
        {
          role: 'assistant',
          text: 'No AI key is set yet. Tap the gear icon (Settings) and add a free Google Gemini key — it takes about a minute and costs nothing.',
        },
      ]);
      return;
    }

    // Drop the opening greeting — the API history must start with a user turn.
    const history = messages.slice(1);
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);

    const lessonContext = lesson
      ? `The user is currently studying the BMS lesson titled "${lesson.title}". Lesson summary: ${lesson.takeaway}. They have 8+ years of MEP/HVAC experience and run an HVAC contracting firm (Yakuver Solutions) in Ghana. Use Ghana-relevant examples (GHC pricing, ECG tariffs, Midea VRF, hot humid climate) when useful. Keep replies tight and concrete.`
      : 'The user is studying building management systems. They have 8+ years of MEP/HVAC experience and run an HVAC firm in Ghana. Keep replies tight and concrete.';

    const result = await callTutorAPI({
      system: `You are an expert BMS/BAS tutor. ${lessonContext}`,
      history,
      userMsg,
    });

    let reply;
    if (result.error === 'network') {
      reply = 'Could not reach the AI — check your internet connection and try again.';
    } else if (result.error) {
      reply = `AI error: ${result.error}`;
    } else {
      reply = result.text;
    }
    setMessages((m) => [...m, { role: 'assistant', text: reply }]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="max-w-3xl w-full mx-auto p-4 md:p-6 flex flex-col flex-1">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-4 transition">
          <ArrowLeft size={18} /> back
        </button>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-cyan-400" />
          <h1 className="text-2xl font-bold">Tutor</h1>
          {lesson && <span className="text-xs text-slate-500 font-mono">· {lesson.title}</span>}
          <button
            onClick={onOpenSettings}
            className="ml-auto text-slate-500 hover:text-cyan-400 transition"
            title="API key settings"
          >
            <Settings size={18} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[400px] max-h-[60vh]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  m.role === 'user'
                    ? 'bg-cyan-500 text-slate-950 rounded-br-sm'
                    : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask anything..."
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 outline-none rounded-xl px-4 py-3 text-slate-100"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-semibold px-5 rounded-xl transition flex items-center gap-2"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {['Explain it like I have no idea', 'Give me a Ghana example', 'Quiz me harder', 'How does this apply to VRF?'].map(
            (q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:border-cyan-700 hover:text-cyan-300 transition"
              >
                {q}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SETTINGS
// ============================================================================

function SettingsView({ onBack, onResetProgress }) {
  const [provider, setProvider] = useState(currentProvider);
  const [keyInput, setKeyInput] = useState(() => tutorKey(currentProvider()));
  const [saved, setSaved] = useState(false);

  const cfg = AI_PROVIDERS[provider];

  const pickProvider = (p) => {
    setProvider(p);
    localStorage.setItem(PROVIDER_STORAGE, p);
    setKeyInput(tutorKey(p));
    setSaved(false);
  };

  const saveKey = () => {
    const trimmed = keyInput.trim();
    if (trimmed) localStorage.setItem(cfg.keyStorage, trimmed);
    else localStorage.removeItem(cfg.keyStorage);
    localStorage.setItem(PROVIDER_STORAGE, provider);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetProgress = () => {
    if (window.confirm('Reset all progress — XP, streak, completed lessons, flashcards? This cannot be undone.')) {
      onResetProgress();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition">
          <ArrowLeft size={18} /> back to home
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Settings className="text-cyan-400" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound size={18} className="text-cyan-400" />
            <h2 className="font-semibold text-slate-100">AI Tutor</h2>
          </div>
          <p className="text-sm text-slate-400 mb-3">
            The AI Tutor calls an AI service directly from your browser. Pick a provider and paste its key —
            the key is stored only on this device and is never sent anywhere except to that provider.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.entries(AI_PROVIDERS).map(([id, p]) => (
              <button
                key={id}
                onClick={() => pickProvider(id)}
                className={`px-3 py-3 rounded-xl border-2 text-left transition ${
                  provider === id
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-100">{p.label}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      p.badge === 'free'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-orange-500/20 text-orange-300'
                    }`}
                  >
                    {p.badge}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <p className="text-sm text-slate-400 mb-1">{cfg.note}</p>
          <p className="text-xs text-slate-500 mb-3">
            Get a key at <span className="text-cyan-400 font-mono">{cfg.signup}</span>
          </p>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder={cfg.placeholder}
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 outline-none rounded-xl px-4 py-3 text-slate-100 font-mono text-sm mb-3"
          />
          <button
            onClick={saveKey}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition"
          >
            {saved ? 'Saved' : `Save ${cfg.label} key`}
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="font-semibold text-slate-100 mb-2">Progress</h2>
          <p className="text-sm text-slate-400 mb-4">
            Wipe XP, streak, completed lessons, and the flashcard pool. Use this to start the course fresh.
          </p>
          <button
            onClick={resetProgress}
            className="bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/40 font-semibold px-6 py-3 rounded-xl transition"
          >
            Reset all progress
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HOME / DASHBOARD
// ============================================================================

function Home({
  state,
  dueCount,
  onLesson,
  onPidLab,
  onTutor,
  onFiveMin,
  onFlashcards,
  onSettings,
  onLibrary,
  onTools,
}) {
  const currentLesson = LESSONS.find((l) => l.id === state.currentLesson) || LESSONS[0];
  const completed = state.completedLessons.length;
  const total = LESSONS.length;
  const progress = (completed / total) * 100;
  const level =
    state.xp < 500 ? 'Apprentice' : state.xp < 2000 ? 'Technician' : state.xp < 5000 ? 'Engineer' : state.xp < 10000 ? 'Senior' : 'Master';

  const modules = useMemo(() => {
    const out = [];
    LESSONS.forEach((l) => {
      let m = out.find((x) => x.num === l.moduleNum);
      if (!m) {
        m = { num: l.moduleNum, name: l.module, lessons: [] };
        out.push(m);
      }
      m.lessons.push(l);
    });
    return out;
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              <span className="text-cyan-400">BMS</span> Mastery
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500">v1.0 · Gabs</span>
              <button onClick={onSettings} className="text-slate-500 hover:text-cyan-400 transition" title="Settings">
                <Settings size={18} />
              </button>
            </div>
          </div>
          <p className="text-slate-400">From MEP engineer to BMS expert — one micro-lesson at a time.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Stat icon={<Flame className="text-orange-400" />} label="Streak" value={`${state.streak}d`} />
          <Stat icon={<Zap className="text-yellow-400" />} label="XP" value={state.xp} sub={level} />
          <Stat icon={<Trophy className="text-cyan-400" />} label="Done" value={`${completed}/${total}`} />
        </div>

        {/* Today's lesson - the main CTA */}
        <button onClick={() => onLesson(currentLesson)} className="w-full text-left group block mb-4">
          <div className="bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-900 border border-cyan-900/50 hover:border-cyan-500/70 rounded-2xl p-6 transition-all duration-300 group-hover:translate-y-[-2px]">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-400 font-bold mb-3">
              <BookOpen size={14} /> Today&apos;s Lesson
            </div>
            <div className="text-xs text-slate-500 mb-1 font-mono">
              Module {currentLesson.moduleNum} · {currentLesson.module} · {currentLesson.duration} min
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{currentLesson.title}</h2>
            <p className="text-slate-400 text-sm line-clamp-2">{currentLesson.hook}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-cyan-400 font-semibold">
              Start lesson <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
            </div>
          </div>
        </button>

        {/* Overall progress bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Course progress</span>
            <span className="font-mono">{completed}/{total} lessons</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <QuickAction icon={<Sliders className="text-cyan-400" />} label="PID Lab" sub="Drag sliders, watch a real loop" onClick={onPidLab} />
          <QuickAction icon={<Wrench className="text-amber-400" />} label="Tools" sub="Interactive BMS tools" onClick={onTools} />
          <QuickAction icon={<BookOpen className="text-emerald-400" />} label="Library" sub="BMS reference articles" onClick={onLibrary} />
          <QuickAction icon={<Sparkles className="text-purple-400" />} label="Ask Tutor" sub="Claude, in context of your lesson" onClick={() => onTutor(null)} />
          <QuickAction icon={<Coffee className="text-orange-400" />} label="5-min Mode" sub="One micro-activity, that's it" onClick={onFiveMin} />
          <QuickAction
            icon={<Brain className="text-pink-400" />}
            label="Flashcards"
            sub={dueCount > 0 ? `${dueCount} card${dueCount === 1 ? '' : 's'} due now` : 'All caught up'}
            onClick={onFlashcards}
            badge={dueCount > 0 ? dueCount : null}
          />
        </div>

        {/* All lessons, grouped by module */}
        <div className="space-y-6">
          {modules.map((mod) => {
            const modDone = mod.lessons.filter((l) => state.completedLessons.includes(l.id)).length;
            return (
              <div key={mod.num}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm uppercase tracking-widest text-slate-500 font-semibold flex items-center gap-2">
                    <Layers size={14} /> Module {mod.num} — {mod.name}
                  </h3>
                  <span className="text-xs font-mono text-slate-600">{modDone}/{mod.lessons.length}</span>
                </div>
                <div className="space-y-2">
                  {mod.lessons.map((l) => {
                    const globalIdx = LESSONS.indexOf(l);
                    const isDone = state.completedLessons.includes(l.id);
                    const isCurrent = state.currentLesson === l.id;
                    const isLocked =
                      globalIdx > 0 &&
                      !state.completedLessons.includes(LESSONS[globalIdx - 1].id) &&
                      !isCurrent &&
                      !isDone;
                    return (
                      <button
                        key={l.id}
                        onClick={() => !isLocked && onLesson(l)}
                        disabled={isLocked}
                        className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition ${
                          isDone
                            ? 'bg-green-950/20 border-green-900/40 hover:border-green-700'
                            : isCurrent
                              ? 'bg-cyan-950/30 border-cyan-700/50 hover:border-cyan-500'
                              : isLocked
                                ? 'bg-slate-900/30 border-slate-800/50 opacity-40 cursor-not-allowed'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono ${
                            isDone
                              ? 'bg-green-500/20 text-green-400'
                              : isCurrent
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isDone ? <Check size={14} /> : globalIdx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-200 truncate">{l.title}</div>
                          <div className="text-xs text-slate-500 font-mono">
                            {l.duration} min{l.isBoss && ' · BOSS CHECK'}
                          </div>
                        </div>
                        {!isLocked && <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-slate-600">
          {total} lessons across {modules.length} modules — the full BMS Mastery curriculum, zero to expert-adjacent.
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      {sub && <div className="text-xs text-slate-500 font-mono">{sub}</div>}
    </div>
  );
}

function QuickAction({ icon, label, sub, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="relative bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 text-left transition"
    >
      {badge != null && (
        <span className="absolute top-3 right-3 min-w-[20px] h-5 px-1.5 bg-pink-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
      <div className="mb-2">{icon}</div>
      <div className="text-sm font-semibold text-slate-200">{label}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </button>
  );
}

// ============================================================================
// APP
// ============================================================================

// ============================================================================
// PWA UPDATE PROMPT — banner shown when a newer deployed version is available
// ============================================================================

// ============================================================================
// TOOLS HUB — a launcher for the interactive BMS tools
// ============================================================================

const TOOLS = [
  { id: 'pid', label: 'PID Lab', desc: 'A live AHU cooling loop — drag P, I, D and watch the loop respond.' },
  { id: 'signal', label: 'Signal Converter', desc: 'Convert between 0–10V, 4–20mA, percent and engineering units.' },
  { id: 'iosizer', label: 'Controller I/O Sizer', desc: 'Count AI/AO/DI/DO and size the controller with 20% spare.' },
];

function toolIcon(id) {
  if (id === 'pid') return <Sliders className="text-cyan-400" />;
  if (id === 'signal') return <Gauge className="text-cyan-400" />;
  return <Cpu className="text-cyan-400" />;
}

function ToolsHub({ onBack }) {
  const [tool, setTool] = useState(null);

  if (tool === 'pid') return <PIDSimulator onBack={() => setTool(null)} />;
  if (tool === 'signal') return <SignalConverter onBack={() => setTool(null)} />;
  if (tool === 'iosizer') return <IoSizer onBack={() => setTool(null)} />;

  const open = (id) => {
    trackEvent('tool-opened:' + id);
    setTool(id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition"
        >
          <ArrowLeft size={18} /> back to home
        </button>
        <div className="flex items-center gap-3 mb-2">
          <Wrench className="text-cyan-400" />
          <h1 className="text-3xl font-bold tracking-tight">BMS Tools</h1>
        </div>
        <p className="text-slate-400 mb-8">
          Hands-on tools to build a feel for how BMS systems behave — play freely, nothing here
          affects your course progress.
        </p>
        <div className="space-y-2">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => open(t.id)}
              className="w-full text-left flex items-center gap-4 p-4 rounded-xl border bg-slate-900 border-slate-800 hover:border-cyan-700 transition"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                {toolIcon(t.id)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-100">{t.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
              </div>
              <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // While the app is open, check for a new version every 60 seconds.
      if (registration) {
        setInterval(() => registration.update(), 60 * 1000);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 mx-auto max-w-md bg-slate-900 border border-cyan-700/60 rounded-2xl p-4 shadow-2xl flex items-center gap-3">
      <Sparkles size={18} className="text-cyan-400 flex-shrink-0" />
      <div className="flex-1 text-sm text-slate-200">A new version of BMS Mastery is ready.</div>
      <button
        onClick={() => updateServiceWorker(true)}
        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition"
      >
        Refresh
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        className="text-slate-500 hover:text-slate-300 transition"
        title="Later"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(initialState);
  const [view, setView] = useState('home'); // home | lesson | pid | tutor | flashcards | settings
  const [activeLesson, setActiveLesson] = useState(null);
  const [tutorLesson, setTutorLesson] = useState(null);
  const [flashQueue, setFlashQueue] = useState([]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const openLesson = (lesson) => {
    setActiveLesson(lesson);
    setView('lesson');
  };

  const completeLesson = (lesson, score) => {
    const pct = lesson.quiz.length
      ? Math.round((score / lesson.quiz.length) * 10) * 10
      : 0;
    trackEvent('lesson-completed:' + lesson.id);
    trackEvent('quiz-score:' + pct + '%');
    if (lesson.isBoss) trackEvent('module-completed:' + lesson.moduleNum);

    const sd = studyDayUpdate(state);
    const xpGained = 10 + score * 5 + (lesson.isBoss ? 100 : 0);
    const idx = LESSONS.findIndex((l) => l.id === lesson.id);
    const nextLessonId = idx + 1 < LESSONS.length ? LESSONS[idx + 1].id : lesson.id;

    setState({
      ...state,
      xp: state.xp + xpGained,
      streak: sd.streak,
      lastStudyDate: sd.lastStudyDate,
      completedLessons: state.completedLessons.includes(lesson.id)
        ? state.completedLessons
        : [...state.completedLessons, lesson.id],
      quizScores: { ...state.quizScores, [lesson.id]: score },
      cards: addCardsForLesson(state.cards, lesson),
      currentLesson: nextLessonId,
    });
    setView('home');
  };

  const openTutor = (lesson) => {
    trackEvent('ai-tutor-opened');
    setTutorLesson(lesson || activeLesson);
    setView('tutor');
  };

  const startFlashcards = (limit) => {
    const queue = dueCards(state).sort((a, b) => a.due - b.due);
    setFlashQueue(limit ? queue.slice(0, limit) : queue);
    setView('flashcards');
  };

  const finishFlashcards = (grades) => {
    const reviewed = Object.keys(grades);
    if (reviewed.length > 0) {
      const cards = { ...state.cards };
      reviewed.forEach((key) => {
        if (cards[key]) cards[key] = rescheduleCard(cards[key], grades[key]);
      });
      const sd = studyDayUpdate(state);
      setState({
        ...state,
        cards,
        xp: state.xp + reviewed.length * 3,
        streak: sd.streak,
        lastStudyDate: sd.lastStudyDate,
      });
    }
    setView('home');
  };

  const fiveMin = () => {
    if (dueCards(state).length > 0) {
      startFlashcards(6);
    } else {
      openLesson(LESSONS.find((l) => l.id === state.currentLesson) || LESSONS[0]);
    }
  };

  const resetProgress = () => {
    localStorage.removeItem(STATE_STORAGE);
    localStorage.removeItem(OLD_STATE_STORAGE);
    setState(freshState());
    setView('home');
  };

  let screen;
  if (view === 'pid') {
    screen = <PIDSimulator onBack={() => setView('home')} />;
  } else if (view === 'settings') {
    screen = <SettingsView onBack={() => setView('home')} onResetProgress={resetProgress} />;
  } else if (view === 'flashcards') {
    screen = <FlashcardReview queue={flashQueue} onFinish={finishFlashcards} onBack={() => setView('home')} />;
  } else if (view === 'tutor') {
    screen = (
      <TutorChat
        lesson={tutorLesson}
        onBack={() => setView(activeLesson ? 'lesson' : 'home')}
        onOpenSettings={() => setView('settings')}
      />
    );
  } else if (view === 'lesson' && activeLesson) {
    screen = (
      <LessonView lesson={activeLesson} onComplete={completeLesson} onBack={() => setView('home')} onAskTutor={openTutor} />
    );
  } else if (view === 'library') {
    screen = <LibraryView onBack={() => setView('home')} />;
  } else if (view === 'tools') {
    screen = <ToolsHub onBack={() => setView('home')} />;
  } else {
    screen = (
      <Home
        state={state}
        dueCount={dueCards(state).length}
        onLesson={openLesson}
        onPidLab={() => {
          trackEvent('pid-lab-opened');
          setView('pid');
        }}
        onTutor={openTutor}
        onFiveMin={fiveMin}
        onFlashcards={() => startFlashcards(null)}
        onSettings={() => setView('settings')}
        onLibrary={() => {
          trackEvent('library-opened');
          setView('library');
        }}
        onTools={() => {
          trackEvent('tools-opened');
          setView('tools');
        }}
      />
    );
  }

  return (
    <AccessGate>
      {screen}
      <ReloadPrompt />
    </AccessGate>
  );
}
