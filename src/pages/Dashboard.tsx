import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState({ djCount: 0, totalFees: 0 });

  useEffect(() => {
    const savedVault = JSON.parse(localStorage.getItem("dj_vault") || "[]");
    // Mocking some "Total Fees managed" logic for the POC
    const totalPossible = savedVault.reduce(
      (acc: number, curr: any) => acc + curr.fee,
      0,
    );
    setStats({
      djCount: savedVault.length,
      totalFees: totalPossible,
    });
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto">
      <header className="mb-10 mt-4">
        <h1 className="text-4xl font-black tracking-tighter text-white italic">
          GROOVE<span className="text-indigo-500">OPS</span>
        </h1>
        <p className="text-zinc-500 font-medium mt-1">Ready for the night?</p>
      </header>

      {/* Primary Action Card */}
      <div className="relative overflow-hidden bg-indigo-600 rounded-3xl p-6 mb-8 shadow-2xl shadow-indigo-500/20">
        <div className="relative z-10">
          <h2 className="text-white text-xl font-bold mb-1">New Event</h2>
          <p className="text-indigo-100 text-sm mb-6 opacity-80">
            Build a lineup and generate your admin docs in seconds.
          </p>
          <Link
            to="/lineup/new"
            className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
          >
            Start Building →
          </Link>
        </div>
        {/* Aesthetic background shape */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Minimal Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">
            Roster
          </p>
          <p className="text-2xl font-bold text-white">{stats.djCount} DJs</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">
            Avg Fee
          </p>
          <p className="text-2xl font-bold text-white">
            R{(stats.totalFees / stats.djCount || 0).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Recent Activity / Shortcuts */}
      <section>
        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">
          Quick Links
        </h3>
        <div className="space-y-3">
          <Link
            to="/vault"
            className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📁</span>
              <span className="font-medium text-zinc-200">Manage DJ Vault</span>
            </div>
            <span className="text-zinc-600">→</span>
          </Link>
          <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 opacity-50">
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <span className="font-medium text-zinc-200">
                Payout Analytics
              </span>
            </div>
            <span className="text-xs text-zinc-600">Coming Soon</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
