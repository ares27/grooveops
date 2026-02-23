import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { djService, eventService } from "../services/api";
import LineupRosterStep1 from "../components/LineupRosterStep1";
import LineupRosterStep2 from "../components/LineupRosterStep2";
import LineupRosterStep3 from "../components/LineupRosterStep3";

// --- Types ---
interface DJ {
  _id: string;
  alias: string;
  name: string;
  genres: string[];
  vibes: string[];
  experience: string;
  fee?: number;
  contactNumber?: string;
  igLink?: string;
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
    targetGenres: [] as string[],
    eventFee: 0,
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

  const getSuggestions = (currentSlotIndex: number) => {
    if (vault.length === 0) return [];

    // 1. Get genres from DJs already booked in this specific event
    const bookedGenres = slots
      .map((s) => vault.find((d) => d._id === s.djId)?.genres)
      .flat()
      .filter(Boolean) as string[];

    const slotTime = slots[currentSlotIndex].time;

    return (
      vault
        .filter((dj) => {
          // Rule 1: Don't suggest if already booked in this event
          const isAlreadyBooked = slots.some((s) => s.djId === dj._id);
          if (isAlreadyBooked) return false;

          // Rule 2: Check for match with Event's Global Target Genres (Step 1 data)
          const matchesEventProfile = dj.genres.some((g) =>
            eventDetails.targetGenres.includes(g),
          );

          // Rule 3: If no one is booked yet, prioritize Event Profile + Experience
          if (bookedGenres.length === 0) {
            return (
              matchesEventProfile &&
              (dj.experience === "pro" || dj.experience === "regular")
            );
          }

          // Rule 4: Match based on genres already present in the lineup (Consistency)
          const hasGenreMatch = dj.genres.some((g) => bookedGenres.includes(g));

          // Rule 5: Time-based Vibe check
          const hour = parseInt(slotTime.split(":")[0]);
          const isPeakTime = hour >= 0 && hour <= 2;
          const isWarmup = hour >= 20 && hour <= 23;

          const hasVibeMatch = dj.vibes?.some((v: string) => {
            const vibe = v.toLowerCase();
            if (isPeakTime)
              return vibe.includes("peak") || vibe.includes("high");
            if (isWarmup)
              return vibe.includes("warm") || vibe.includes("chill");
            return false;
          });

          // Logic: Suggest if they fit the event's global vibe OR match current energy
          return matchesEventProfile || hasGenreMatch || hasVibeMatch;
        })
        // Sort logic: Move the best "Profile Matches" to the top of the list
        .sort((a, b) => {
          const aMatches = a.genres.filter((g) =>
            eventDetails.targetGenres.includes(g),
          ).length;
          const bMatches = b.genres.filter((g) =>
            eventDetails.targetGenres.includes(g),
          ).length;
          return bMatches - aMatches;
        })
        .slice(0, 3)
    );
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
          time: slot.time,
          djId: slot.djId,
          fee: slot.fee,
          artistAlias: dj?.alias || "Unknown",
          name: dj?.name || "Legal Name Not Listed", // This fixes the label in your screenshot
          genres: dj?.genres || [],
          phone: dj?.contactNumber || "",
          instagram: dj?.igLink || "",
        };
      }),
      event_dj_total_price: totalArtistSpend,
      coordinatorId: "system_admin",
      status: "confirmed",
      event_status: "Upcoming",
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
        <LineupRosterStep1
          eventDetails={eventDetails}
          setEventDetails={setEventDetails}
          onNext={() => setStep(2)}
        />
      )}

      {/* STEP 2: DYNAMIC LINEUP */}
      {step === 2 && (
        <>
          <LineupRosterStep2
            slots={slots}
            vault={vault}
            setSlots={setSlots}
            getSuggestions={getSuggestions}
            targetGenres={eventDetails.targetGenres}
          />

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-zinc-800"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/20"
            >
              Review Lineup
            </button>
          </div>
        </>
      )}

      {/* STEP 3: FINAL REVIEW */}
      {step === 3 && (
        <LineupRosterStep3
          eventDetails={eventDetails}
          slots={slots}
          vault={vault}
          event_dj_total_price={calculateTotal()}
          loading={loading}
          onSave={saveToDatabase}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  );
};

export default LineupBuilder;
