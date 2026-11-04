import { useEffect, useState, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api.js';
import Button from '../components/Button.jsx';

const MAX_CHARS = 10000;
const LANGUAGES = ['Python', 'C++', 'Java', 'JavaScript'];

const TEMPLATES = {
  Python: `# Python 3.11 Solution\ndef solution(nums):\n    # Write your algorithmic solution here\n    pass\n`,
  'C++': `// C++17 Solution\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Implement your method here\n};\n`,
  Java: `// Java OpenJDK 17 Solution\nimport java.util.*;\n\npublic class Solution {\n    // Implement your method here\n}\n`,
  JavaScript: `// JavaScript ES6+\nfunction solution(nums) {\n  // Implement your method here\n  return null;\n}\n`,
};

export default function Interview() {
  const { sessionId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(state?.question ?? null);
  const [total, setTotal] = useState(state?.total ?? 5);
  const [answered, setAnswered] = useState(0);
  const [category, setCategory] = useState(state?.category ?? 'DSA');
  const [language, setLanguage] = useState(state?.language ?? 'Python');

  const isDsa = (state?.category || category) === 'DSA';

  const [text, setText] = useState(() => {
    if ((state?.category || category) === 'DSA') {
      return TEMPLATES[state?.language ?? 'Python'] || TEMPLATES.Python;
    }
    return '';
  });

  const [feedback, setFeedback] = useState(null);
  const [nextQuestion, setNextQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  const textareaRef = useRef(null);

  useEffect(() => {
    if (state?.question) return;
    api(`/sessions/${sessionId}/current`)
      .then((r) => {
        setQuestion(r.question);
        setAnswered(r.answered);
        setTotal(r.total);
        if (r.category) setCategory(r.category);
        if (r.language) setLanguage(r.language);
        if (r.category === 'DSA' && r.language) {
          setText(TEMPLATES[r.language] || TEMPLATES.Python);
        }
      })
      .catch((e) => setError(e.message));
  }, [sessionId, state?.question]);

  const handleTabKey = (e) => {
    if (isDsa && e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const updated = text.substring(0, start) + '    ' + text.substring(end);
      setText(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleLangChange = (lang) => {
    setLanguage(lang);
    const isDefault = Object.values(TEMPLATES).some((t) => t.trim() === text.trim());
    if (isDefault || !text.trim()) {
      setText(TEMPLATES[lang] || TEMPLATES.Python);
    }
  };

  const handleReset = () => {
    if (isDsa) {
      setText(TEMPLATES[language] || TEMPLATES.Python);
    } else {
      setText('');
    }
  };

  async function submit() {
    if (!text.trim() || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await api(`/sessions/${sessionId}/answer`, {
        method: 'POST',
        body: {
          questionId: question.id,
          text,
          language: isDsa ? language : undefined,
        },
      });
      setFeedback(res.feedback);
      setNextQuestion(res.nextQuestion);
      setAnswered(res.progress.answered);
      setTotal(res.progress.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function goNext() {
    setQuestion(nextQuestion);
    setNextQuestion(null);
    setFeedback(null);
    setText(isDsa ? (TEMPLATES[language] || TEMPLATES.Python) : '');
  }

  async function finish() {
    setError('');
    setLoading(true);
    try {
      const res = await api(`/sessions/${sessionId}/end`, { method: 'POST' });
      setSummary(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Summary Screen
  if (summary) {
    return (
      <div className="container-wire py-12">
        <motion.div
          className="wire-box text-center p-8 space-y-4"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="inline-block border-[1.5px] border-border-dark px-2.5 py-0.5 text-xs font-mono font-bold uppercase bg-canvas">
            Session Finished
          </div>
          <h1 className="text-2xl font-bold">Interview Assessment Report</h1>
          <div className="wire-sub-box max-w-sm mx-auto p-6 font-mono">
            <div className="text-3xl font-bold text-primary mb-1">
              {summary.avgScore != null ? `${Math.round(summary.avgScore)} / 100` : 'Complete'}
            </div>
            <div className="text-xs text-stone-600">Average Cumulative Score</div>
          </div>
          <p className="text-xs text-stone-600 font-mono">
            Evaluated {summary.answered ?? answered} questions in {category.replace('_', ' ')}.
          </p>
          <div className="pt-2">
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Back to Practice Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentIdx = Math.min(answered + (feedback ? 0 : 1), total || 1);

  return (
    <div className="container-wire py-8 space-y-6">
      {/* ACTIVE INTERVIEW CONTAINER */}
      <div className="wire-box border-[2px] border-primary space-y-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between pb-3 border-b-[1.5px] border-border">
          <div className="text-xs font-mono font-bold text-stone-600">
            {isDsa ? (
              <>
                Selected Language: <span className="text-stone-900">{language}</span>
              </>
            ) : (
              <>
                Category: <span className="text-stone-900">{category.replace('_', ' ')}</span>
              </>
            )}
          </div>

          <div className="wire-pill wire-pill-active text-xs font-mono">
            Question {currentIdx} of {total || 5}
          </div>

          <button
            type="button"
            onClick={finish}
            disabled={loading}
            className="wire-btn wire-btn-secondary text-xs py-1 px-3"
          >
            End Interview
          </button>
        </div>

        {error && <div className="text-xs text-primary font-bold">{error}</div>}

        {/* Question Statement Box */}
        <div className="wire-sub-box p-4">
          <div className="text-xs font-mono font-bold uppercase text-stone-500 mb-1">
            Problem Description
          </div>
          <div className="text-sm font-bold text-stone-900 leading-snug">
            {question ? question.text : 'Loading question...'}
          </div>
        </div>

        {/* Workspace Box */}
        <div className="wire-sub-box p-3 space-y-3">
          {/* Language Selection Row: ONLY SHOWN FOR DSA */}
          {isDsa ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-stone-600 uppercase">
                  Language:
                </span>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    disabled={loading || !!feedback}
                    onClick={() => handleLangChange(lang)}
                    className={`px-2.5 py-0.5 text-xs font-mono border-[1.5px] rounded transition-colors ${
                      language === lang
                        ? 'border-border-dark bg-border-dark text-canvas font-bold'
                        : 'border-border bg-canvas text-stone-800'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <span className="text-[0.7rem] font-mono text-stone-500">
                {text.length}/{MAX_CHARS}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-stone-600 uppercase">
                Your Answer & Reasoning:
              </span>
              <span className="text-[0.7rem] font-mono text-stone-500">
                {text.length}/{MAX_CHARS}
              </span>
            </div>
          )}

          {/* Textarea (Code editor styling for DSA, clean text styling for Non-DSA) */}
          <textarea
            ref={textareaRef}
            rows={isDsa ? 12 : 9}
            maxLength={MAX_CHARS}
            disabled={!!feedback || loading}
            onKeyDown={handleTabKey}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`w-full text-xs p-3 rounded border border-border-dark resize-y leading-relaxed focus:outline-none ${
              isDsa
                ? 'font-mono bg-[#242833] text-slate-100'
                : 'font-sans bg-canvas text-stone-900'
            }`}
            placeholder={
              isDsa
                ? 'Write your algorithmic solution here...'
                : category === 'HR'
                ? 'Describe the situation, your specific actions, and the concrete outcome...'
                : 'Explain your architecture, components, data flow, scaling bottlenecks, and trade-offs step by step...'
            }
            spellCheck="false"
          />

          {/* Bottom Buttons */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading || !!feedback}
              className="wire-btn wire-btn-secondary text-xs py-1.5 px-3"
            >
              {isDsa ? 'Reset Code' : 'Clear Text'}
            </button>

            {!feedback && (
              <button
                type="button"
                onClick={submit}
                disabled={loading || !text.trim()}
                className="wire-btn wire-btn-primary text-xs py-1.5 px-6"
              >
                {loading ? 'Evaluating Response...' : isDsa ? 'Submit Code' : 'Submit Answer'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RESULTS & FEEDBACK (Matches green box in sketch) */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            className="wire-box border-[2px] border-emerald-700 space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Top Score & Summary Box */}
            <div className="wire-sub-box p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-mono font-bold text-emerald-800 uppercase">
                  Assessment Finalized
                </div>
                <div className="text-xl font-bold text-stone-900">
                  Score: {Math.round(feedback.score)} / 100
                </div>
              </div>
              <p className="text-xs text-stone-700 max-w-md font-sans">
                {feedback.feedback}
              </p>
            </div>

            {/* Dynamic Rubric Breakdown */}
            {feedback.breakdown && Object.keys(feedback.breakdown).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
                {Object.entries(feedback.breakdown).map(([key, val]) => (
                  <div key={key} className="wire-sub-box p-2">
                    <div className="text-stone-500 uppercase text-[0.7rem]">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div className="font-bold text-stone-900 mt-0.5">
                      {val} pts
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Strengths & Next Steps */}
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="wire-sub-box p-3">
                <div className="font-mono font-bold text-emerald-800 uppercase mb-2">
                  Identified Strengths
                </div>
                <ul className="space-y-1 list-decimal list-inside text-stone-800">
                  {feedback.strengths?.length
                    ? feedback.strengths.map((s, i) => <li key={i}>{s}</li>)
                    : <li>Accurate approach.</li>}
                </ul>
              </div>

              <div className="wire-sub-box p-3">
                <div className="font-mono font-bold text-primary uppercase mb-2">
                  Optimization Gaps
                </div>
                <ul className="space-y-1 list-decimal list-inside text-stone-800">
                  {feedback.gaps?.length
                    ? feedback.gaps.map((g, i) => <li key={i}>{g}</li>)
                    : <li>No major edge-case failures.</li>}
                </ul>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-2">
              {!nextQuestion ? (
                <button
                  type="button"
                  onClick={finish}
                  disabled={loading}
                  className="wire-btn wire-btn-primary w-full py-2.5 text-sm"
                >
                  Complete Session & View Summary
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  className="wire-btn wire-btn-primary w-full py-2.5 text-sm"
                >
                  Proceed to Next Question
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
