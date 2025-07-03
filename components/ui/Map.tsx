'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

interface MapProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const MapEvents: React.FC<{ onLocationChange: (lat: number, lng: number) => void }> = ({ onLocationChange }) => {
  const map = useMapEvents({
    dragend: () => {
      const { lat, lng } = map.getCenter();
      onLocationChange(lat, lng);
    },
  });
  return null;
};

const DraggableMarker: React.FC<{ lat: number; lng: number; onLocationChange: (lat: number, lng: number) => void }> = ({ 
  lat, 
  lng, 
  onLocationChange 
}) => {
  const [position, setPosition] = useState<LatLngExpression>([lat, lng]);
  const markerRef = useRef(null);

  useEffect(() => {
    setPosition([lat, lng]);
  }, [lat, lng]);

  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat: newLat, lng: newLng } = (marker as any).getLatLng();
          onLocationChange(newLat, newLng);
          setPosition([newLat, newLng]);
        }
      },
    }),
    [onLocationChange]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={markerIcon}
    />
  );
};

const Map: React.FC<MapProps> = ({ lat, lng, onLocationChange }) => {
  return (
    <div className="h-64 w-full border-2 border-black rounded-md overflow-hidden shadow-[4px_4px_0px_#000]">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker lat={lat} lng={lng} onLocationChange={onLocationChange} />
        <MapEvents onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
};

export default Map; 