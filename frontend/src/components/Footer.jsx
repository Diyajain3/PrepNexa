import { Link } from 'react-router-dom';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="mt-16 border-t-[1.5px] border-border-dark bg-canvas py-8 text-xs font-mono text-stone-700">
      <div className="container-wire flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-stone-900">IntroAI</span> (c) {currentYear}. Technical Interview Practice.
        </div>
        <div className="flex gap-4">
          <Link to="/terms" className="underline hover:text-stone-950">
            Terms of Service
          </Link>
          <Link to="/privacy" className="underline hover:text-stone-950">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
