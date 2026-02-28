import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventService } from "../services/api";
import {
  Clock,
  Phone,
  ChevronLeft,
  MapPin,
  Calendar,
  Zap,
  Sparkles,
  Wallet,
  Users,
  Share2,
  Instagram,
  Navigation,
  Ticket,
} from "lucide-react";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getEventDetails = async () => {
      try {
        setLoading(true);
        const res = await eventService.getById(id!);
        if (res.data) setEvent(res.data);
      } catch (err) {
        console.error("Transmission Error: Signal lost.", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) getEventDetails();
  }, [id]);

  const shareToWhatsApp = () => {
    if (!event) return;
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
      <div className="flex flex-col items-center justify-center min-h-screen text-indigo-500 animate-pulse">
        <Sparkles size={48} className="mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em]">
          Decrypting Mission Logs...
        </span>
      </div>
    );

  if (!event) return <div className="p-10 text-white">Event not found.</div>;

  return (
    <div className="p-4 max-w-md mx-auto pb-24 text-white animate-in fade-in duration-500">
      {/* Navigation Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 mb-6 hover:text-white transition-all group"
      >
        <ChevronLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="text-[10px] font-black uppercase tracking-widest">
          Archive Center
        </span>
      </button>

      {/* HERO SECTION: MISSION BRIEFING */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-[1px] rounded-[2.5rem] mb-8 shadow-2xl shadow-indigo-500/20">
        <div className="bg-zinc-950/40 backdrop-blur-xl rounded-[2.45rem] p-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1 opacity-60">
                  <MapPin size={10} className="text-indigo-300" />
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-300">
                    Target Location
                  </span>
                </div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                  {event.name}
                </h1>
              </div>
              <div className="bg-white/10 p-2 rounded-xl border border-white/20">
                <Zap size={18} className="text-white fill-white" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {/* SHORTENED ADDRESS DISPLAY */}
              <div
                title={event.location} // Full address shows on hover
                className="flex items-center gap-1.5 text-indigo-200 text-[10px] font-bold uppercase tracking-wide bg-white/5 px-3 py-1 rounded-full border border-white/10 max-w-[180px]"
              >
                <MapPin size={12} className="flex-shrink-0" />
                <span className="truncate">
                  {event.location?.split(",")[0]}{" "}
                  {/* Shows only the first part of the address */}
                </span>
              </div>

              {/* FIXED MAP TRIGGER */}
              {event.coordinates?.lat && (
                <button
                  onClick={() => {
                    const url = `https://www.google.com/maps/search/?api=1&query=${event.coordinates.lat},${event.coordinates.lng}`;
                    window.open(url, "_blank");
                  }}
                  className="flex items-center gap-1.5 text-white text-[10px] font-black uppercase tracking-widest bg-indigo-500 px-3 py-1 rounded-full shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  <Navigation size={10} /> Navigate
                </button>
              )}

              <div className="flex items-center gap-1.5 text-indigo-200 text-[10px] font-bold uppercase tracking-wide bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <Calendar size={12} /> {new Date(event.date).toDateString()}
              </div>
            </div>

            {/* Event Fee & Description */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2 text-green-400 bg-green-500/10 w-fit px-3 py-1 rounded-lg border border-green-500/20">
                <Ticket size={14} />
                <span className="text-xs font-black uppercase tracking-tighter">
                  Entry:{" "}
                  {event.eventFee > 0 ? `R${event.eventFee}` : "Free Entry"}
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed italic opacity-80">
                {event.description || "No mission description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 opacity-50">
                  <Wallet size={10} className="text-white" />
                  <p className="text-[9px] font-black uppercase tracking-widest">
                    Artist Spend
                  </p>
                </div>
                <p className="text-2xl font-mono font-black text-green-400">
                  R{event.event_dj_total_price?.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 opacity-50">
                  <Users size={10} className="text-white" />
                  <p className="text-[9px] font-black uppercase tracking-widest">
                    Deployment
                  </p>
                </div>
                <p className="text-2xl font-mono font-black text-white">
                  {event.djLineup?.length}{" "}
                  <span className="text-xs uppercase italic text-zinc-400">
                    DJs
                  </span>
                </p>
              </div>
            </div>
          </div>
          {/* Abstract glow */}
          <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>
      </div>

      {/* LINEUP LIST */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
            Deployment Schedule
          </h2>
          <div className="h-[1px] flex-1 bg-zinc-800 mx-4" />
        </div>

        {event.djLineup?.map((slot: any, idx: number) => (
          <div
            key={idx}
            className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-5 flex flex-col gap-4 group hover:bg-zinc-900/60 transition-all border-l-4 border-l-indigo-500 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black border border-zinc-800 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-[10px] font-mono font-bold text-indigo-500 leading-none">
                    {slot.time.split(" - ")[0]}
                  </span>
                  <Clock size={10} className="text-zinc-600 mt-1" />
                </div>
                <div>
                  <h4 className="font-black italic uppercase text-xl leading-tight text-white group-hover:text-indigo-400 transition-colors">
                    {slot.artistAlias}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                    {slot.name || "Legal Name Not Listed"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`tel:${slot.phone}`}
                  className="bg-zinc-800/80 p-2.5 rounded-xl hover:bg-indigo-600 transition-all border border-zinc-700 active:scale-90"
                >
                  <Phone size={16} />
                </a>
                <a
                  href={
                    slot.instagram
                      ? `https://instagram.com/${slot.instagram.replace("@", "")}`
                      : "#"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="bg-zinc-800/80 p-2.5 rounded-xl hover:bg-pink-600 transition-all border border-zinc-700 active:scale-90"
                >
                  <Instagram size={16} />
                </a>
              </div>
            </div>

            {/* Genre Pills */}
            <div className="flex flex-wrap gap-1.5 border-t border-zinc-800/50 pt-3">
              {slot.genres?.map((g: string, i: number) => (
                <span
                  key={i}
                  className="text-[8px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400/80 px-2 py-0.5 rounded-md border border-indigo-500/10"
                >
                  {g}
                </span>
              ))}
              <div className="flex-1" />
              <span className="text-[10px] font-mono font-bold text-green-500 bg-green-500/5 px-2 py-0.5 rounded-md">
                R{slot.finalFee || slot.fee}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-8 space-y-4">
        <button
          onClick={shareToWhatsApp}
          className="w-full bg-green-500/10 border border-green-500/30 text-green-400 py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-green-500/20 transition-all active:scale-[0.98] shadow-lg shadow-green-900/10"
        >
          <Share2 size={18} />
          <span className="text-xs font-black uppercase tracking-widest">
            SHARE MISSION
          </span>
        </button>
      </div>
    </div>
  );
};

export default EventDetails;
