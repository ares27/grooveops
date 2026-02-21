import { useState, useEffect } from "react";
import { eventService } from "../services/api";
import {
  AlertTriangle,
  Trash2,
  X,
  Calendar,
  MapPin,
  ChevronRight,
  Search,
  Filter,
  Clock,
  DollarSign,
  Music,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";

const EventsLog = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // State to track which ID is in the "Confirmation" state
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
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 max-w-md mx-auto pb-24 text-white">
      {/* Header */}
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic uppercase">
            Groove <span className="text-indigo-500">Logs</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
            Deployment History
          </p>
        </div>
        <Link
          to="/lineup/new"
          className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
        >
          <Plus size={20} />
        </Link>
      </header>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        {filteredEvents.map((event) => (
          <div
            key={event._id}
            className={`relative bg-zinc-900 border transition-all duration-300 rounded-3xl overflow-hidden group ${
              deletingId === event._id
                ? "border-red-500 ring-1 ring-red-500"
                : "border-zinc-800 hover:border-indigo-500/50"
            }`}
          >
            {/* DELETE OVERLAY */}
            {deletingId === event._id && (
              <div className="absolute inset-0 z-20 bg-zinc-900/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
                <AlertTriangle className="text-red-500 mb-2" size={24} />
                <p className="text-[10px] font-black uppercase tracking-widest text-white mb-4">
                  Confirm Decommission?
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setDeletingId(null)}
                    className="bg-zinc-800 p-3 rounded-full hover:bg-zinc-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="bg-red-600 p-3 rounded-full shadow-lg shadow-red-900/40 hover:bg-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* CLICKABLE CARD CONTENT */}
            <Link to={`/events/${event._id}`} className="block p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black italic uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                    {event.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 opacity-60">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase">
                      <Calendar size={12} className="text-indigo-500" />
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase">
                      <MapPin size={12} className="text-indigo-500" />
                      {event.location}
                    </span>
                  </div>
                </div>

                {/* Delete Trigger - Button is outside the Link's visual flow via absolute positioning or we stop propagation */}
                <button
                  onClick={(e) => {
                    e.preventDefault(); // Prevents Link navigation
                    e.stopPropagation(); // Prevents event bubbling
                    setDeletingId(event._id);
                  }}
                  className="text-zinc-700 hover:text-red-500 transition-colors p-2 -mr-2 -mt-2 z-10"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-zinc-800/50">
                <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
                  <Music size={10} className="text-zinc-500" />
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                    {event.djLineup?.length || 0} Slots
                  </span>
                </div>

                {/* DJ AVATAR STACK */}
                <div className="flex -space-x-2">
                  {event.djLineup?.slice(0, 3).map((slot: any, i: number) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-zinc-900 flex items-center justify-center text-[8px] font-black uppercase shadow-lg"
                    >
                      {slot.artistAlias?.charAt(0)}
                    </div>
                  ))}
                  {event.djLineup?.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[8px] font-bold">
                      +{event.djLineup.length - 3}
                    </div>
                  )}
                </div>

                <p className="text-green-500 font-mono text-xs font-black">
                  R{event.totalBudget?.toLocaleString()}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsLog;
