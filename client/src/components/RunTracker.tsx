import { useEffect, useRef, useState } from "react";
import { authFetch, distanceM, formatDuration, formatPace, type Pt, type Others } from "../api";
import LiveMap from "./LiveMap";

const MAX_ACCURACY = 25; // meters: ignore weak GPS fixes
const MIN_STEP = 5;      // meters: ignore standing-still jitter
const MAX_SPEED = 10;    // m/s (~36 km/h): ignore GPS jumps

const today = () => new Date().toLocaleDateString("en-CA");

export default function RunTracker({ onSaved }: { onSaved: () => void }) {
  const [running, setRunning] = useState(false);
  const [share, setShare] = useState(() => localStorage.getItem("shareLocation") === "true");
  const [current, setCurrent] = useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<Pt[]>([]);
  const [distance, setDistance] = useState(0); // meters
  const [elapsed, setElapsed] = useState(0);   // seconds
  const [others, setOthers] = useState<Others[]>([]);
  const [message, setMessage] = useState("");

  const runningRef = useRef(false);
  const shareRef = useRef(false);
  const currentRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastRef = useRef<Pt | null>(null);
  const routeRef = useRef<Pt[]>([]);
  const distRef = useRef(0);
  const startRef = useRef(0);
  const wakeRef = useRef<any>(null);

  const onPosition = (pos: GeolocationPosition) => {
    const { latitude: lat, longitude: lng, accuracy } = pos.coords;
    currentRef.current = { lat, lng };
    setCurrent({ lat, lng });
    if (!runningRef.current || accuracy > MAX_ACCURACY) return;

    const p: Pt = {
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      t: pos.timestamp,
    };
    const last = lastRef.current;
    if (last) {
      const d = distanceM(last, p);
      const dt = (p.t - last.t) / 1000;
      if (d < MIN_STEP) return;
      if (dt > 0 && d / dt > MAX_SPEED) return;
      distRef.current += d;
      setDistance(distRef.current);
    }
    lastRef.current = p;
    routeRef.current.push(p);
    setRoute([...routeRef.current]);
  };

  // GPS watch (always on while this tab is open, only recorded when running)
  useEffect(() => {
    if (!navigator.geolocation) {
      setMessage("This browser has no GPS support.");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      onPosition,
      () => setMessage("Allow location access to track your runs."),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

// Timer (only while running)
useEffect(() => {
  if (!running) return;
  const tick = setInterval(
    () => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
  return () => clearInterval(tick);
}, [running]);

// Share my position every 5 s while the checkbox is ticked
useEffect(() => {
  if (!share) return;
  const send = () => {
    const c = currentRef.current;
    if (c) authFetch("/live", { method: "PUT", body: JSON.stringify(c) });
  };
  send();
  const id = setInterval(send, 5000);
  return () => clearInterval(id);
}, [share]);

  // See other active runners
  useEffect(() => {
    const load = () =>
      authFetch("/live").then(async (r) => { if (r.ok) setOthers(await r.json()); });
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, []);

  const start = async () => {
    setMessage("");
    routeRef.current = [];
    lastRef.current = null;
    distRef.current = 0;
    setRoute([]);
    setDistance(0);
    setElapsed(0);
    startRef.current = Date.now();
    runningRef.current = true;
    setRunning(true);
    try { wakeRef.current = await (navigator as any).wakeLock?.request("screen"); } catch {}
  };

  const stop = async () => {
    runningRef.current = false;
    setRunning(false);
    try { wakeRef.current?.release(); } catch {}
    wakeRef.current = null;
    authFetch("/live", { method: "DELETE" });

	const seconds = Math.round((Date.now() - startRef.current) / 1000);
	if (seconds < 10) return setMessage("Run too short to save (under 1 minute).");
	if (distRef.current < 1) return setMessage("No movement detected, so nothing was saved.");	
    const res = await authFetch("/runs", {
      method: "POST",
      body: JSON.stringify({
        route: routeRef.current,
        duration_seconds: seconds,
        run_date: today(),
      }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error);
    setMessage(`Saved: ${data.distance_km} km at ${formatPace(Number(data.distance_km), data.duration_seconds)}`);
    onSaved();
  };

 const toggleShare = (on: boolean) => {
  setShare(on);
  shareRef.current = on;
  localStorage.setItem("shareLocation", String(on));
  if (!on) authFetch("/live", { method: "DELETE" });
};

  const km = distance / 1000;

  return (
    <div className="card tracker">
      <h2>Live run</h2>
      <div className="tracker-stats">
        <div><span className="muted">Distance</span><strong>{km.toFixed(2)} km</strong></div>
        <div><span className="muted">Time</span><strong>{formatDuration(elapsed)}</strong></div>
        <div><span className="muted">Pace</span>
          <strong>{km > 0.01 && elapsed > 0 ? formatPace(km, elapsed) : "--"}</strong></div>
      </div>

      <label className="check">
        <input type="checkbox" checked={share} onChange={(e) => toggleShare(e.target.checked)} />
        Share my live location with other runners (shown approximately)
      </label>

      {message && <p className="muted">{message}</p>}

      {running ? (
        <button className="btn btn-stop" onClick={stop}>Stop &amp; save</button>
      ) : (
        <button className="btn" onClick={start} disabled={!current}>
          {current ? "Start run" : "Waiting for GPS..."}
        </button>
      )}

      <LiveMap me={current} route={route} others={others} />
    </div>
  );
}
