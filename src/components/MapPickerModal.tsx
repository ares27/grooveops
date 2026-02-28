import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { X, Check, Navigation } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React-Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  initialCoords: { lat: number; lng: number };
  onConfirm: (address: string, coords: { lat: number; lng: number }) => void;
  onClose: () => void;
}

const MapPickerModal = ({ initialCoords, onConfirm, onClose }: Props) => {
  const [position, setPosition] = useState(initialCoords);
  const [addressPreview, setAddressPreview] = useState(
    "Drag pin to mission site...",
  );

  // Component to handle map clicks/drags
  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });
    return <Marker position={position} />;
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await res.json();
      setAddressPreview(data.display_name || "Unknown Sector");
    } catch {
      setAddressPreview("Coordinates Acquired");
    }
  };

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setPosition(newPos);
      reverseGeocode(newPos.lat, newPos.lng);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md p-4 flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="bg-zinc-900 w-full max-w-md border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-zinc-800">
          <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500">
            Where's the mission?
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="map-tiles-dark"
            />
            <LocationPicker />
          </MapContainer>

          <button
            onClick={handleCurrentLocation}
            className="absolute bottom-6 right-6 z-[1000] bg-indigo-600 p-4 rounded-2xl shadow-xl active:scale-90 transition-all"
          >
            <Navigation size={20} className="fill-white" />
          </button>
        </div>

        {/* Footer info */}
        <div className="p-6 bg-zinc-950 border-t border-zinc-800 space-y-4">
          <p className="text-[10px] text-zinc-400 font-medium leading-tight line-clamp-2 italic">
            {addressPreview}
          </p>
          <button
            onClick={() => onConfirm(addressPreview, position)}
            className="w-full bg-indigo-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
          >
            <Check size={16} strokeWidth={4} /> Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPickerModal;
