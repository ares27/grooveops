import {
  Sparkles,
  CheckCircle2,
  MapPin,
  Calendar,
  Wallet,
  Clock,
  ArrowLeft,
} from "lucide-react";

interface DJ {
  _id: string;
  alias: string;
  genres: string[];
  fee?: number;
}

interface LineupSlot {
  time: string;
  djId: string;
  fee: number;
  artistAlias: string;
}

interface Props {
  eventDetails: {
    name: string;
    location: string;
    date: string;
    targetGenres: string[];
  };
  slots: LineupSlot[];
  vault: DJ[];
  event_dj_total_price: number;
  loading: boolean;
  onSave: () => void;
  onBack: () => void;
}

const LineupRosterStep3 = ({
  eventDetails,
  slots,
  vault,
  event_dj_total_price,
  loading,
  onSave,
  onBack,
}: Props) => {
  const bookedSlots = slots.filter((s) => s.djId);

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      {/* MISSION CARD: THE HEADER */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-1 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20">
        <div className="bg-zinc-950/20 backdrop-blur-md p-8 rounded-[2.4rem] relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 opacity-80">
                  Event Manifest
                </span>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
                  {eventDetails.name || "Untitled"}
                </h2>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner">
                <Sparkles className="text-white" size={24} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-indigo-300" />
                <span className="text-xs font-bold text-indigo-100">
                  {eventDetails.location}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-indigo-300" />
                <span className="text-xs font-bold text-indigo-100">
                  {eventDetails.date
                    ? new Date(eventDetails.date).toDateString()
                    : "TBD"}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1">
              {eventDetails.targetGenres.map((g, i) => (
                <span
                  key={i}
                  className="text-[8px] px-2 py-0.5 rounded-md bg-white/10 text-white font-bold uppercase tracking-widest border border-white/5"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Abstract glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>
      </div>

      {/* THE ROSTER LIST */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <Clock size={12} /> Live Lineup Schedule
        </h3>

        <div className="space-y-2">
          {bookedSlots.map((slot, i) => {
            const dj = vault.find((d) => d._id === slot.djId);
            return (
              <div
                key={i}
                className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-3xl hover:border-zinc-700 transition-colors"
              >
                <div className="text-center min-w-[60px] border-r border-zinc-800 pr-4">
                  <p className="text-[10px] font-mono font-bold text-indigo-500 leading-none">
                    {slot.time.split(" - ")[0]}
                  </p>
                  <p className="text-[8px] font-mono text-zinc-600 uppercase mt-1">
                    Start
                  </p>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-black uppercase italic text-zinc-100">
                    {dj?.alias}
                  </p>
                  <div className="flex gap-2 mt-1">
                    {dj?.genres.slice(0, 2).map((g, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] text-zinc-500 font-medium"
                      >
                        #{g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-zinc-300">
                    R{slot.fee.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FINANCE SUMMARY */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-[2rem] flex justify-between items-center shadow-inner">
        <div className="flex items-center gap-4">
          <div className="bg-green-500/10 p-3 rounded-2xl border border-green-500/20">
            <Wallet className="text-green-500" size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Grand Total
            </p>
            <p className="text-2xl font-mono font-black text-white">
              R{event_dj_total_price.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            Capacity
          </p>
          <p className="text-lg font-black text-zinc-200">
            {bookedSlots.length} / {slots.length}
          </p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="space-y-3 pt-4">
        <button
          onClick={onSave}
          disabled={loading || bookedSlots.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
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
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-white transition-colors py-2 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <ArrowLeft size={12} /> Adjust Lineup
        </button>
      </div>
    </div>
  );
};

export default LineupRosterStep3;
