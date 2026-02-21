import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventService } from "../services/api";
import { Clock, Phone, ChevronLeft, MapPin, Calendar, Zap } from "lucide-react";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  console.log("Current Event ID from URL:", id); // Check your browser console!

  useEffect(() => {
    const getEventDetails = async () => {
      try {
        setLoading(true);
        // This calls the NEW route we just added to the backend
        const res = await eventService.getById(id!);

        if (res.data) {
          setEvent(res.data);
        }
      } catch (err) {
        console.error("Transmission Error: Signal lost.", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) getEventDetails();
  }, [id]);

  // 1. Add this function inside your EventDetails component
  const shareToWhatsApp = () => {
    if (!event) return;

    // Format the lineup string
    const lineupString = event.djLineup
      .map((slot: any) => `▪️ *${slot.time}*: ${slot.artistAlias || "TBA"}`)
      .join("\n");

    const message = encodeURIComponent(
      `🛸 *GROOVE OPS: MISSION BRIEFING*\n\n` +
        `📅 *DATE:* ${new Date(event.date).toDateString()}\n` +
        `📍 *LOCATION:* ${event.location}\n` +
        `📋 *EVENT:* ${event.name}\n\n` +
        `*LINEUP DEPLOYMENT:*\n${lineupString}\n\n` +
        `_Please confirm your arrival 15 mins before your set._`,
    );

    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  if (loading)
    return (
      <div className="p-10 text-white animate-pulse italic">
        Accessing encrypted logs...
      </div>
    );
  if (!event) return <div className="p-10 text-white">Event not found.</div>;

  return (
    <div className="p-4 max-w-md mx-auto pb-24 text-white">
      {/* Navigation Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 mb-6 hover:text-white transition-colors"
      >
        <ChevronLeft size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest">
          Back to Logs
        </span>
      </button>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[2.5rem] p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 leading-none">
            {event.name}
          </h1>
          <div className="flex flex-col gap-1 text-indigo-400 font-bold text-xs mb-6 uppercase tracking-tight">
            <span className="flex items-center gap-2">
              <MapPin size={12} /> {event.location}
            </span>
            <span className="flex items-center gap-2">
              <Calendar size={12} /> {new Date(event.date).toDateString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
            <div>
              <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                Budget Allocated
              </p>
              <p className="text-xl font-mono font-bold text-green-500">
                R{event.totalBudget?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                Roster Size
              </p>
              <p className="text-xl font-mono font-bold">
                {event.djLineup?.length} DJs
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Lineup Breakdown */}
      <div className="space-y-4">
        <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 px-2">
          Deployment Schedule
        </h2>
        {event.djLineup?.map((slot: any, idx: number) => (
          <div
            key={idx}
            className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center">
                <Clock size={14} className="text-indigo-500 mb-1" />
                <span className="text-[9px] font-black text-white">
                  {slot.time.split(" - ")[0]}
                </span>
              </div>
              <div>
                <h4 className="font-black italic uppercase text-lg leading-tight group-hover:text-indigo-400 transition-colors">
                  {slot.artistAlias}
                </h4>
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">
                  Fee: R{slot.finalFee || slot.fee}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="bg-zinc-800 p-2.5 rounded-xl hover:text-indigo-400 transition-colors border border-zinc-700">
                <Phone size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 mt-3">
        <button
          onClick={shareToWhatsApp}
          className="w-full mb-8 bg-green-500/10 border border-green-500/50 text-green-400 py-4 rounded-3xl flex items-center justify-center gap-3 hover:bg-green-500/20 transition-all active:scale-95"
        >
          <Zap size={18} className="fill-green-400" />
          <span className="text-xs font-black uppercase tracking-widest">
            Deploy Briefing via WhatsApp
          </span>
        </button>
      </div>
    </div>
  );
};

// CRITICAL FIX: Make sure this line is exactly like this at the bottom!
export default EventDetails;
