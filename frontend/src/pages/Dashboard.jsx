import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Play, FileText, Trophy } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import TiltCard from '../components/TiltCard.jsx';

const CATEGORY_LABELS = {
  DSA: 'Data Structures & Algorithms',
  SYSTEM_DESIGN: 'System Design',
  HR: 'Behavioral / HR',
  DBMS: 'Databases',
  OS: 'Operating Systems',
  NETWORKS: 'Networks',
  API_DESIGN: 'API Design',
};
const label = (c) => CATEGORY_LABELS[c] || c;
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [topics, setTopics] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(null); // id of the button that was clicked
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/topics'), api('/companies'), api('/sessions'), api('/users/me')])
      .then(([t, c, s, me]) => {
        setTopics(t);
        setCompanies(c);
        setSessions(s);
        setStats(me.stats);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function start(key, body) {
    setError('');
    setStarting(key);
    try {
      const { sessionId, question, total } = await api('/sessions/start', { method: 'POST', body });
      navigate(`/interview/${sessionId}`, { state: { question, total } });
    } catch (e) {
      setError(e.message);
      setStarting(null);
    }
  }

  // Group topics by category
  const grouped = topics.reduce((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div className="container-x py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <span className="eyebrow">Dashboard</span>
        <h1 className="mt-3 !text-3xl sm:!text-4xl">Hi {user?.name?.split(' ')[0]}, ready to practice?</h1>
      </motion.div>

      {error && <p className="notice mt-6" role="alert">{error}</p>}

      {/* STATS */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ['Sessions', stats?.sessions ?? '-'],
          ['Answers scored', stats?.answers ?? '-'],
          ['Average score', stats?.avgScore ?? '-'],
        ].map(([name, value]) => (
          <div key={name} className="card !p-5">
            <div className="text-sm font-semibold text-aubergine/70">{name}</div>
            <div className="mt-1 font-display text-4xl font-bold text-aubergine">{value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="mt-12 text-center font-semibold">Loading your practice options...</p>
      ) : (
        <>
          {/* PRACTICE BY TOPIC */}
          <section className="mt-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="!text-2xl sm:!text-3xl">Practice by topic</h2>
                <p className="mt-1 text-sm">Pick a difficulty, then choose a topic. Questions are generated fresh each time.</p>
              </div>
              <div className="flex gap-2" role="radiogroup" aria-label="Difficulty">
                {DIFFICULTIES.map((d) => (
                  <button key={d} role="radio" aria-checked={difficulty === d} onClick={() => setDifficulty(d)}
                    className={`chip ${difficulty === d ? 'chip-active' : ''}`}>
                    {d[0] + d.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {topics.length === 0 && <p className="notice mt-6">No topics yet. Run the seed script on the backend.</p>}

            {Object.entries(grouped).map(([cat, list]) => (
              <div key={cat} className="mt-6">
                <h3 className="mb-3 !text-base text-aubergine/80">{label(cat)}</h3>
                <div className="flex flex-wrap gap-2.5">
                  {list.map((t) => (
                    <button key={t.id} className="chip" disabled={!!starting}
                      onClick={() => start(t.id, { mode: 'MANUAL', topicId: t.id, difficulty })}>
                      {starting === t.id ? 'Preparing...' : t.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* COMPANY SETS */}
          <section className="mt-14">
            <h2 className="!text-2xl sm:!text-3xl">Company practice sets</h2>
            <p className="mt-1 mb-6 text-sm">Curated questions for specific companies and roles.</p>

            {companies.length === 0 && <p className="notice">No company sets yet.</p>}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {companies.map((c) => (
                <TiltCard key={c.id}>
                  <span className="icon-chip"><Building2 size={22} /></span>
                  <h3 className="mb-3">{c.name}</h3>
                  <div className="grid gap-2">
                    {c.practiceSets.map((s) => (
                      <button key={s.id} disabled={!!starting}
                        onClick={() => start(s.id, { mode: 'COMPANY_SET', practiceSetId: s.id })}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-aubergine/15 bg-silver-light px-4 py-3 text-left text-sm font-semibold text-aubergine transition hover:border-aubergine hover:shadow-soft disabled:opacity-50">
                        <span>{s.role} <span className="font-medium text-aubergine/60">· {label(s.category)}</span></span>
                        <span className="flex items-center gap-2">
                          <span className="badge">{s._count.questions} Q</span>
                          <Play size={14} />
                        </span>
                      </button>
                    ))}
                  </div>
                </TiltCard>
              ))}
            </div>
          </section>

          {/* RECENT SESSIONS */}
          <section className="mt-14">
            <h2 className="!text-2xl sm:!text-3xl">Recent sessions</h2>
            {sessions.length === 0 ? (
              <p className="mt-3 text-sm">Your finished sessions will show up here.</p>
            ) : (
              <div className="card mt-5 divide-y divide-aubergine/10 !p-2">
                {sessions.slice(0, 6).map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <div>
                      <span className="font-semibold text-aubergine">
                        {s.mode === 'COMPANY_SET' ? 'Company set' : 'Topic practice'}
                      </span>
                      <span className="ml-2 text-aubergine/60">
                        {new Date(s.startedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>{s._count.answers} answers</span>
                      {s.avgScore != null
                        ? <span className="badge">Avg {s.avgScore}</span>
                        : <span className="text-aubergine/50">Unfinished</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* COMING SOON */}
          <section className="mt-14 grid gap-6 md:grid-cols-2">
            {[
              { icon: FileText, title: 'Resume ATS checker', text: 'Upload your resume and match it against a job description.' },
              { icon: Trophy, title: 'Leaderboard and weak topics', text: 'See where you rank and which topics need work.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="card flex items-start gap-4 opacity-80">
                <span className="icon-chip !mb-0 shrink-0"><Icon size={22} /></span>
                <div>
                  <h3 className="flex items-center gap-2">{title} <span className="badge">Soon</span></h3>
                  <p className="mt-1 text-sm">{text}</p>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}