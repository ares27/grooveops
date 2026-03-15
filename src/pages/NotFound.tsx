import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex flex-col items-center justify-center p-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative text-center max-w-md animate-in fade-in zoom-in-95 duration-500">
        {/* Icon */}
        <div className="mb-6">
          <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-red-500/20">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-8xl font-black italic tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
          404
        </h1>

        {/* Message */}
        <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
          Page Not Found
        </h2>
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black uppercase tracking-widest py-3 px-8 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all active:scale-95"
        >
          <ArrowLeft size={18} />
          BACK TO HOME
        </button>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-zinc-800/50">
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">
            Need Help?
          </p>
          <p className="text-zinc-500 text-[9px] mt-2">
            Contact support if you need assistance
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
