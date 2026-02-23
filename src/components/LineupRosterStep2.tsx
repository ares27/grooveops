import {
  Plus,
  X,
  Sparkles,
  Zap,
  Clock,
  Wallet,
  Activity,
  Info,
  Music,
} from "lucide-react";
import { useMemo } from "react";

interface DJ {
  _id: string;
  alias: string;
  fee?: number;
  genres: string[];
  vibes: string[];
  experience: string;
}

interface LineupSlot {
  time: string;
  djId: string;
  fee: number;
  artistAlias: string;
}

interface Props {
  slots: LineupSlot[];
  vault: DJ[];
  setSlots: (slots: LineupSlot[]) => void;
  getSuggestions: (index: number) => DJ[];
  targetGenres: string[];
}

// --- ENERGY ARC CONFIGURATION ---
const BPM_GUIDE = [
  {
    start: "00:00",
    end: "03:00",
    role: "High Octane",
    bpm: "132-145",
    genres: "Hard Tech, D&B",
    color: "text-red-400",
  },
  {
    start: "03:00",
    end: "06:00",
    role: "Afterhours",
    bpm: "115-125",
    genres: "Melodic, Minimal",
    color: "text-purple-400",
  },
  {
    start: "18:00",
    end: "22:00",
    role: "Warm-up",
    bpm: "110-120",
    genres: "Deep House, Disco",
    color: "text-cyan-400",
  },
  {
    start: "22:00",
    end: "23:59",
    role: "Peak Time",
    bpm: "126-132",
    genres: "Tech House, Mainstage",
    color: "text-orange-400",
  },
];

const getEnergyInfo = (timeString: string) => {
  // Simple string comparison works for HH:mm format
  return (
    BPM_GUIDE.find((g) => timeString >= g.start && timeString <= g.end) ||
    BPM_GUIDE[2]
  );
};

const LineupRosterStep2 = ({
  slots,
  vault,
  setSlots,
  getSuggestions,
  targetGenres,
}: Props) => {
  const totalBudget = useMemo(() => {
    return slots.reduce((sum, slot) => sum + (slot.fee || 0), 0);
  }, [slots]);

  const updateSlotTime = (
    index: number,
    type: "start" | "end",
    value: string,
  ) => {
    let newSlots = [...slots];
    let [start, end] = newSlots[index].time.split(" - ");

    if (type === "start") {
      start = value;
      // If start moves past end, push end forward by 1 hour
      if (value >= end) {
        const [h, m] = value.split(":").map(Number);
        end = `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      }

      // Update Previous slot's end time to match this new start
      if (index > 0) {
        const [pS] = newSlots[index - 1].time.split(" - ");
        newSlots[index - 1].time = `${pS} - ${value}`;
      }
    }

    if (type === "end") {
      // Prevent end time from being before start time
      if (value <= start) return;
      end = value;

      // Force the NEXT slot to start when this one ends
      if (newSlots[index + 1]) {
        const [_, nextE] = newSlots[index + 1].time.split(" - ");
        newSlots[index + 1].time = `${value} - ${nextE}`;
      }
    }

    newSlots[index].time = `${start} - ${end}`;
    setSlots(newSlots);
  };

  const removeSlot = (idx: number) => {
    if (slots.length <= 1) return;

    const newSlots = slots.filter((_, i) => i !== idx);

    // REPAIR LOGIC:
    // If we removed a middle slot, we need to make sure the slot that
    // "slid up" into the old position starts exactly when the previous one ended.
    if (idx > 0 && newSlots[idx]) {
      const [_, prevEnd] = newSlots[idx - 1].time.split(" - ");
      const [__, currentEnd] = newSlots[idx].time.split(" - ");
      newSlots[idx].time = `${prevEnd} - ${currentEnd}`;
    }

    setSlots(newSlots);
  };

  const handleDjSelect = (index: number, djId: string) => {
    const selectedDj = vault.find((d) => d._id === djId);
    const newSlots = [...slots];
    newSlots[index] = {
      ...newSlots[index],
      djId,
      artistAlias: selectedDj?.alias || "",
      fee: selectedDj?.fee || 0,
    };
    setSlots(newSlots);
  };

  const addSlot = () => {
    const lastSlot = slots[slots.length - 1];
    const lastEnd = lastSlot.time.split(" - ")[1];
    const [h, m] = lastEnd.split(":").map(Number);
    const newEnd = `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    setSlots([
      ...slots,
      { time: `${lastEnd} - ${newEnd}`, djId: "", artistAlias: "", fee: 0 },
    ]);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-4">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2 uppercase italic tracking-tighter">
            <Sparkles size={18} /> Lineup ~ Set Times
          </h2>

          {/* NEW: Event Genre Breadcrumbs */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {targetGenres.map((g, i) => (
              <span
                key={i}
                className="text-[8px] font-black bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md uppercase tracking-widest"
              >
                {g}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              Collision Prevention Active
            </p>
          </div>
        </div>
        <button
          onClick={addSlot}
          className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 active:scale-90 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-4">
        {slots.map((slot, idx) => {
          const [startTime, endTime] = slot.time.split(" - ");
          const energy = getEnergyInfo(startTime); // Detect the BPM zone

          // Find the actual DJ object to access their genres array
          const selectedDjData = vault.find((d) => d._id === slot.djId);

          return (
            <div key={idx} className="relative group">
              <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-[2rem] backdrop-blur-sm transition-all hover:border-indigo-500/50">
                {/* TOP BAR: Time and Energy Indicator */}
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-zinc-800">
                      <Clock size={12} className="text-indigo-500" />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) =>
                          updateSlotTime(idx, "start", e.target.value)
                        }
                        className="bg-transparent text-xs font-mono text-white outline-none"
                      />
                      <div className="w-2 h-[1px] bg-zinc-700" />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) =>
                          updateSlotTime(idx, "end", e.target.value)
                        }
                        className="bg-transparent text-xs font-mono text-white outline-none"
                      />
                    </div>

                    {/* NEW: Energy Recommendation Badge */}
                    <div className="flex items-center gap-2 px-1">
                      <Activity size={10} className={energy.color} />
                      <span
                        className={`text-[9px] font-bold uppercase tracking-tighter ${energy.color}`}
                      >
                        {energy.role} • {energy.bpm} BPM
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                      Est. Fee
                    </span>
                    <span className="text-sm font-mono font-bold text-green-400">
                      R{slot.fee.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* DJ SELECTOR */}
                <select
                  value={slot.djId}
                  onChange={(e) => handleDjSelect(idx, e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-xs font-bold text-white focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                >
                  <option value="">-- ASSIGN ARTIST --</option>
                  {vault.map((dj) => (
                    <option key={dj._id} value={dj._id}>
                      {dj.alias} ({dj.experience})
                    </option>
                  ))}
                </select>

                {/* ARTIST GENRES & SLOT GUIDANCE */}
                <div className="mt-4 space-y-2 border-t border-zinc-800/50 pt-3">
                  {selectedDjData ? (
                    <>
                      {/* Show Selected DJ's Actual Genres */}
                      <div className="flex items-center gap-2">
                        <Music size={10} className="text-indigo-400" />
                        <div className="flex flex-wrap gap-1">
                          {selectedDjData.genres.map((g, i) => (
                            <span
                              key={i}
                              className="text-[9px] text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-md"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Energy Match Guidance */}
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Info size={10} className="text-zinc-600" />
                        <p className="text-[9px] leading-tight">
                          Slot Target:{" "}
                          <span className="text-zinc-400 font-bold">
                            {energy.genres}
                          </span>
                        </p>
                      </div>
                    </>
                  ) : (
                    /* Suggestions if no DJ selected */
                    <div className="flex gap-2 items-center overflow-x-auto no-scrollbar">
                      <Zap
                        size={10}
                        className="text-indigo-500 flex-shrink-0"
                      />
                      {getSuggestions(idx).map((sug) => (
                        <button
                          key={sug._id}
                          onClick={() => handleDjSelect(idx, sug._id)}
                          className="text-[9px] whitespace-nowrap bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-bold"
                        >
                          {sug.alias}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {slots.length > 1 && (
                <button
                  onClick={() => removeSlot(idx)}
                  className="absolute -right-1 -top-1 bg-zinc-800 text-zinc-500 hover:text-red-400 p-1.5 rounded-full border border-zinc-700 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* TOTAL BAR (Remains as we built it) */}
      <div className="mt-8 px-2 border-t border-zinc-800 pt-6">
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-3xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-2 rounded-xl">
              <Wallet size={16} className="text-green-400" />
            </div>
            <div>
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                Lineup Total
              </p>
              <p className="text-xl font-mono font-black text-white leading-none">
                R{totalBudget.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">
              Progress
            </p>
            <p className="text-xs font-bold text-zinc-300 italic">
              {slots.filter((s) => s.djId).length} / {slots.length} Booked
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineupRosterStep2;
