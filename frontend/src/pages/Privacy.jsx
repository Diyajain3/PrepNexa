export default function Privacy() {
  return (
    <div className="container-wire py-10">
      <div className="wire-box space-y-4">
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="text-xs font-mono text-stone-500">Last updated: November 2026</p>
        <div className="space-y-4 text-xs leading-relaxed text-stone-700">
          <div>
            <h2 className="text-sm font-bold text-stone-900 mb-1">1. Information Stored</h2>
            <p>We store authentication details and answers you submit to track your practice history.</p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 mb-1">2. No Ad Tracking</h2>
            <p>We do not use advertising trackers or sell candidate data to third parties.</p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 mb-1">3. Data Deletion</h2>
            <p>You can request complete deletion of your account and session data at any time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
