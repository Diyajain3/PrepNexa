export default function Terms() {
  return (
    <div className="container-wire py-10">
      <div className="wire-box space-y-4">
        <h1 className="text-2xl font-bold">Terms of Service</h1>
        <p className="text-xs font-mono text-stone-500">Last updated: November 2026</p>
        <div className="space-y-4 text-xs leading-relaxed text-stone-700">
          <div>
            <h2 className="text-sm font-bold text-stone-900 mb-1">1. Service Purpose</h2>
            <p>IntroAI is an automated interview preparation tool for coding and algorithms practice.</p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 mb-1">2. Acceptable Use</h2>
            <p>Users must not submit malicious or destructive payloads. Accounts are for personal preparation.</p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 mb-1">3. Privacy & Intellectual Property</h2>
            <p>Your code is evaluated privately to produce instant feedback and is not shared or sold.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
