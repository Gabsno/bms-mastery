import { useState } from 'react';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { LIBRARY, LIBRARY_CATEGORIES } from '../library.js';
import { trackEvent } from '../lib/analytics.js';

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-cyan-300 font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function Blocks({ blocks }) {
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        if (b.type === 'h3')
          return <h3 key={i} className="text-xl font-bold text-cyan-300 mt-8 mb-3">{b.text}</h3>;
        if (b.type === 'p')
          return <p key={i} className="text-slate-300 leading-relaxed">{renderInline(b.text)}</p>;
        if (b.type === 'bullets')
          return (
            <ul key={i} className="space-y-2">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-3 text-slate-300 leading-relaxed">
                  <span className="text-cyan-500 mt-1.5 flex-shrink-0">▸</span>
                  <span>{renderInline(it)}</span>
                </li>
              ))}
            </ul>
          );
        if (b.type === 'callout')
          return (
            <div key={i} className="bg-cyan-950/30 border-l-4 border-cyan-500 rounded-r-lg p-4 my-5">
              <p className="text-cyan-100 italic leading-relaxed">{renderInline(b.text)}</p>
            </div>
          );
        return null;
      })}
    </div>
  );
}

export function LibraryView({ onBack }) {
  const [activeId, setActiveId] = useState(null);
  const article = activeId ? LIBRARY.find((a) => a.id === activeId) : null;

  const openArticle = (id) => {
    trackEvent('article-opened:' + id);
    setActiveId(id);
    window.scrollTo(0, 0);
  };

  if (article) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-3xl mx-auto p-4 md:p-8">
          <button
            onClick={() => setActiveId(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition"
          >
            <ArrowLeft size={18} /> back to library
          </button>
          <div className="text-xs text-slate-500 mb-2 font-mono">
            {article.category.toUpperCase()} · {article.readMins} MIN READ
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-white">
            {article.title}
          </h1>
          <Blocks blocks={article.content} />
          <div className="mt-10">
            <button
              onClick={() => setActiveId(null)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl transition inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back to library
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <BookOpen className="text-cyan-400" />
          <h1 className="text-3xl font-bold tracking-tight">Reference Library</h1>
        </div>
        <p className="text-slate-400 mb-8">
          Quick-reference articles to look things up while you work — free to read, separate from
          the course lessons.
        </p>

        <div className="space-y-8">
          {LIBRARY_CATEGORIES.map((cat) => {
            const items = LIBRARY.filter((a) => a.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="text-sm uppercase tracking-widest text-slate-500 font-semibold mb-3">
                  {cat}
                </h3>
                <div className="space-y-2">
                  {items.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => openArticle(a.id)}
                      className="w-full text-left flex items-center gap-3 p-4 rounded-xl border bg-slate-900 border-slate-800 hover:border-cyan-700 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-100">{a.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{a.summary}</div>
                      </div>
                      <span className="text-xs text-slate-600 font-mono flex-shrink-0">
                        {a.readMins} min
                      </span>
                      <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-slate-600">
          {LIBRARY.length} reference articles · more added over time.
        </div>
      </div>
    </div>
  );
}
