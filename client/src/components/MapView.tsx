import { useEffect, useRef } from "react";
import L from "leaflet";
import type { User, Event } from "@shared/schema";

interface MapViewProps {
  professionals: User[];
  events: Event[];
  currentUser?: User | null;
  onSelectUser?: (user: User) => void;
  onSelectEvent?: (event: Event) => void;
  center?: [number, number];
  zoom?: number;
}

const TYPE_EMOJI: Record<string, string> = {
  dinner: "🍽️", drinks: "🍸", coffee: "☕", lunch: "🥗",
  sports: "🏀", travel: "✈️", other: "📍",
};

export default function MapView({
  professionals, events, currentUser, onSelectUser, onSelectEvent,
  center = [25.7617, -80.1918], zoom = 13,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    mapRef.current = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    // OSM tile layer (free)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Add professional markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers (we store them on the map)
    (mapRef.current as any)._profMarkers?.forEach((m: L.Marker) => m.remove());
    const profMarkers: L.Marker[] = [];

    professionals.forEach((pro) => {
      if (!pro.lat || !pro.lng) return;

      const icon = L.divIcon({
        html: `<div class="rt-marker" title="${pro.name}">
          <img src="${pro.avatar || ""}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;background:#e5e7eb;" onerror="this.style.display='none'" />
        </div>`,
        className: "",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -44],
      });

      const popupContent = `
        <div style="padding:12px 14px;min-width:180px;font-family:var(--font-sans,sans-serif)">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <img src="${pro.avatar || ""}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;background:#e5e7eb;" />
            <div>
              <p style="font-weight:600;font-size:13px;margin:0;">${pro.name}</p>
              <p style="color:hsl(var(--muted-foreground));font-size:11px;margin:0;">${pro.title}</p>
            </div>
          </div>
          <p style="font-size:11px;color:hsl(var(--muted-foreground));margin:0;">${pro.company} · ${pro.industry}</p>
        </div>
      `;

      const marker = L.marker([pro.lat, pro.lng], { icon })
        .addTo(mapRef.current!)
        .bindPopup(popupContent);

      marker.on("click", () => {
        if (onSelectUser) onSelectUser(pro);
      });

      profMarkers.push(marker);
    });

    (mapRef.current as any)._profMarkers = profMarkers;
  }, [professionals, onSelectUser]);

  // Add event markers
  useEffect(() => {
    if (!mapRef.current) return;

    (mapRef.current as any)._eventMarkers?.forEach((m: L.Marker) => m.remove());
    const eventMarkers: L.Marker[] = [];

    events.forEach((ev) => {
      if (!ev.lat || !ev.lng) return;
      const emoji = TYPE_EMOJI[ev.type] || "📍";

      const icon = L.divIcon({
        html: `<div class="rt-marker event">${emoji}</div>`,
        className: "",
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -38],
      });

      const spotsLeft = (ev.maxGuests || 4) - (ev.currentGuests || 1);
      const popupContent = `
        <div style="padding:12px 14px;min-width:180px;font-family:var(--font-sans,sans-serif)">
          <p style="font-weight:600;font-size:13px;margin:0 0 4px;">${ev.venue}</p>
          <p style="font-size:12px;color:hsl(var(--muted-foreground));margin:0 0 6px;">${ev.time} · ${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left</p>
          <p style="font-size:11px;color:hsl(var(--muted-foreground));margin:0;">${ev.title}</p>
        </div>
      `;

      const marker = L.marker([ev.lat, ev.lng], { icon })
        .addTo(mapRef.current!)
        .bindPopup(popupContent);

      marker.on("click", () => {
        if (onSelectEvent) onSelectEvent(ev);
      });

      eventMarkers.push(marker);
    });

    (mapRef.current as any)._eventMarkers = eventMarkers;
  }, [events, onSelectEvent]);

  // Add current user marker
  useEffect(() => {
    if (!mapRef.current || !currentUser?.lat || !currentUser?.lng) return;

    (mapRef.current as any)._meMarker?.remove();

    const icon = L.divIcon({
      html: `<div class="rt-marker me" title="You">
        <img src="${currentUser.avatar || ""}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid hsl(43,82%,70%);background:#e5e7eb;" />
      </div>`,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -44],
    });

    const meMarker = L.marker([currentUser.lat, currentUser.lng], { icon })
      .addTo(mapRef.current)
      .bindPopup(`<div style="padding:10px 12px;font-family:var(--font-sans,sans-serif)"><p style="font-weight:600;font-size:13px;margin:0">You (${currentUser.name})</p><p style="font-size:11px;color:hsl(var(--muted-foreground));margin:4px 0 0">${currentUser.currentCity}</p></div>`);

    (mapRef.current as any)._meMarker = meMarker;
  }, [currentUser]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: 300 }}
      className="rounded-xl overflow-hidden"
    />
  );
}
