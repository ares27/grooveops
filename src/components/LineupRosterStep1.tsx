import {
  Sparkles,
  MapPin,
  Calendar,
  Tag,
  Ticket,
  AlignLeft,
} from "lucide-react";

interface EventDetails {
  name: string;
  location: string;
  date: string;
  description: string;
  targetGenres: string[];
  eventFee: number; // NEW
}

interface Props {
  eventDetails: EventDetails;
  setEventDetails: (details: EventDetails) => void;
  onNext: () => void;
}

const AVAILABLE_GENRES = [
  "Deep House",
  "Tech House",
  "Techno",
  "Amapiano",
  "Hip Hop",
  "R&B",
  "Disco",
  "Afro House",
  "Melodic Techno",
];

const LineupRosterStep1 = ({
  eventDetails,
  setEventDetails,
  onNext,
}: Props) => {
  const toggleGenre = (genre: string) => {
    const current = eventDetails.targetGenres;
    const next = current.includes(genre)
      ? current.filter((g) => g !== genre)
      : [...current, genre];

    setEventDetails({ ...eventDetails, targetGenres: next });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* PRIMARY INPUT GROUP */}
      <div className="space-y-3">
        {/* Name Input */}
        <div className="relative group">
          <input
            className="w-full bg-zinc-900 border border-zinc-800 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Mission / Event Name"
            value={eventDetails.name}
            onChange={(e) =>
              setEventDetails({ ...eventDetails, name: e.target.value })
            }
          />
          <Sparkles
            className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-indigo-500"
            size={18}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Date Input */}
          <div className="relative group">
            <input
              type="date"
              className="w-full bg-zinc-900 border border-zinc-800 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-400 text-sm"
              value={eventDetails.date}
              onChange={(e) =>
                setEventDetails({ ...eventDetails, date: e.target.value })
              }
            />
            <Calendar
              className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-indigo-500"
              size={18}
            />
          </div>

          {/* NEW: Event Entry Fee */}
          <div className="relative group">
            <input
              type="number"
              className="w-full bg-zinc-900 border border-zinc-800 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Fee (R)"
              value={eventDetails.eventFee || ""}
              onChange={(e) =>
                setEventDetails({
                  ...eventDetails,
                  eventFee: Number(e.target.value),
                })
              }
            />
            <Ticket
              className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-indigo-500"
              size={18}
            />
          </div>
        </div>

        {/* Location Input */}
        <div className="relative group">
          <input
            className="w-full bg-zinc-900 border border-zinc-800 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Venue / Location"
            value={eventDetails.location}
            onChange={(e) =>
              setEventDetails({ ...eventDetails, location: e.target.value })
            }
          />
          <MapPin
            className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-indigo-500"
            size={18}
          />
        </div>

        {/* NEW: Event Description */}
        <div className="relative group">
          <textarea
            className="w-full bg-zinc-900 border border-zinc-800 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] resize-none"
            placeholder="Mission Briefing / Description..."
            value={eventDetails.description}
            onChange={(e) =>
              setEventDetails({ ...eventDetails, description: e.target.value })
            }
          />
          <AlignLeft
            className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-indigo-500"
            size={18}
          />
        </div>
      </div>

      {/* GENRE SELECTION SECTION */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Tag size={14} className="text-indigo-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Target Event Genres
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {AVAILABLE_GENRES.map((genre) => {
            const isSelected = eventDetails.targetGenres.includes(genre);
            return (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  isSelected
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      <button
        disabled={
          !eventDetails.name ||
          !eventDetails.date ||
          eventDetails.targetGenres.length === 0
        }
        onClick={onNext}
        className="w-full bg-indigo-600 disabled:bg-zinc-800 disabled:text-zinc-600 py-5 rounded-[2rem] font-black uppercase tracking-widest mt-4 shadow-xl shadow-indigo-900/20 active:scale-95 transition-all"
      >
        Build Lineup
      </button>
    </div>
  );
};

export default LineupRosterStep1;
