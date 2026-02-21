import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { djService, eventService } from "../services/api";
import { Plus, X, Sparkles, Zap, CheckCircle2 } from "lucide-react"; // Added X and Sparkles

// --- Types ---
interface DJ {
  _id: string;
  alias: string;
  name: string;
  genres: string[];
  vibes: string[];
  experience: string;
  fee?: number;
}

interface LineupSlot {
  time: string;
  djId: string;
  fee: number;
  artistAlias: string;
}

const LineupBuilder = () => {
  const [step, setStep] = useState(1);
  const [vault, setVault] = useState<DJ[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [eventDetails, setEventDetails] = useState({
    name: "",
    location: "",
    date: "",
    description: "",
  });

  const [slots, setSlots] = useState<LineupSlot[]>([
    { time: "22:00 - 23:00", djId: "", artistAlias: "", fee: 0 },
  ]);

  useEffect(() => {
    djService
      .getAll()
      .then((res) => {
        setVault(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load DJs", err);
        setLoading(false);
      });
  }, []);

  const addSlot = () => {
    const lastSlot = slots[slots.length - 1];
    let newStartTime = "22:00";
    let newEndTime = "23:00";

    if (lastSlot && lastSlot.time.includes("-")) {
      const parts = lastSlot.time.split("-").map((t) => t.trim());
      newStartTime = parts[1];
      const [hours, mins] = newStartTime.split(":").map(Number);
      newEndTime = `${String((hours + 1) % 24).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    }

    const newSlot: LineupSlot = {
      time: `${newStartTime} - ${newEndTime}`,
      djId: "",
      artistAlias: "",
      fee: 0,
    };

    setSlots([...slots, newSlot]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const getSuggestions = (currentSlotIndex: number) => {
    if (vault.length === 0) return [];

    // 1. Get genres from DJs already booked in this specific event
    const bookedGenres = slots
      .map((s) => vault.find((d) => d._id === s.djId)?.genres)
      .flat()
      .filter(Boolean) as string[];

    const slotTime = slots[currentSlotIndex].time;

    return vault
      .filter((dj) => {
        // Rule 1: Don't suggest if already booked in this event
        const isAlreadyBooked = slots.some((s) => s.djId === dj._id);
        if (isAlreadyBooked) return false;

        // Rule 2: If no one is booked yet, suggest the "Pro" or "Regular" DJs first
        if (bookedGenres.length === 0) {
          return dj.experience === "pro" || dj.experience === "regular";
        }

        // Rule 3: Match based on genres already present in the lineup
        const hasGenreMatch = dj.genres.some((g) => bookedGenres.includes(g));

        // Rule 4: Time-based Vibe check (looser matching)
        const hour = parseInt(slotTime.split(":")[0]);
        const isPeakTime = hour >= 0 && hour <= 2;
        const isWarmup = hour >= 20 && hour <= 23;

        const hasVibeMatch = dj.vibes?.some((v: string) => {
          const vibe = v.toLowerCase();
          if (isPeakTime) return vibe.includes("peak") || vibe.includes("high");
          if (isWarmup) return vibe.includes("warm") || vibe.includes("chill");
          return false;
        });

        return hasGenreMatch || hasVibeMatch;
      })
      .slice(0, 3); // Bumped to 3 for better variety
  };

  const handleDjSelect = (index: number, djId: string) => {
    const selectedDj = vault.find((d) => d._id === djId);
    const newSlots = [...slots];
    newSlots[index] = {
      ...newSlots[index],
      djId,
      fee: selectedDj?.fee || 0,
    };
    setSlots(newSlots);
  };

  const handleTimeChange = (index: number, newTime: string) => {
    const newSlots = [...slots];
    newSlots[index].time = newTime;
    setSlots(newSlots);
  };

  const calculateTotal = () => slots.reduce((sum, s) => sum + s.fee, 0);

  const saveToDatabase = async () => {
    // 1. Filter out empty slots
    const activeSlots = slots.filter((s) => s.djId !== "");
    const totalArtistSpend = calculateTotal();

    // 3. Enrich the payload with financial data and slot specifics
    const finalPayload = {
      ...eventDetails,
      djLineup: activeSlots.map((slot) => {
        const dj = vault.find((d) => d._id === slot.djId);
        return {
          ...slot,
          artistAlias: dj?.alias || "Unknown", // Snapshot the alias in case DJ is deleted later
          finalFee: dj?.fee || 0, // Lock in the price at time of booking
        };
      }),
      totalBudget: totalArtistSpend,
      coordinatorId: "system_admin",
      status: "confirmed",
      createdAt: new Date(),
    };

    try {
      setLoading(true);
      // 1. Capture the response
      const response = await eventService.create(finalPayload);

      // 2. Extract the new ID (usually response.data._id for MongoDB/Express)
      const newEventId = response.data._id;

      if (newEventId) {
        // 3. Navigate to the detail page of the new event
        navigate(`/events/${newEventId}`);
      } else {
        // Fallback if ID isn't returned for some reason
        navigate("/events");
      }
    } catch (err) {
      console.error("Save Error:", err);
      alert("❌ Error saving event. Check console for details.");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-white animate-pulse">
        Initializing System...
      </div>
    );

  return (
    <div className="p-4 max-w-md mx-auto pb-24 text-white">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tighter italic">
          GROOVE<span className="text-indigo-500">OPS</span>
        </h1>
        <p className="text-zinc-400 text-xs uppercase font-bold tracking-widest mt-1">
          Event Creator • Step {step}
        </p>
      </header>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? "bg-indigo-500" : "bg-zinc-800"}`}
          />
        ))}
      </div>

      {/* STEP 1: BASICS */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-2">
            <input
              className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Event Name"
              value={eventDetails.name}
              onChange={(e) =>
                setEventDetails({ ...eventDetails, name: e.target.value })
              }
            />
            <input
              type="date"
              className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-400"
              value={eventDetails.date}
              onChange={(e) =>
                setEventDetails({ ...eventDetails, date: e.target.value })
              }
            />
            <input
              className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Location"
              value={eventDetails.location}
              onChange={(e) =>
                setEventDetails({ ...eventDetails, location: e.target.value })
              }
            />
          </div>
          <button
            disabled={!eventDetails.name || !eventDetails.date}
            onClick={() => setStep(2)}
            className="w-full bg-indigo-600 disabled:bg-zinc-800 py-4 rounded-xl font-bold mt-4 shadow-lg shadow-indigo-900/20"
          >
            Next: Build Lineup
          </button>
        </div>
      )}

      {/* STEP 2: DYNAMIC LINEUP */}
      {step === 2 && (
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-4">
            <header>
              <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
                <Sparkles size={18} /> Roster
              </h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                Auto-Sequencing Active
              </p>
            </header>
            <button
              onClick={addSlot}
              className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all active:scale-90"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="space-y-3">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/50 backdrop-blur-md p-4 rounded-3xl border border-zinc-800 relative group transition-all hover:border-zinc-700"
              >
                <div className="flex items-center gap-4">
                  {/* TIME CAPTURE SECTION */}
                  <div className="w-1/3">
                    <label className="text-[9px] text-zinc-600 font-black uppercase mb-1.5 block tracking-tighter">
                      Set Time
                    </label>
                    <input
                      type="text"
                      className="w-full bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-[11px] font-mono text-indigo-400 focus:ring-1 focus:ring-indigo-500 outline-none text-center"
                      value={slot.time}
                      onChange={(e) => handleTimeChange(idx, e.target.value)}
                    />
                  </div>

                  {/* ARTIST SELECTION */}
                  <div className="flex-1">
                    <label className="text-[9px] text-zinc-600 font-black uppercase mb-1.5 block tracking-tighter">
                      Assign Agent
                    </label>
                    <select
                      className="w-full bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-[11px] font-bold focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                      value={slot.djId}
                      onChange={(e) => handleDjSelect(idx, e.target.value)}
                    >
                      <option value="">Open Slot...</option>
                      {vault.map((dj) => (
                        <option key={dj._id} value={dj._id}>
                          {dj.alias}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SUGGESTION ENGINE */}
                {!slot.djId && (
                  <div className="mt-4 flex flex-wrap gap-2 items-center">
                    <div className="bg-indigo-500/10 p-1 rounded-md">
                      <Zap
                        size={10}
                        className="text-indigo-500 fill-indigo-500"
                      />
                    </div>
                    {getSuggestions(idx)
                      .slice(0, 3)
                      .map((sug) => (
                        <button
                          key={sug._id}
                          onClick={() => handleDjSelect(idx, sug._id)}
                          className="text-[9px] bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 px-3 py-1.5 rounded-full hover:border-indigo-500 hover:text-indigo-400 transition-all font-bold uppercase tracking-tighter"
                        >
                          {sug.alias}
                        </button>
                      ))}
                  </div>
                )}

                {/* REMOVE SLOT ACTION */}
                {slots.length > 1 && (
                  <button
                    onClick={() => removeSlot(idx)}
                    className="absolute -right-2 -top-2 bg-zinc-800 text-zinc-500 hover:text-red-400 p-1.5 rounded-full border border-zinc-700 opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* NAVIGATION */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-zinc-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-colors"
            >
              Review Lineup
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: FINAL REVIEW */}
      {step === 3 && (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          {/* Mission Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-white">
                    {eventDetails.name || "Untitled Mission"}
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200 mt-2">
                    {eventDetails.location} •{" "}
                    {new Date(eventDetails.date).toDateString()}
                  </p>
                </div>
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
                  <Sparkles className="text-white" size={20} />
                </div>
              </div>

              {/* Live Lineup Manifest */}
              <div className="space-y-3 pt-6 border-t border-white/10">
                {slots
                  .filter((s) => s.djId)
                  .map((s, i) => {
                    const dj = vault.find((d) => d._id === s.djId);
                    return (
                      <div
                        key={i}
                        className="flex justify-between items-center group"
                      >
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-indigo-300 tracking-tighter">
                            {s.time}
                          </span>
                          <span className="text-sm font-black italic uppercase text-white">
                            {dj?.alias}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-white/80 bg-black/20 px-3 py-1 rounded-lg">
                          R{dj?.fee?.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Total Impact Footer */}
              <div className="mt-8 flex justify-between items-center bg-black/40 p-5 rounded-3xl border border-white/10">
                <div>
                  <p className="text-[9px] font-black uppercase text-white/50 tracking-widest">
                    Estimated Payout
                  </p>
                  <p className="text-2xl font-black text-green-400 font-mono leading-none">
                    R{calculateTotal().toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-white/50 tracking-widest">
                    Slots
                  </p>
                  <p className="text-xl font-black text-white leading-none">
                    {slots.filter((s) => s.djId).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={saveToDatabase}
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  Initialize Event
                </>
              )}
            </button>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-zinc-900 text-zinc-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors"
            >
              Adjust Deployment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LineupBuilder;
