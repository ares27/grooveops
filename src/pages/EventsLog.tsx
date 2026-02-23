import { useState, useEffect } from "react";
import { eventService } from "../services/api";
import {
  AlertTriangle,
  Trash2,
  X,
  Calendar,
  MapPin,
  Music,
  Plus,
  Search,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const EventsLog = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventService.getAll();
      // Sort by date (nearest first)
      const sorted = res.data.sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      setEvents(sorted);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching events", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eventService.delete(id);
      setEvents(events.filter((e) => e._id !== id));
      setDeletingId(null);
    } catch (err) {
      alert("System Error: Could not decommission event.");
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-indigo-500 animate-pulse">
        <div className="h-8 w-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em]">
          Synchronizing_Logs...
        </span>
      </div>
    );

  return (
    <div className="p-4 max-w-md mx-auto pb-24 text-white animate-in fade-in duration-500">
      {/* Header */}
      <header className="mb-8 mt-4 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic leading-none uppercase">
            Groove{" "}
            <span className="text-indigo-500 underline decoration-indigo-500/20">
              Logs
            </span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            Sector 02 • Deployment History
          </p>
        </div>
        <Link
          to="/lineup/new"
          className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-900/40 hover:scale-110 active:scale-95 transition-all"
        >
          <Plus size={20} strokeWidth={3} />
        </Link>
      </header>

      {/* Search Bar */}
      <div className="relative group mb-8">
        <input
          type="text"
          placeholder="Filter Missions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600 text-sm font-bold"
        />
        <Search
          className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-indigo-500 transition-colors"
          size={18}
        />
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-[2.5rem]">
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
              No Missions Recorded
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event._id}
              className={`relative bg-zinc-900 border transition-all duration-300 rounded-[2rem] overflow-hidden group shadow-xl ${
                deletingId === event._id
                  ? "border-red-500 ring-2 ring-red-500/20"
                  : "border-zinc-800 hover:border-indigo-500/50"
              }`}
            >
              {/* DELETE OVERLAY */}
              {deletingId === event._id && (
                <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
                  <AlertTriangle className="text-red-500 mb-2" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white mb-6">
                    Confirm Decommission?
                  </p>
                  <div className="flex gap-6">
                    <button
                      onClick={() => setDeletingId(null)}
                      className="bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors"
                    >
                      <X size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="bg-red-600 w-12 h-12 rounded-full shadow-lg shadow-red-900/40 flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* CARD CONTENT */}
              <div
                onClick={() => navigate(`/events/${event._id}`)}
                className="p-5 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">
                        {event.name}
                      </h3>
                      {new Date(event.date).toDateString() ===
                        new Date().toDateString() && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 opacity-50">
                      <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-200">
                        <Calendar size={12} className="text-indigo-500" />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-200">
                        <MapPin size={12} className="text-indigo-500" />
                        {event.location}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(event._id);
                    }}
                    className="text-zinc-800 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex justify-between items-center pt-5 border-t border-zinc-800/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 shadow-inner">
                      <Music size={10} className="text-zinc-600" />
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                        {event.djLineup?.length || 0} DJs
                      </span>
                    </div>

                    {/* DJ AVATAR STACK */}
                    <div className="flex -space-x-2">
                      {event.djLineup
                        ?.slice(0, 3)
                        .map((slot: any, i: number) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-black uppercase shadow-lg group-hover:scale-110 transition-transform"
                            style={{ transitionDelay: `${i * 50}ms` }}
                          >
                            {slot.artistAlias?.charAt(0)}
                          </div>
                        ))}
                      {event.djLineup?.length > 3 && (
                        <div className="w-7 h-7 rounded-xl bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[9px] font-black text-zinc-500">
                          +{event.djLineup.length - 3}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">
                      Budget Allocation
                    </span>
                    <p className="text-green-500 font-mono text-sm font-black bg-green-500/5 px-2 py-0.5 rounded-md border border-green-500/10">
                      R
                      {(
                        event.event_dj_total_price ||
                        event.totalBudget ||
                        0
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsLog;
