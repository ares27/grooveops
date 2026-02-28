import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Loader2,
  Navigation,
  Target,
  Map as MapIcon,
  X as CloseIcon,
} from "lucide-react";
import MapPickerModal from "./MapPickerModal";

interface Props {
  value: string;
  onChange: (address: string, coords: { lat: number; lng: number }) => void;
}

const LocationSearch = ({ value, onChange }: Props) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.log("Location bias disabled: ", error.message),
      );
    }
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        let biasParams = "";
        if (userCoords) {
          const offset = 0.5;
          const viewbox = `${userCoords.lng - offset},${userCoords.lat + offset},${userCoords.lng + offset},${userCoords.lat - offset}`;
          biasParams = `&viewbox=${viewbox}&bounded=0`;
        }

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=za&addressdetails=1${biasParams}`,
        );
        const data = await response.json();
        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Geocoding error:", error);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [query, userCoords]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    onChange("", { lat: 0, lng: 0 });
    setResults([]);
    setShowDropdown(false);
  };

  const handleSelect = (item: any) => {
    const cleanAddress = item.display_name;
    const coords = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
    setQuery(cleanAddress);
    onChange(cleanAddress, coords);
    setShowDropdown(false);
  };

  const handleCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        );
        const data = await res.json();
        const addr = data.display_name;
        setQuery(addr);
        onChange(addr, { lat, lng });
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="relative group w-full" ref={dropdownRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            className="w-full bg-zinc-900 border border-zinc-800 p-4 pl-12 pr-20 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600 text-sm font-bold shadow-inner"
            placeholder="Search Venue..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 3 && setShowDropdown(true)}
          />

          <div className="absolute left-4 top-4 flex items-center">
            {loading ? (
              <Loader2 size={18} className="animate-spin text-indigo-500" />
            ) : (
              <MapPin
                size={18}
                className={userCoords ? "text-indigo-500" : "text-zinc-600"}
              />
            )}
          </div>

          {/* RIGHT ACTION GROUP */}
          <div className="absolute right-4 top-3 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-zinc-600 hover:text-white transition-colors bg-zinc-800 rounded-md"
              >
                <CloseIcon size={14} strokeWidth={3} />
              </button>
            )}
            <button
              type="button"
              onClick={handleCurrentLocation}
              className={`transition-colors hover:text-indigo-400 ${userCoords ? "text-indigo-500" : "text-zinc-700"}`}
            >
              <Target size={18} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-zinc-500 hover:text-indigo-500 transition-all shadow-xl"
        >
          <MapIcon size={20} />
        </button>
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          {results.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSelect(item)}
              className="w-full flex items-start gap-3 p-4 hover:bg-indigo-600/10 border-b border-zinc-800/50 last:border-0 text-left transition-colors"
            >
              <Navigation size={14} className="mt-1 text-indigo-500" />
              <div>
                <p className="text-sm font-bold text-zinc-200 line-clamp-1 italic">
                  {item.display_name.split(",")[0]}
                </p>
                <p className="text-[10px] text-zinc-500 truncate font-medium">
                  {item.display_name.split(",").slice(1).join(",").trim()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showMap && (
        <MapPickerModal
          initialCoords={userCoords || { lat: -26.15, lng: 28.0 }}
          onClose={() => setShowMap(false)}
          onConfirm={(addr, coords) => {
            setQuery(addr);
            onChange(addr, coords);
            setShowMap(false);
          }}
        />
      )}
    </div>
  );
};

export default LocationSearch;
