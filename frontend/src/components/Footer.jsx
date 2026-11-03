import { Link } from 'react-router-dom';
import { Mic, Github, Linkedin, Mail } from 'lucide-react';

const social = [
  { icon: Github, href: 'https://github.com/Diyajain3', label: 'GitHub' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/diya-jain-089aa4286/', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:diyajain3003@gmail.com', label: 'Email' },
];

const linkCls = 'block py-1 text-silver/75 transition duration-200 hover:translate-x-1 hover:text-marigold';
const headCls = 'mb-4 text-xs font-bold tracking-[0.12em] text-silver uppercase';

export default function Footer() {
  return (
    <footer className="mt-10 bg-aubergine pt-16 pb-8 text-silver/80">
      <div className="container-x">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5 font-display text-xl font-bold text-silver">
              <span className="grid size-9 place-items-center rounded-xl bg-marigold text-aubergine"><Mic size={18} /></span>
              IntroAI
            </div>
            <p className="mt-4 max-w-xs text-sm">
              Practice real interviews with AI feedback, so you walk into the room prepared.
            </p>
            <div className="mt-5 flex gap-2.5">
              {social.map(({ icon: Icon, href, label }) => (
                <a
                  key={label} href={href} aria-label={label} target="_blank" rel="noreferrer"
                  className="grid size-10 place-items-center rounded-xl border border-silver/25 text-marigold transition duration-200 hover:-translate-y-1 hover:bg-marigold hover:text-aubergine"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className={headCls}>Product</h4>
            <Link to="/#features" className={linkCls}>Features</Link>
            <Link to="/#how" className={linkCls}>How it works</Link>
            <Link to="/dashboard" className={linkCls}>Practice</Link>
          </div>

          <div>
            <h4 className={headCls}>Practice</h4>
            <span className={linkCls}>Company sets</span>
            <span className={linkCls}>DSA</span>
            <span className={linkCls}>System design</span>
            <span className={linkCls}>HR rounds</span>
          </div>

          <div>
            <h4 className={headCls}>Account</h4>
            <Link to="/login" className={linkCls}>Log in</Link>
            <Link to="/signup" className={linkCls}>Sign up</Link>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-2 border-t border-silver/15 pt-6 text-sm">
          <span>© {new Date().getFullYear()} IntroAI. All rights reserved.</span>
          <span>Built with React, Express and PostgreSQL</span>
        </div>
      </div>
    </footer>
  );
}