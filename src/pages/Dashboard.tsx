import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { djService, eventService } from "../services/api";
import { Calendar, ArrowRight, Users, Zap, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    djCount: 0,
    eventCount: 0,
    totalSpend: 0,
  });
  const [loading, setLoading] = useState(true);

  const MONTHLY_CAP = 50000;

  useEffect(() => {
    Promise.all([djService.getAll(), eventService.getAll()])
      .then(([djs, evs]) => {
        // Use the new property event_dj_total_price if available, fallback to totalBudget
        const totalSpend = evs.data.reduce(
          (sum: number, e: any) =>
            sum + (e.event_dj_total_price || e.totalBudget || 0),
          0,
        );

        setStats({
          djCount: djs.data.length,
          eventCount: evs.data.length,
          totalSpend: totalSpend,
        });

        // Sort by date descending (latest first) and take top 3
        const sorted = evs.data.sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setEvents(sorted.slice(0, 3));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Data fetch error", err);
        setLoading(false);
      });
  }, []);

  const burnRate = Math.min((stats.totalSpend / MONTHLY_CAP) * 100, 100);

  return (
    <div className="p-6 max-w-md mx-auto pb-24 text-white font-sans selection:bg-indigo-500">
      {/* Brand Header */}
      <header className="mb-8 mt-4 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic leading-none">
            GROOVE
            <span className="text-indigo-500 underline decoration-indigo-500/30">
              OPS
            </span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            Sector 01 • Operations
          </p>
        </div>
        <div className="bg-zinc-900 p-2 rounded-full border border-zinc-800">
          <Zap size={16} className="text-yellow-500 fill-yellow-500" />
        </div>
      </header>

      {/* FINANCIAL BURN RATE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-6">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              Artist Spend
            </p>
            <p className="text-2xl font-bold">
              R{stats.totalSpend.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-indigo-400 text-xs font-bold">
              {Math.round(burnRate)}% of Cap
            </p>
          </div>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-fuchsia-500 transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
            style={{ width: `${burnRate}%` }}
          />
        </div>
      </div>

      {/* Primary Action Card */}
      <Link
        to="/lineup/new"
        className="relative block overflow-hidden bg-indigo-600 rounded-3xl p-6 mb-8 group active:scale-[0.98] transition-all shadow-xl shadow-indigo-900/40"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-white text-xl font-bold">New Mission</h2>
            <TrendingUp size={16} className="text-indigo-200" />
          </div>
          <p className="text-indigo-100 text-xs mb-5 opacity-70">
            Assemble a lineup and deploy logistics.
          </p>
          <div className="flex items-center gap-2 bg-white text-indigo-600 w-fit px-4 py-2 rounded-xl font-black text-xs uppercase tracking-tight group-hover:gap-4 transition-all">
            NEW LINEUP <ArrowRight size={14} />
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-black/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      </Link>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col items-center text-center">
          <Users size={16} className="text-zinc-600 mb-2" />
          <p className="text-2xl font-black italic">{stats.djCount}</p>
          <p className="text-[9px] text-zinc-500 font-bold uppercase">
            Artist(s)
          </p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col items-center text-center">
          <Calendar size={16} className="text-zinc-600 mb-2" />
          <p className="text-2xl font-black italic">{stats.eventCount}</p>
          <p className="text-[9px] text-zinc-500 font-bold uppercase">
            Mission(s)
          </p>
        </div>
      </div>

      {/* Active Missions (Top 3 Latest) */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            Active Missions
          </h3>
          <Link
            to="/events"
            className="text-indigo-400 text-[10px] font-black uppercase hover:underline"
          >
            Log History
          </Link>
        </div>

        <div className="space-y-3">
          {loading
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-zinc-900 rounded-3xl animate-pulse"
                />
              ))
            : events.map((event) => {
                const isToday =
                  new Date(event.date).toDateString() ===
                  new Date().toDateString();

                return (
                  <div
                    key={event._id}
                    onClick={() => navigate(`/events/${event._id}`)}
                    className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl relative overflow-hidden group cursor-pointer hover:border-indigo-500/50 hover:bg-zinc-900/80 transition-all active:scale-[0.98]"
                  >
                    {isToday && (
                      <div className="absolute top-0 right-0 p-3">
                        <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                          <h4 className="font-black text-base uppercase tracking-tight italic group-hover:text-indigo-400 transition-colors leading-none">
                            {event.name}
                          </h4>

                          <div className="flex items-center gap-2 text-[9px] text-zinc-500 mt-2 font-bold uppercase tracking-wider">
                            <span className="text-indigo-500 flex-shrink-0">
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                            <span>•</span>

                            {/* SHORTENED ADDRESS LOGIC */}
                            <span className="truncate max-w-[140px] italic">
                              {event.location?.split(",")[0] ||
                                "Unknown Sector"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-mono font-bold text-green-500">
                            R
                            {(
                              event.event_dj_total_price ||
                              event.totalBudget ||
                              0
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Display Genres Selected in Step 1 */}
                      {event.targetGenres && event.targetGenres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {event.targetGenres
                            .slice(0, 3)
                            .map((genre: string, i: number) => (
                              <span
                                key={i}
                                className="text-[7px] font-black uppercase bg-indigo-500/10 text-indigo-400/80 px-2 py-0.5 rounded border border-indigo-500/10"
                              >
                                {genre}
                              </span>
                            ))}
                          {event.targetGenres.length > 3 && (
                            <span className="text-[7px] font-black text-zinc-600 self-center uppercase ml-1">
                              +{event.targetGenres.length - 3} MORE
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Subtle Arrow on hover */}
                    <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                      <ArrowRight size={14} className="text-indigo-500" />
                    </div>
                  </div>
                );
              })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
