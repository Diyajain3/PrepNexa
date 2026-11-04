import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button.jsx';

const SAMPLE_SNIPPETS = {
  Python: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
  'C++': `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int comp = target - nums[i];
        if (seen.count(comp)) return {seen[comp], i};
        seen[nums[i]] = i;
    }
    return {};
}`,
  Java: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int comp = target - nums[i];
        if (seen.containsKey(comp)) return new int[]{seen.get(comp), i};
        seen.put(nums[i], i);
    }
    return new int[]{};
}`,
  JavaScript: `function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (seen.has(comp)) return [seen.get(comp), i];
        seen.set(nums[i], i);
    }
    return [];
}`,
};

export default function Landing() {
  const [demoLang, setDemoLang] = useState('Python');
  const [demoCode, setDemoCode] = useState(SAMPLE_SNIPPETS.Python);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState({
    score: 95,
    time: 'O(N)',
    space: 'O(N)',
    feedback: 'Optimal single-pass hash lookup. All edge cases handled cleanly.',
  });

  const handleLangSelect = (lang) => {
    setDemoLang(lang);
    setDemoCode(SAMPLE_SNIPPETS[lang]);
  };

  const testEvaluation = () => {
    setEvaluating(true);
    setTimeout(() => {
      setEvaluating(false);
      setResult({
        score: demoCode.includes('seen') ? 95 : 70,
        time: demoCode.includes('seen') ? 'O(N)' : 'O(N^2)',
        space: demoCode.includes('seen') ? 'O(N)' : 'O(1)',
        feedback: demoCode.includes('seen')
          ? 'Optimal hash table solution. Evaluated for ' + demoLang + '.'
          : 'Nested search detected. Optimize with a hash map in ' + demoLang + '.',
      });
    }, 400);
  };

  return (
    <div className="container-wire py-8 space-y-8">
      {/* 1. HERO SECTION (Wireframe Section 1) */}
      <motion.div
        className="wire-box"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <div className="inline-block border-[1.5px] border-border-dark px-2.5 py-0.5 text-xs font-mono font-bold uppercase mb-4 bg-canvas">
              Technical Interview Practice
            </div>
            <h1 className="text-stone-900 mb-3">
              Master Technical & DSA Interviews
            </h1>
            <p className="text-stone-700 text-sm mb-6 leading-relaxed max-w-md">
              Practice data structures, algorithms, and system design with multi-language code evaluation.
              Get instant feedback on syntax, algorithmic logic, time complexity, and edge cases.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" to="/signup">
                Start Practice Now
              </Button>
              <Button variant="secondary" to="/login">
                Candidate Login
              </Button>
            </div>
            <div className="mt-4 text-xs font-mono text-stone-600">
              Supported languages: Python, C++, Java, JavaScript
            </div>
          </div>

          {/* REAL PRODUCT DEMO (Clean wireframe preview) */}
          <div className="wire-sub-box">
            <div className="flex items-center justify-between border-b-[1.5px] border-border pb-2 mb-3">
              <span className="font-mono text-xs font-bold uppercase text-stone-800">
                Interactive Code Preview
              </span>
              <span className="text-xs font-mono text-primary font-bold">
                {demoLang}
              </span>
            </div>

            {/* Language Selection Pills */}
            <div className="flex gap-1.5 mb-2">
              {['Python', 'C++', 'Java', 'JavaScript'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLangSelect(lang)}
                  className={`px-2 py-0.5 text-xs font-mono border-[1.5px] rounded ${
                    demoLang === lang
                      ? 'border-border-dark bg-border-dark text-canvas font-bold'
                      : 'border-border bg-canvas text-stone-800'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Code Box */}
            <textarea
              rows={6}
              value={demoCode}
              onChange={(e) => setDemoCode(e.target.value)}
              className="w-full font-mono text-xs p-2.5 bg-[#252830] text-slate-100 rounded border border-border-dark resize-none focus:outline-none"
              spellCheck="false"
            />

            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[0.7rem] font-mono text-stone-600">
                Two Sum Algorithm
              </span>
              <button
                type="button"
                onClick={testEvaluation}
                disabled={evaluating}
                className="wire-btn text-xs py-1 px-3"
              >
                {evaluating ? 'Evaluating...' : 'Test Code'}
              </button>
            </div>

            {/* Result Box */}
            <div className="mt-2.5 border-[1.5px] border-border bg-canvas p-2.5 rounded text-xs font-mono">
              <div className="flex justify-between font-bold text-stone-900 mb-1">
                <span>Score: {result.score}/100</span>
                <span className="text-primary">Time: {result.time}</span>
                <span>Space: {result.space}</span>
              </div>
              <p className="text-[0.75rem] text-stone-700 leading-normal font-sans">
                {result.feedback}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. HOW IT WORKS (Wireframe Section 2: 2 cards in a row with arrow indicator) */}
      <div id="how-it-works" className="wire-box">
        <h2 className="mb-4">How It Works</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="wire-sub-box">
            <div className="font-mono text-xs font-bold text-primary mb-1">Step 1</div>
            <h3 className="font-bold mb-2">Select Language & Topic</h3>
            <p className="text-xs text-stone-700 leading-relaxed">
              Pick your target language (Python, C++, Java, JS) and choose from DSA topics,
              system design challenges, or company practice sets.
            </p>
          </div>

          <div className="wire-sub-box">
            <div className="font-mono text-xs font-bold text-primary mb-1">Step 2</div>
            <h3 className="font-bold mb-2">Write Code & Get Evaluated</h3>
            <p className="text-xs text-stone-700 leading-relaxed">
              Write your solution in the built-in editor. Receive line-by-line feedback, Big-O runtime
              analysis, space efficiency score, and concrete fixes.
            </p>
          </div>
        </div>
        <div className="mt-4 text-center text-xs font-mono text-stone-600">
          Automated algorithmic verification for every problem
        </div>
      </div>

      {/* 3. PRACTICE MODULES (Wireframe Section 3: Structured list) */}
      <div className="wire-box">
        <h2 className="mb-3">Practice Topics & Modules</h2>
        <div className="wire-sub-box space-y-2 text-xs font-mono text-stone-800">
          <div className="p-2 border-b border-border">
            1. Arrays, Two Pointers, and Sliding Window Algorithms
          </div>
          <div className="p-2 border-b border-border">
            2. Linked Lists, Stacks, Queues, and Binary Search
          </div>
          <div className="p-2 border-b border-border">
            3. Binary Trees, Binary Search Trees, and Graph Traversals (BFS/DFS)
          </div>
          <div className="p-2 border-b border-border">
            4. Dynamic Programming, Memoization, and Recursion
          </div>
          <div className="p-2 border-b border-border">
            5. System Architecture, Caching, and Database Optimization
          </div>
          <div className="p-2">
            6. Core Computer Science: OS Processes, Threads, and Networks
          </div>
        </div>
      </div>

      {/* 4. CHOOSE YOUR TRACK (Wireframe Section 4: 3 top cards, 1 wide card below) */}
      <div className="wire-box">
        <h2 className="mb-4">Choose Your Practice Track</h2>
        <div className="grid gap-4 sm:grid-cols-3 mb-4">
          <div className="wire-sub-box text-center p-4">
            <div className="font-bold text-sm mb-1">DSA & Algorithms</div>
            <p className="text-xs text-stone-600">
              Data structures, algorithm design, and coding challenges.
            </p>
          </div>
          <div className="wire-sub-box text-center p-4">
            <div className="font-bold text-sm mb-1">System Design</div>
            <p className="text-xs text-stone-600">
              Distributed architectures, caching, and scalability.
            </p>
          </div>
          <div className="wire-sub-box text-center p-4">
            <div className="font-bold text-sm mb-1">Core CS & DBMS</div>
            <p className="text-xs text-stone-600">
              Operating systems, database queries, and concurrency.
            </p>
          </div>
        </div>

        <div className="wire-sub-box p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="font-bold text-sm">Company Practice Sets</div>
            <p className="text-xs text-stone-600">
              Curated question sets modeled after top engineering interview standards.
            </p>
          </div>
          <Button variant="primary" to="/dashboard">
            Explore Sets
          </Button>
        </div>
      </div>

      {/* 5. PRE-SESSION CONFIGURATOR (Wireframe Section 5) */}
      <div className="wire-box">
        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div>
            <h2 className="mb-2">Practice Session Options</h2>
            <p className="text-xs text-stone-700 mb-4 leading-relaxed">
              Select your parameters to practice under interview conditions.
            </p>
            <div className="space-y-3">
              <div>
                <span className="block text-xs font-mono font-bold text-stone-600 uppercase mb-1">
                  Category
                </span>
                <span className="wire-pill wire-pill-active text-xs">
                  Algorithms & DSA
                </span>
              </div>
              <div>
                <span className="block text-xs font-mono font-bold text-stone-600 uppercase mb-1">
                  Difficulty
                </span>
                <div className="flex gap-2">
                  <span className="wire-pill text-xs">Easy</span>
                  <span className="wire-pill wire-pill-active text-xs">Medium</span>
                  <span className="wire-pill text-xs">Hard</span>
                </div>
              </div>
              <div>
                <span className="block text-xs font-mono font-bold text-stone-600 uppercase mb-1">
                  Language
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="wire-pill wire-pill-active text-xs">Python</span>
                  <span className="wire-pill text-xs">C++</span>
                  <span className="wire-pill text-xs">Java</span>
                  <span className="wire-pill text-xs">JavaScript</span>
                </div>
              </div>
            </div>
          </div>

          <div className="wire-sub-box p-4">
            <div className="text-xs font-mono font-bold uppercase text-stone-600 mb-1">
              Sample Question Preview
            </div>
            <div className="font-bold text-sm text-stone-900 mb-2">
              Valid Palindrome (Two Pointers)
            </div>
            <p className="text-xs text-stone-700 leading-relaxed mb-4 font-mono">
              Given a string s, return true if it is a palindrome, or false otherwise.
              Ignoring case and non-alphanumeric characters.
            </p>
            <Button variant="primary" to="/signup" className="w-full">
              Start Practice Session
            </Button>
          </div>
        </div>
      </div>

      {/* 6. BOTTOM CTA (Wireframe Section 6 Bottom) */}
      <div className="wire-box text-center py-8">
        <h2 className="mb-2">Ready to Test Your Code?</h2>
        <p className="text-xs text-stone-600 mb-4 font-mono">
          Free, private, and instant technical assessment.
        </p>
        <Button variant="primary" to="/signup">
          Create Account & Start Practicing
        </Button>
      </div>
    </div>
  );
}
