import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';

const CATEGORIES = [
  { id: 'DSA', label: 'DSA & Algorithms' },
  { id: 'SYSTEM_DESIGN', label: 'System Design' },
  { id: 'DBMS', label: 'Database Systems' },
  { id: 'OS', label: 'Operating Systems' },
  { id: 'NETWORKS', label: 'Computer Networks' },
  { id: 'HR', label: 'Behavioral' },
];

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];
const LANGUAGES = ['Python', 'C++', 'Java', 'JavaScript'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [topics, setTopics] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('DSA');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [language, setLanguage] = useState('Python');

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/topics'), api('/companies'), api('/users/me')])
      .then(([t, c, me]) => {
        setTopics(t);
        setCompanies(c);
        setStats(me.stats);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleStartSession(topicId = null) {
    setError('');
    setStarting(true);
    try {
      const matched = topics.find((t) => t.name.toLowerCase() === search.trim().toLowerCase());
      const targetTopicId = topicId || matched?.id || filteredTopics[0]?.id || topics.find((t) => t.category === selectedCat)?.id || topics[0]?.id;
      const res = await api('/sessions/start', {
        method: 'POST',
        body: {
          mode: 'MANUAL',
          topicId: targetTopicId || undefined,
          topicName: search.trim() || undefined,
          category: selectedCat,
          difficulty,
          language: selectedCat === 'DSA' ? language : undefined,
        },
      });
      navigate(`/interview/${res.sessionId}`, {
        state: {
          question: res.question,
          total: res.total,
          category: res.category || selectedCat,
          language: selectedCat === 'DSA' ? language : null,
        },
      });
    } catch (e) {
      setError(e.message);
      setStarting(false);
    }
  }

  const filteredTopics = topics.filter((t) => {
    const matchesCat = t.category === selectedCat;
    const matchesQuery = !search.trim() || t.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="container-wire py-8 space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-[1.5px] border-border-dark pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
            Welcome, {user?.name || 'Engineer'}
          </h1>
          <p className="text-xs text-stone-600">
            Configure your technical interview session parameters.
          </p>
        </div>
        <div className="text-xs font-mono text-stone-700 bg-surface-card border-[1.5px] border-border-dark px-3 py-1.5 rounded">
          Average Score: <strong className="text-primary">{stats?.avgScore != null ? `${stats.avgScore}/100` : 'No answers yet'}</strong>
        </div>
      </div>

      {error && <div className="text-xs text-primary font-bold">{error}</div>}

      {/* WIREFRAME SECTION 4: PRACTICE CONFIGURATOR (Directly matches sketch) */}
      <motion.div
        className="wire-box space-y-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Top input and helper text row */}
        <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-stone-600 mb-1" htmlFor="topic-input">
              Select or Search Topic
            </label>
            <input
              id="topic-input"
              type="text"
              list="topic-options"
              placeholder={
                selectedCat === 'SYSTEM_DESIGN'
                  ? 'e.g. Caching, Load Balancing, URL Shortener, API Design...'
                  : selectedCat === 'DBMS'
                  ? 'e.g. Indexing, Transactions, Normalization, Query Optimization...'
                  : selectedCat === 'OS'
                  ? 'e.g. Processes, Threads, Deadlocks, Memory Management...'
                  : selectedCat === 'NETWORKS'
                  ? 'e.g. TCP/IP, DNS, HTTP/HTTPS, WebSockets...'
                  : selectedCat === 'HR'
                  ? 'e.g. Leadership, Team Conflict, Project Failure, Ambiguity...'
                  : 'e.g. Arrays, Two Pointers, Binary Trees, Dynamic Programming...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="wire-input text-xs"
            />
            <datalist id="topic-options">
              {filteredTopics.map((t) => (
                <option key={t.id} value={t.name} />
              ))}
            </datalist>
          </div>
          <div className="text-xs text-stone-600 leading-relaxed font-sans">
            Choose your preferred programming language, difficulty, and category to begin an automated assessment.
          </div>
        </div>

        {/* Category Pills */}
        <div>
          <span className="block text-xs font-mono font-bold uppercase text-stone-600 mb-2">
            Practice Category
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCat(c.id)}
                className={`wire-pill text-xs ${selectedCat === c.id ? 'wire-pill-active' : ''}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Pills */}
        <div>
          <span className="block text-xs font-mono font-bold uppercase text-stone-600 mb-2">
            Difficulty Level
          </span>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`wire-pill text-xs ${difficulty === d ? 'wire-pill-active' : ''}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Programming Language Choice Pills: ONLY for DSA */}
        {selectedCat === 'DSA' && (
          <div>
            <span className="block text-xs font-mono font-bold uppercase text-stone-600 mb-2">
              Programming Language
            </span>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`wire-pill text-xs font-mono ${language === lang ? 'wire-pill-active' : ''}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Start Button */}
        <div>
          <button
            type="button"
            onClick={() => handleStartSession()}
            disabled={starting || loading}
            className="wire-btn wire-btn-primary w-full sm:w-auto px-8 py-2.5 text-sm"
          >
            {starting ? 'Generating First Question...' : 'Start Interview Session'}
          </button>
        </div>

        {/* Notice Box */}
        <div className="border-[1.5px] border-primary bg-canvas p-3 rounded text-xs font-mono text-stone-800 leading-relaxed">
          <strong className="text-primary uppercase">Evaluation Notice: </strong>
          {selectedCat === 'DSA' ? (
            <>
              Your code will be evaluated in <strong>{language}</strong> for correctness, Big-O runtime, space complexity, and edge cases.
            </>
          ) : (
            <>
              Your response will be evaluated on technical reasoning, architecture trade-offs, and scalability depth. Code is not required for {selectedCat.replace('_', ' ')}.
            </>
          )}
        </div>
      </motion.div>

      {/* Available Topics List */}
      <div className="wire-box">
        <h2 className="text-base font-bold mb-3">
          Available Topics in {CATEGORIES.find((c) => c.id === selectedCat)?.label || selectedCat}
        </h2>
        {loading ? (
          <div className="text-xs font-mono text-stone-500 py-4 text-center">
            Loading topics...
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-xs text-stone-600 py-3 text-center">
            No topics matched your search.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className="wire-sub-box p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-stone-900">{topic.name}</div>
                  <div className="text-[0.7rem] font-mono text-stone-500">{difficulty} • {language}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartSession(topic.id)}
                  disabled={starting}
                  className="wire-btn text-xs py-1 px-3"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Company sets */}
      {companies.length > 0 && (
        <div className="wire-box">
          <h2 className="text-base font-bold mb-3">Company Practice Sets</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {companies.flatMap((c) =>
              (c.practiceSets || []).map((set) => (
                <div key={set.id} className="wire-sub-box p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-stone-500">{c.name}</div>
                    <div className="font-bold text-xs text-stone-900">{set.title}</div>
                  </div>
                  <Button
                    variant="secondary"
                    to="/dashboard"
                    onClick={() => handleStartSession(topics[0]?.id)}
                  >
                    Practice
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
