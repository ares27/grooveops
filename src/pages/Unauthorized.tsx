import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, Lock } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex flex-col items-center justify-center p-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative text-center max-w-md animate-in fade-in zoom-in-95 duration-500">
        {/* Icon */}
        <div className="mb-6">
          <div className="bg-orange-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/20">
            <Lock size={40} className="text-orange-500" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          You don't have permission to access this page.
          <br />
          Your current role: <span className="text-orange-500 font-black">{role}</span>
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black uppercase tracking-widest py-3 px-8 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all active:scale-95"
        >
          <ArrowLeft size={18} />
          BACK TO HOME
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
