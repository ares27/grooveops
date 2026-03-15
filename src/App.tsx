import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import LineupBuilder from "./pages/LineupBuilder";
import Vault from "./pages/Vault";
import EventsLog from "./pages/EventsLog";
import EventDetails from "./pages/EventDetails";
import ArtistProfile from "./pages/ArtistProfile";
import Login from "./pages/Login";
import OrganiserSignup from "./pages/OrganiserSignup";
import ArtistJoin from "./pages/ArtistJoin";
import ArtistProfileSetup from "./pages/ArtistProfileSetup";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import EmailVerificationCheck from "./components/EmailVerificationCheck";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/organiser-signup" element={<OrganiserSignup />} />
          <Route path="/join-as-artist" element={<ArtistJoin />} />
          <Route path="/artist-join" element={<ArtistJoin />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Artist Profile Setup - No email verification required (invited artists) */}
          <Route
            path="/artist-profile-setup"
            element={
              <ProtectedRoute>
                <ArtistProfileSetup />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <EmailVerificationCheck>
                  <div className="pb-20 min-h-screen bg-zinc-950 text-white">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/lineup/new" element={<LineupBuilder />} />
                      <Route path="/vault" element={<Vault />} />
                      <Route path="/events" element={<EventsLog />} />
                      <Route path="/events/:id" element={<EventDetails />} />
                      <Route path="/artist/:id" element={<ArtistProfile />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <BottomNav />
                  </div>
                </EmailVerificationCheck>
              </ProtectedRoute>
            }
          />

          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
