 import { useEffect, useState, type FormEvent } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LocationPoint = {
  lat: number;
  lng: number;
  address: string;
};

type AddressResult = {
  lat: string;
  lon: string;
  display_name: string;
};

type AddressCoverageMapProps = {
  registeredAddress?: string;
};

type SavedAccount = {
  username?: string;
  address?: string;
};

const DEFAULT_LOCATION: LocationPoint = {
  lat: 12.9716,
  lng: 77.5946,
  address: "Bengaluru, Karnataka",
};

const COVERAGE_RADIUS_METERS = 20_000;
const LOGGED_IN_USER_KEY = "ecotwin-logged-in-user";

async function geocodeAddress(
  address: string,
): Promise<LocationPoint> {
  const params = new URLSearchParams({
    q: address,
    format: "jsonv2",
    limit: "1",
    countrycodes: "in",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { headers: { Accept: "application/json" } },
  );

  if (!response.ok) {
    throw new Error("Address lookup failed. Please try again.");
  }

  const results: AddressResult[] = await response.json();

  if (!results.length) {
    throw new Error(
      "Address not found. Please include the city and state.",
    );
  }

  return {
    lat: Number(results[0].lat),
    lng: Number(results[0].lon),
    address: results[0].display_name,
  };
}

function RecenterMap({ location }: { location: LocationPoint }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([location.lat, location.lng], 12, {
      duration: 1,
    });
  }, [location.lat, location.lng, map]);

  return null;
}

function createPin(color: string) {
  return L.divIcon({
    className: "ecotwin-map-pin",
    html: `<div style="
      width:24px;height:24px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);background:${color};
      border:3px solid white;box-shadow:0 2px 8px #0005;
    "><div style="
      width:6px;height:6px;border-radius:50%;background:white;
      position:absolute;top:6px;left:6px;
    "></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
}

const addressPin = createPin("#0d9488");

export default function AddressCoverageMap({
  registeredAddress = "",
}: AddressCoverageMapProps) {
  const [query, setQuery] = useState(registeredAddress);
  const [location, setLocation] =
    useState<LocationPoint>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [savedAddress, setSavedAddress] = useState(
    registeredAddress.trim(),
  );

  // Read the address saved when the user logged in.
  useEffect(() => {
    let address = registeredAddress.trim();

    try {
      const savedUser = localStorage.getItem(LOGGED_IN_USER_KEY);

      if (savedUser) {
        const account = JSON.parse(savedUser) as SavedAccount;
        address = account.address?.trim() || address;
      }
    } catch (err) {
      console.error("Unable to read saved account:", err);
    }

    setSavedAddress(address);
    setQuery(address);
  }, [registeredAddress]);

  // Locate the registered address automatically.
  useEffect(() => {
    if (!savedAddress) {
      setLocation(DEFAULT_LOCATION);
      setSearched(false);
      setError("");
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError("");
    setSearched(false);

    geocodeAddress(savedAddress)
      .then((result) => {
        if (cancelled) return;

        setLocation(result);
        setSearched(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to locate this address.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [savedAddress]);

  // Allow the user to search for another location manually.
  async function searchAddress(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const address = query.trim();

    if (!address) {
      setError("Please enter an address or locality.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(false);

    try {
      const result = await geocodeAddress(address);
      setLocation(result);
      setSearched(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not find this address.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-teal-500/30 bg-slate-950 p-4 text-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">
            📍 Truck Coverage Map
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Your registered address and approximate service area.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-teal-500/15 px-3 py-1 text-xs text-teal-300">
          20 km radius
        </span>
      </div>

      <form
        onSubmit={searchAddress}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Enter address, city or locality"
          aria-label="Search address"
          className="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-3 text-white outline-none focus:border-teal-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-teal-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-60"
        >
          {loading ? "Locating..." : "Find Location"}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-950 p-3 text-sm text-red-200"
        >
          {error}
        </p>
      )}

      {searched && (
        <div className="rounded-xl border border-teal-500/30 bg-teal-950/40 p-3">
          <p className="font-semibold text-teal-300">
            📍 Registered service location
          </p>

          <p className="mt-1 break-words text-sm text-slate-200">
            {location.address}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Coordinates: {location.lat.toFixed(5)},{" "}
            {location.lng.toFixed(5)}
          </p>
        </div>
      )}

      <div className="h-[360px] overflow-hidden rounded-xl border border-slate-700 sm:h-[420px]">
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={11}
          scrollWheelZoom
          className="h-full w-full"
          style={{ background: "#e2e8f0" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap location={location} />

          <Circle
            center={[location.lat, location.lng]}
            radius={COVERAGE_RADIUS_METERS}
            pathOptions={{
              color: "#0d9488",
              weight: 2,
              fillColor: "#14b8a6",
              fillOpacity: 0.15,
            }}
          />

          <Marker
            position={[location.lat, location.lng]}
            icon={addressPin}
          >
            <Popup>
              <strong>Service location</strong>
              <br />
              {location.address}
              <br />
              Approximate 20 km radius
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <p className="text-xs text-slate-400">
        The pin shows an approximate location found from the address.
        The circle represents straight-line coverage, not actual
        driving distance or a calculated truck route. Internet access
        is required.
      </p>
    </section>
  );
}