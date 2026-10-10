import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { ArrowRight } from 'lucide-react';
import type { Cabin } from '../types';
import { imageOr } from '../lib/format';

// Corrige la ruta de los íconos de Leaflet al empaquetar con Vite.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

export function HotelMap({ lat, lng, name, cabins }: { lat: number; lng: number; name: string; cabins: Cabin[] }) {
  return (
    <MapContainer center={[lat, lng]} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>
          <strong className="text-brand">{name}</strong>
          <br />
          Recepción principal
        </Popup>
      </Marker>
      {cabins
        .filter((c) => c.latitude != null && c.longitude != null)
        .map((c) => (
          <Marker key={c.id} position={[c.latitude!, c.longitude!]}>
            <Popup>
              <div className="max-w-[200px]">
                <img src={imageOr(c.imageUrl, c.id, 400, 300)} alt={c.name} className="mb-2 h-24 w-full rounded-xl object-cover" />
                <strong className="block text-brand">{c.name}</strong>
                <Link to={`/cabanas/${c.id}`} className="mt-1 flex items-center gap-1 text-xs font-bold text-brand">
                  Ver cabaña <ArrowRight size={12} />
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
