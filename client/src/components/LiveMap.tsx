import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Pt, Others } from "../api";

type LatLng = { lat: number; lng: number };

function Follow({ pos }: { pos: LatLng | null }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    if (!pos) return;
    map.setView([pos.lat, pos.lng], first.current ? 16 : map.getZoom());
    first.current = false;
  }, [pos?.lat, pos?.lng]);
  return null;
}

export default function LiveMap({
  me, route = [], others,
}: { me: LatLng | null; route?: Pt[]; others: Others[] }) {
  return (
    <MapContainer center={[20, 0]} zoom={2} className="map">
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Follow pos={me} />
      {route.length > 1 && (
        <Polyline positions={route.map((p) => [p.lat, p.lng] as [number, number])} />
      )}
      {me && (
        <CircleMarker center={[me.lat, me.lng]} radius={9}
          pathOptions={{ color: "#fff", weight: 3, fillColor: "#16a34a", fillOpacity: 1 }}>
          <Tooltip>You</Tooltip>
        </CircleMarker>
      )}
      {others.map((o) => (
        <CircleMarker key={o.id} center={[o.lat, o.lng]} radius={8}
          pathOptions={{ color: "#fff", weight: 2, fillColor: "#2563eb", fillOpacity: 1 }}>
          <Tooltip>{o.name} (running)</Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
