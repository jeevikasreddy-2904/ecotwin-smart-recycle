 import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CLEANING_THRESHOLD,
  createCleaningRequest,
  type SmartBin,
  type CleaningRequest,
} from "@/lib/cleaningRequests";

type Position = [number, number];
type Shift = "Morning" | "Evening";
type StopStatus = "Pending" | "Collected" | "Missed";
type TruckStatus = "Available" | "On Route" | "Out of Service";

type Stop = {
  id: string;
  name: string;
  type: string;
  position: Position;
};

type RouteDefinition = {
  id: string;
  name: string;
  points: Position[];
  stopIds: string[];
  dumpId: string;
};

type Truck = {
  id: string;
  name: string;
  routeId: string;
  status: TruckStatus;
};

type StopResult = {
  stopId: string;
  stopName: string;
  status: StopStatus;
  truckId: string;
  binId?: string;
  fillLevel?: number;
  arrival?: string;
  departure?: string;
  collectedKg?: number;
};

type HistoryEntry = {
  id: string;
  date: string;
  shift: Shift;
  truckId: string;
  routeId: string;
  startTime: string;
  endTime?: string;
  status: "In Progress" | "Completed" | "Interrupted";
  results: StopResult[];
  dump: {
    location: string;
    position: Position;
    arrival?: string;
    dumpedKg: number;
  };
  note?: string;
};

const STOPS: Stop[] = [
  { id: "KAN-01", name: "Kanakapura Town", type: "Town", position: [12.546, 77.42] },
  { id: "VIL-01", name: "Village Collection Point", type: "Village", position: [12.625, 77.44] },
  { id: "SHOP-01", name: "Local Shops", type: "Shops", position: [12.69, 77.45] },
  { id: "IND-01", name: "Harohalli Industrial Area", type: "Industry", position: [12.7, 77.463] },
  { id: "DSU-01", name: "Dayananda Sagar University Area", type: "University", position: [12.715, 77.468] },
  { id: "JAIN-01", name: "JAIN University Area", type: "University Area", position: [12.722, 77.482] },
  { id: "BUS-01", name: "Harohalli Bus Stand", type: "Bus Stand", position: [12.731, 77.476] },
  { id: "HOME-01", name: "Residential Village", type: "Houses", position: [12.65, 77.447] },
];

const DUMPS: Record<string, { name: string; position: Position }> = {
  "DUMP-01": {
    name: "Harohalli Waste Transfer Point (demo)",
    position: [12.744, 77.49],
  },
  "DUMP-02": {
    name: "Kanakapura Waste Collection Point (demo)",
    position: [12.535, 77.405],
  },
};

const ROUTES: RouteDefinition[] = [
  {
    id: "R-01",
    name: "Kanakapura to Harohalli",
    points: [
      [12.546, 77.42],
      [12.625, 77.44],
      [12.65, 77.447],
      [12.69, 77.45],
      [12.7, 77.463],
      [12.715, 77.468],
      [12.722, 77.482],
      [12.731, 77.476],
    ],
    stopIds: [
      "KAN-01",
      "VIL-01",
      "HOME-01",
      "SHOP-01",
      "IND-01",
      "DSU-01",
      "JAIN-01",
      "BUS-01",
    ],
    dumpId: "DUMP-01",
  },
  {
    id: "R-02",
    name: "Village and Industry Loop",
    points: [
      [12.625, 77.44],
      [12.65, 77.447],
      [12.7, 77.463],
      [12.715, 77.468],
      [12.731, 77.476],
    ],
    stopIds: ["VIL-01", "HOME-01", "IND-01", "DSU-01", "BUS-01"],
    dumpId: "DUMP-01",
  },
  {
    id: "R-03",
    name: "Town and Community Loop",
    points: [
      [12.546, 77.42],
      [12.625, 77.44],
      [12.69, 77.45],
      [12.731, 77.476],
    ],
    stopIds: ["KAN-01", "VIL-01", "SHOP-01", "BUS-01"],
    dumpId: "DUMP-02",
  },
];

const INITIAL_TRUCKS: Truck[] = [
  {
    id: "SBR-TRK-001",
    name: "Green Collector 1",
    routeId: "R-01",
    status: "Available",
  },
  {
    id: "SBR-TRK-002",
    name: "Green Collector 2",
    routeId: "R-02",
    status: "Available",
  },
  {
    id: "SBR-TRK-003",
    name: "Green Backup 3",
    routeId: "R-03",
    status: "Available",
  },
];

const DEFAULT_BINS: SmartBin[] = [
  { id: "BIN-KAN-01", name: "Kanakapura Smart Bin", location: "Kanakapura Town", fillLevel: 72, routeId: "R-01" },
  { id: "BIN-VIL-01", name: "Village Smart Bin", location: "Village Collection Point", fillLevel: 84, routeId: "R-01" },
  { id: "BIN-HOME-01", name: "Residential Smart Bin", location: "Residential Village", fillLevel: 65, routeId: "R-01" },
  { id: "BIN-SHOP-01", name: "Shop Smart Bin", location: "Local Shops", fillLevel: 48, routeId: "R-01" },
  { id: "BIN-IND-01", name: "Industrial Smart Bin", location: "Harohalli Industrial Area", fillLevel: 91, routeId: "R-02" },
  { id: "BIN-DSU-01", name: "University Smart Bin", location: "Dayananda Sagar University Area", fillLevel: 67, routeId: "R-02" },
  { id: "BIN-JAIN-01", name: "JAIN Area Smart Bin", location: "JAIN University Area", fillLevel: 55, routeId: "R-03" },
  { id: "BIN-BUS-01", name: "Bus Stand Smart Bin", location: "Harohalli Bus Stand", fillLevel: 82, routeId: "R-03" },
];

const HISTORY_KEY = "ecotwin-truck-history-v2";
const TRUCKS_KEY = "ecotwin-truck-fleet-v2";
const BINS_KEY = "ecotwin-route-bins-v1";
const REQUESTS_KEY = "ecotwin-route-cleaning-requests-v1";
const SPEED_MS = 12000;

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function markerIcon(emoji: string, color: string) {
  return L.divIcon({
    className: "ecotwin-map-icon",
    html: `<div style="width:34px;height:34px;border-radius:50%;background:white;border:3px solid ${color};display:flex;align-items:center;justify-content:center;font-size:19px">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}
export default function WasteTruckTracker() {
  const [trucks, setTrucks] = useState<Truck[]>(INITIAL_TRUCKS);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [bins, setBins] = useState<SmartBin[]>(DEFAULT_BINS);
  const [requests, setRequests] = useState<CleaningRequest[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [truckId, setTruckId] = useState("SBR-TRK-001");
  const [routeId, setRouteId] = useState("R-01");
  const [shift, setShift] = useState<Shift>("Morning");
  const [runId, setRunId] = useState<string | null>(null);
  const [stopIndex, setStopIndex] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setHistory(readStorage<HistoryEntry[]>(HISTORY_KEY, []));
    setTrucks(readStorage<Truck[]>(TRUCKS_KEY, INITIAL_TRUCKS));
    setBins(readStorage<SmartBin[]>(BINS_KEY, DEFAULT_BINS));
    setRequests(readStorage<CleaningRequest[]>(REQUESTS_KEY, []));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    localStorage.setItem(TRUCKS_KEY, JSON.stringify(trucks));
    localStorage.setItem(BINS_KEY, JSON.stringify(bins));
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  }, [loaded, history, trucks, bins, requests]);

  const selectedRoute =
    ROUTES.find((route) => route.id === routeId) ?? ROUTES[0];

  const selectedTruck =
    trucks.find((truck) => truck.id === truckId) ?? trucks[0];

  const activeRun = history.find((run) => run.id === runId);

  const routeStops = selectedRoute.stopIds
    .map((id) => STOPS.find((stop) => stop.id === id))
    .filter((stop): stop is Stop => Boolean(stop));

  useEffect(() => {
    if (!loaded) return;

    const additions: CleaningRequest[] = [];

    bins.forEach((bin) => {
      if (bin.fillLevel < CLEANING_THRESHOLD) return;

      const pending = requests.some(
        (request) =>
          request.binId === bin.id &&
          String(request.status).toLowerCase() === "pending",
      );

      if (!pending) {
        try {
          additions.push(createCleaningRequest(bin));
        } catch (error) {
          console.error("Could not create cleaning request", error);
        }
      }
    });

    if (additions.length) {
      setRequests((previous) => [...previous, ...additions]);
    }
  }, [loaded, bins, requests]);

  function startRun() {
    if (runId) return;

    const dump = DUMPS[selectedRoute.dumpId];

    const run: HistoryEntry = {
      id: makeId(),
      date: today(),
      shift,
      truckId,
      routeId,
      startTime: nowTime(),
      status: "In Progress",
      results: routeStops.map((stop) => ({
        stopId: stop.id,
        stopName: stop.name,
        status: "Pending",
        truckId,
      })),
      dump: {
        location: dump.name,
        position: dump.position,
        dumpedKg: 0,
      },
    };

    setHistory((previous) => [run, ...previous]);
    setRunId(run.id);
    setStopIndex(0);

    setTrucks((previous) =>
      previous.map((truck) =>
        truck.id === truckId
          ? { ...truck, status: "On Route" }
          : truck,
      ),
    );

    setNotice("Route started.");
  }

  function collectNextStop() {
    if (!activeRun) return;

    const result = activeRun.results[stopIndex];
    if (!result) return;

    const binId = `BIN-${result.stopId}`;
    const bin = bins.find((item) => item.id === binId);
    const fillLevel = bin?.fillLevel ?? 0;
    const collectedKg = Math.round(fillLevel * 0.3 * 10) / 10;

    const updatedResults = activeRun.results.map((item, index) =>
      index === stopIndex
        ? {
            ...item,
            status: "Collected" as StopStatus,
            binId: bin?.id ?? binId,
            fillLevel,
            arrival: nowTime(),
            departure: nowTime(),
            collectedKg,
          }
        : item,
    );

    const updatedRun: HistoryEntry = {
      ...activeRun,
      results: updatedResults,
      dump: {
        ...activeRun.dump,
        dumpedKg: updatedResults.reduce(
          (total, item) => total + (item.collectedKg ?? 0),
          0,
        ),
      },
    };

    setHistory((previous) =>
      previous.map((run) =>
        run.id === activeRun.id ? updatedRun : run,
      ),
    );

    if (bin) {
      setBins((previous) =>
        previous.map((item) =>
          item.id === bin.id ? { ...item, fillLevel: 0 } : item,
        ),
      );

      setRequests((previous) =>
        previous.map((request) =>
          request.binId === bin.id &&
          String(request.status).toLowerCase() === "pending"
            ? ({
                ...request,
                status: "Completed",
                collectedAt: new Date().toISOString(),
              } as CleaningRequest)
            : request,
        ),
      );
    }

    if (stopIndex + 1 >= activeRun.results.length) {
      const completedRun: HistoryEntry = {
        ...updatedRun,
        status: "Completed",
        endTime: nowTime(),
        dump: {
          ...updatedRun.dump,
          arrival: nowTime(),
        },
      };

      setHistory((previous) =>
        previous.map((run) =>
          run.id === activeRun.id ? completedRun : run,
        ),
      );

      setTrucks((previous) =>
        previous.map((truck) =>
          truck.id === truckId
            ? { ...truck, status: "Available" }
            : truck,
        ),
      );

      setRunId(null);
      setStopIndex(0);
      setNotice("Route completed successfully.");
    } else {
      setStopIndex((previous) => previous + 1);
      setNotice(`Collected waste at ${result.stopName}.`);
    }
  }

  function interruptRun() {
    if (!activeRun) return;

    setHistory((previous) =>
      previous.map((run) =>
        run.id === activeRun.id
          ? {
              ...run,
              status: "Interrupted",
              endTime: nowTime(),
              note: "Run interrupted by operator.",
            }
          : run,
      ),
    );

    setTrucks((previous) =>
      previous.map((truck) =>
        truck.id === truckId
          ? { ...truck, status: "Available" }
          : truck,
      ),
    );

    setRunId(null);
    setStopIndex(0);
    setNotice("Route interrupted.");
  }

  useEffect(() => {
    if (!runId) return;

    const timer = window.setTimeout(
      collectNextStop,
      SPEED_MS,
    );

    return () => window.clearTimeout(timer);
  }, [runId, stopIndex, history, bins]);

  function downloadReport() {
    const rows: string[][] = [
      ["ECOTWIN SMART RECYCLING ASSISTANT"],
      ["Generated At", new Date().toLocaleString()],
      [],
      ["RUN HISTORY"],
      [
        "Date",
        "Shift",
        "Truck ID",
        "Route",
        "Run Status",
        "Stop",
        "Stop ID",
        "Collection Status",
        "Arrival",
        "Departure",
        "Bin ID",
        "Initial Fill %",
        "Collected (kg)",
        "Dumping Location",
        "Dumped (kg)",
        "Notes",
      ],
    ];

    if (!history.length) {
      rows.push(["No run history available"]);
    } else {
      history.forEach((run) => {
        const routeName =
          ROUTES.find((route) => route.id === run.routeId)?.name ??
          run.routeId;

        if (!run.results.length) {
          rows.push([
            run.date,
            run.shift,
            run.truckId,
            routeName,
            run.status,
            "",
            "",
            "",
            run.startTime,
            run.endTime ?? "",
            "",
            "",
            "",
            run.dump.location,
            String(run.dump.dumpedKg),
            run.note ?? "",
          ]);
        } else {
          run.results.forEach((result) => {
            rows.push([
              run.date,
              run.shift,
              run.truckId,
              routeName,
              run.status,
              result.stopName,
              result.stopId,
              result.status,
              result.arrival ?? "",
              result.departure ?? "",
              result.binId ?? "",
              String(result.fillLevel ?? ""),
              String(result.collectedKg ?? ""),
              run.dump.location,
              String(run.dump.dumpedKg),
              run.note ?? "",
            ]);
          });
        }
      });
    }

    rows.push(
      [],
      ["CLEANING REQUESTS"],
      [
        "Request ID",
        "Bin ID",
        "Bin Name",
        "Location",
        "Fill Level %",
        "Priority",
        "Status",
        "Created At",
        "Completed At",
      ],
    );

    if (!requests.length) {
      rows.push(["No cleaning requests available"]);
    } else {
      requests.forEach((request) => {
        const item =
          request as CleaningRequest & Record<string, unknown>;

        rows.push([
          String(item.id ?? item.requestId ?? ""),
          String(item.binId ?? ""),
          String(item.binName ?? item.name ?? ""),
          String(item.location ?? ""),
          String(item.fillLevel ?? item.fillPercentage ?? ""),
          String(item.priority ?? ""),
          String(item.status ?? ""),
          String(item.createdAt ?? item.created_at ?? ""),
          String(
            item.completedAt ??
              item.completed_at ??
              item.collectedAt ??
              "",
          ),
        ]);
      });
    }

    const csv =
      "\uFEFF" +
      rows.map((row) => row.map(csvCell).join(",")).join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `ecotwin-report-${today()}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }
  const collectedCount =
    activeRun?.results.filter(
      (result) => result.status === "Collected",
    ).length ?? 0;

  return (
    <section className="space-y-5 rounded-2xl bg-slate-950 p-4 text-slate-100 md:p-6">
      <style>{`
        .wt-card {
          border: 1px solid #334155;
          border-radius: 14px;
          background: #0f172a;
          padding: 16px;
        }
        .wt-muted {
          font-size: 12px;
          color: #94a3b8;
        }
        .wt-btn {
          border: 1px solid #475569;
          border-radius: 9px;
          padding: 9px 12px;
          font-size: 13px;
          color: #e2e8f0;
          background: #1e293b;
        }
        .wt-primary {
          background: #15803d;
          border-color: #15803d;
          color: white;
        }
        .wt-danger {
          background: #991b1b;
          border-color: #991b1b;
          color: white;
        }
        .wt-control {
          width: 100%;
          border: 1px solid #475569;
          border-radius: 8px;
          background: #020617;
          padding: 9px;
          color: #e2e8f0;
        }
        .wt-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .wt-number {
          font-size: 25px;
          font-weight: 700;
          margin-top: 5px;
        }
        .wt-table-wrap {
          overflow-x: auto;
        }
        .wt-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          min-width: 550px;
        }
        .wt-table th,
        .wt-table td {
          border-bottom: 1px solid #334155;
          padding: 9px;
          text-align: left;
        }
        .wt-table th {
          color: #94a3b8;
          font-weight: 600;
        }
        @media (min-width: 768px) {
          .wt-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">
            🚛 EcoTwin Waste Fleet Control
          </h2>
          <p className="wt-muted mt-1">
            Demo route simulation, smart-bin monitoring and cleaning reports
          </p>
        </div>

        <a
          href="https://swachhbharatmission.ddws.gov.in/"
          target="_blank"
          rel="noreferrer"
          className="wt-btn"
        >
          Swachh Bharat Mission ↗
        </a>
      </header>

      <div className="wt-grid">
        <div className="wt-card">
          <p className="wt-muted">Total trucks</p>
          <div className="wt-number">{trucks.length}</div>
        </div>

        <div className="wt-card">
          <p className="wt-muted">Smart bins</p>
          <div className="wt-number">{bins.length}</div>
        </div>

        <div className="wt-card">
          <p className="wt-muted">Cleaning requests</p>
          <div className="wt-number">{requests.length}</div>
        </div>

        <div className="wt-card">
          <p className="wt-muted">Completed runs</p>
          <div className="wt-number">
            {history.filter((run) => run.status === "Completed").length}
          </div>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className="rounded-lg border border-emerald-800 bg-emerald-950 p-3 text-sm text-emerald-200"
        >
          {notice}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="wt-card space-y-4">
          <h3 className="font-semibold">Route control</h3>

          <label className="block text-sm">
            Select truck
            <select
              className="wt-control mt-1"
              value={truckId}
              disabled={Boolean(runId)}
              onChange={(event) => {
                const nextId = event.target.value;
                setTruckId(nextId);

                const truck = trucks.find(
                  (item) => item.id === nextId,
                );

                if (truck) setRouteId(truck.routeId);
              }}
            >
              {trucks.map((truck) => (
                <option key={truck.id} value={truck.id}>
                  {truck.name} ({truck.status})
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            Select route
            <select
              className="wt-control mt-1"
              value={routeId}
              disabled={Boolean(runId)}
              onChange={(event) => {
                const nextRoute = event.target.value;
                setRouteId(nextRoute);

                setTrucks((previous) =>
                  previous.map((truck) =>
                    truck.id === truckId
                      ? { ...truck, routeId: nextRoute }
                      : truck,
                  ),
                );
              }}
            >
              {ROUTES.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.id} — {route.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            Shift
            <select
              className="wt-control mt-1"
              value={shift}
              disabled={Boolean(runId)}
              onChange={(event) =>
                setShift(event.target.value as Shift)
              }
            >
              <option>Morning</option>
              <option>Evening</option>
            </select>
          </label>

          <div className="rounded-lg bg-slate-900 p-3 text-sm">
            <p className="font-semibold">{selectedTruck?.name}</p>
            <p className="wt-muted mt-1">{selectedRoute.name}</p>
            <p className="wt-muted mt-1">
              {routeStops.length} collection stops
            </p>

            {activeRun && (
              <p className="mt-2 text-emerald-300">
                Progress: {collectedCount}/{activeRun.results.length} stops
              </p>
            )}
          </div>

          {!runId ? (
            <button
              className="wt-btn wt-primary w-full"
              onClick={startRun}
            >
              ▶ Start route
            </button>
          ) : (
            <div className="space-y-2">
              <button
                className="wt-btn wt-primary w-full"
                onClick={collectNextStop}
              >
                Collect next stop
              </button>

              <button
                className="wt-btn wt-danger w-full"
                onClick={interruptRun}
              >
                Interrupt route
              </button>
            </div>
          )}

          <button
            className="wt-btn w-full"
            onClick={downloadReport}
          >
            ⬇ Download report (CSV)
          </button>
        </div>

        <div className="wt-card space-y-3">
          <div>
            <h3 className="font-semibold">Live route map</h3>
            <p className="wt-muted mt-1">
              Illustrative demo locations around Kanakapura and Harohalli
            </p>
          </div>

          <div className="h-[360px] overflow-hidden rounded-xl">
            <MapContainer
              center={[12.66, 77.455]}
              zoom={11}
              scrollWheelZoom
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Polyline
                positions={selectedRoute.points}
                pathOptions={{
                  color: "#22c55e",
                  weight: 4,
                }}
              />

              {STOPS.map((stop) => {
                const result = activeRun?.results.find(
                  (item) => item.stopId === stop.id,
                );

                const color =
                  result?.status === "Collected"
                    ? "#16a34a"
                    : "#0ea5e9";

                return (
                  <Marker
                    key={stop.id}
                    position={stop.position}
                    icon={markerIcon("📍", color)}
                  >
                    <Popup>
                      <strong>{stop.name}</strong>
                      <br />
                      ID: {stop.id}
                      <br />
                      Status: {result?.status ?? "Scheduled"}
                    </Popup>
                  </Marker>
                );
              })}

              {Object.entries(DUMPS).map(([id, dump]) => (
                <Marker
                  key={id}
                  position={dump.position}
                  icon={markerIcon("♻️", "#16a34a")}
                >
                  <Popup>{dump.name}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
      {/* SMART BIN STATUS */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Smart Bin Monitoring</h2>
            <p className="text-sm text-slate-400">
              Live fill levels and collection status
            </p>
          </div>
          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            {bins.length} bins monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr className="border-b border-slate-800">
                <th className="p-3">Bin ID</th>
                <th className="p-3">Location</th>
                <th className="p-3">Fill level</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bins.map((bin) => {
                const fill = Math.max(
                  0,
                  Math.min(100, Number(bin.fillLevel) || 0),
                );
                const needsCollection = fill >= CLEANING_THRESHOLD;

                return (
                  <tr
                    key={bin.id}
                    className="border-b border-slate-800/70 last:border-0"
                  >
                    <td className="p-3 font-mono text-emerald-300">
                      {bin.id}
                    </td>
                    <td className="p-3">{bin.name}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-700">
                          <div
                            className={`h-full rounded-full ${
                              fill >= CLEANING_THRESHOLD
                                ? "bg-red-400"
                                : fill >= 60
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                            }`}
                            style={{ width: `${fill}%` }}
                          />
                        </div>
                        <span>{fill}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          needsCollection
                            ? "bg-red-400/10 text-red-300"
                            : "bg-emerald-400/10 text-emerald-300"
                        }`}
                      >
                        {needsCollection ? "Needs collection" : "Normal"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLEANING REQUESTS */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-bold">Cleaning Requests</h2>
          <p className="text-sm text-slate-400">
            Requests generated by the smart-bin monitoring system
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center">
            <p className="text-2xl">🌱</p>
            <p className="mt-2 font-medium">No cleaning requests yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Requests will appear when bins meet the collection threshold.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr className="border-b border-slate-800">
                  <th className="p-3">Request ID</th>
                  <th className="p-3">Bin ID</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request, index) => {
                  const requestData = request as CleaningRequest &
                    Record<string, unknown>;
                  const relatedBin = bins.find(
                    (bin) => bin.id === request.binId,
                  );

                  return (
                    <tr
                      key={String(requestData.id ?? `${request.binId}-${index}`)}
                      className="border-b border-slate-800/70 last:border-0"
                    >
                      <td className="p-3 font-mono text-slate-300">
                        {String(requestData.id ?? `REQ-${index + 1}`)}
                      </td>
                      <td className="p-3 text-emerald-300">
                        {request.binId}
                      </td>
                      <td className="p-3">
                        {relatedBin?.name ?? "Location unavailable"}
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-amber-400/10 px-2 py-1 text-xs text-amber-300">
                          {String(request.status ?? "Pending")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* COLLECTION HISTORY */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-bold">Collection History</h2>
          <p className="text-sm text-slate-400">
            Recent truck activity and collection records
          </p>
        </div>

        {history.length === 0 ? (
          <p className="rounded-xl bg-slate-800/60 p-5 text-center text-sm text-slate-400">
            No collection history available. Start a truck shift to create a
            record.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr className="border-b border-slate-800">
                  <th className="p-3">Date</th>
                  <th className="p-3">Truck</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Stop</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Collected</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => {
                  const row = entry as HistoryEntry &
                    Record<string, unknown>;

                  return (
                    <tr
                      key={String(row.id ?? `${index}-${row.date ?? "record"}`)}
                      className="border-b border-slate-800/70 last:border-0"
                    >
                      <td className="p-3">
                        {String(row.date ?? "—")}
                      </td>
                      <td className="p-3">
                        {String(row.truckName ?? row.truckId ?? "—")}
                      </td>
                      <td className="p-3">
                        {String(row.routeName ?? row.routeId ?? "—")}
                      </td>
                      <td className="p-3">
                        {String(row.stopName ?? row.stop ?? "—")}
                      </td>
                      <td className="p-3">
                        {String(row.status ?? "—")}
                      </td>
                      <td className="p-3">
                        {String(row.collectedKg ?? row.kgCollected ?? "—")}
                        {row.collectedKg != null ||
                        row.kgCollected != null
                          ? " kg"
                          : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}