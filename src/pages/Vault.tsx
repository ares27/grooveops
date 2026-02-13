import { useState, useEffect } from "react";
import { initVault } from "../data/dummyDjs";

interface DJ {
  id: string;
  name: string;
  genre: string;
  fee: number;
  energy: string;
  contact: string;
  payment: string;
}

const Vault = () => {
  const [djs, setDjs] = useState<DJ[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    initVault();
    const savedVault = localStorage.getItem("dj_vault");
    if (savedVault) {
      setDjs(JSON.parse(savedVault));
    }
  }, []);

  const filteredDjs = djs.filter(
    (dj) =>
      dj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dj.genre.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          DJ Vault
        </h1>
        <p className="text-zinc-400 text-sm">
          Manage your roster and payment info.
        </p>
      </header>

      {/* Search Bar */}
      <div className="sticky top-2 z-10 mb-6">
        <input
          type="text"
          placeholder="Search by name or genre..."
          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* DJ List */}
      <div className="space-y-4">
        {filteredDjs.map((dj) => (
          <div
            key={dj.id}
            className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl hover:border-zinc-700 transition-colors shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white">{dj.name}</h3>
                <span className="text-xs font-medium uppercase tracking-wider text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">
                  {dj.genre}
                </span>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-mono font-bold">R{dj.fee}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                  {dj.energy} Energy
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/50 space-y-1">
              <p className="text-xs text-zinc-400 flex justify-between">
                <span>Contact:</span>
                <span className="text-zinc-200">{dj.contact}</span>
              </p>
              <p className="text-xs text-zinc-400 flex justify-between">
                <span>Payment:</span>
                <span className="text-zinc-200 truncate ml-4">
                  {dj.payment}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDjs.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <p>No DJs found in the vault.</p>
        </div>
      )}
    </div>
  );
};

export default Vault;
