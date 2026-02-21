import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LineupBuilder from "./pages/LineupBuilder";
import Vault from "./pages/Vault";
import EventsLog from "./pages/EventsLog";
import EventDetails from "./pages/EventDetails";
import BottomNav from "./components/BottomNav";

function App() {
  return (
    <>
      <BrowserRouter>
        <div className="pb-20 min-h-screen bg-zinc-950 text-white">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lineup/new" element={<LineupBuilder />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/events" element={<EventsLog />} />
            <Route path="/events/:id" element={<EventDetails />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
