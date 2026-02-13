import { useState, useEffect, useRef } from "react";

interface DJ {
  id: string;
  name: string;
  fee: number;
  payment: string;
  genre: string;
}

interface Slot {
  id: number;
  time: string;
  djId: string;
}

const LineupBuilder = () => {
  const [vault, setVault] = useState<DJ[]>([]);
  const [slots, setSlots] = useState<Slot[]>([
    { id: 1, time: "22:00 - 23:00", djId: "" },
    { id: 2, time: "23:00 - 00:00", djId: "" },
    { id: 3, time: "00:00 - 01:00", djId: "" },
    { id: 4, time: "01:00 - 02:00", djId: "" },
    { id: 5, time: "02:00 - 03:00", djId: "" },
  ]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const savedVault = localStorage.getItem("dj_vault");
    if (savedVault) setVault(JSON.parse(savedVault));
  }, []);

  // --- FEATURE: THE SUGGESTOR ---
  const getSuggestions = () => {
    const selectedGenres = slots
      .map((s) => vault.find((d) => d.id === s.djId)?.genre)
      .filter(Boolean);

    if (selectedGenres.length === 0) return [];

    // Suggest DJs with matching genres who aren't already booked
    return vault
      .filter(
        (dj) =>
          selectedGenres.includes(dj.genre) &&
          !slots.some((s) => s.djId === dj.id),
      )
      .slice(0, 3);
  };

  // --- FEATURE: POSTER GENERATOR ---
  const downloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#09090b"; // zinc-950
    ctx.fillRect(0, 0, 1080, 1920);

    // Header text
    ctx.fillStyle = "#6366f1"; // indigo-500
    ctx.font = "bold 120px Inter, sans-serif";
    ctx.fillText("LINEUP", 100, 250);

    // Draw Slots
    ctx.fillStyle = "white";
    ctx.font = "60px Inter, sans-serif";
    slots.forEach((slot, index) => {
      const dj = vault.find((d) => d.id === slot.djId);
      const yPos = 500 + index * 200;
      ctx.fillText(`${slot.time} — ${dj?.name || "TBA"}`, 100, yPos);
    });

    // Download Logic
    const link = document.createElement("a");
    link.download = "lineup-poster.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleDjSelect = (slotId: number, djId: string) => {
    setSlots(slots.map((s) => (s.id === slotId ? { ...s, djId } : s)));
  };

  const calculateTotal = () => {
    return slots.reduce((sum, slot) => {
      const dj = vault.find((d) => d.id === slot.djId);
      return sum + (dj?.fee || 0);
    }, 0);
  };

  const handleFinalize = () => {
    const total = calculateTotal();
    const breakdown = slots
      .filter((s) => s.djId)
      .map((s) => {
        const dj = vault.find((d) => d.id === s.djId);
        return `${s.time}: ${dj?.name} - R${dj?.fee} (${dj?.payment})`;
      })
      .join("\n");

    alert(
      `Admin Summary Generated!\n\nTotal Payout: R${total}\n\n${breakdown}`,
    );
    // Next step would be integrating an Email API here
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">Lineup Builder</h1>
        <p className="text-zinc-400 text-sm">Assign DJs to time slots.</p>
      </header>

      {/* Suggestor UI */}
      {getSuggestions().length > 0 && (
        <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
            Smart Suggestions
          </p>
          <div className="flex gap-2">
            {getSuggestions().map((dj) => (
              <button
                key={dj.id}
                className="text-xs bg-indigo-600 px-3 py-2 rounded-lg font-semibold"
                onClick={() => {
                  const firstEmpty = slots.find((s) => !s.djId);
                  if (firstEmpty) handleDjSelect(firstEmpty.id, dj.id);
                }}
              >
                + {dj.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {slots.map((slot) => {
          const selectedDj = vault.find((d) => d.id === slot.djId);
          return (
            <div
              key={slot.id}
              className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl"
            >
              <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block tracking-widest">
                {slot.time}
              </label>
              <select
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-3 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                value={slot.djId}
                onChange={(e) => handleDjSelect(slot.id, e.target.value)}
              >
                <option value="">Select a DJ...</option>
                {vault.map((dj) => (
                  <option key={dj.id} value={dj.id}>
                    {dj.name} (R{dj.fee})
                  </option>
                ))}
              </select>
              {selectedDj && (
                <div className="mt-2 text-[10px] text-indigo-400 font-mono">
                  Saved Payment: {selectedDj.payment}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 space-y-3">
        <button
          onClick={downloadPoster}
          className="w-full bg-zinc-100 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          <span>🎨</span> Generate IG Story Poster
        </button>

        {/* Hidden Canvas for Generation */}
        <canvas ref={canvasRef} width="1080" height="1920" className="hidden" />
      </div>

      {/* Footer Summary Card */}
      <div className="mt-8 bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-900/20">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white/80 text-sm font-medium">
            Total Artist Payout
          </span>
          <span className="text-2xl font-bold text-white">
            R{calculateTotal()}
          </span>
        </div>
        <button
          onClick={handleFinalize}
          className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl active:scale-95 transition-transform"
        >
          Finalize & Email Breakdown
        </button>
      </div>
    </div>
  );
};

export default LineupBuilder;
