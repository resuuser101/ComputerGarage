"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix missing marker icons in leaflet with webpack/nextjs
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface ParsedAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  raw: string;
}

interface MapInnerProps {
  onLocationSelect: (lat: number, lng: number, address: ParsedAddress) => void;
  defaultLocation?: [number, number]; // [lat, lng]
}

export default function MapInner({ onLocationSelect, defaultLocation = [14.5833, 121.0566] /* SM Megamall approx */ }: MapInnerProps) {
  const [position, setPosition] = useState<L.LatLng>(
    new L.LatLng(defaultLocation[0], defaultLocation[1])
  );
  
  const markerRef = useRef<L.Marker>(null);

  // Reverse geocode whenever position changes
  const updateAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
      const data = await response.json();
      
      const emptyAddress: ParsedAddress = {
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        raw: ""
      };

      if (data && data.address) {
        const addr = data.address;
        
        const street = [addr.house_number, addr.road].filter(Boolean).join(" ") || addr.neighbourhood || addr.suburb || "";
        const city = addr.city || addr.town || addr.village || addr.municipality || "";
        const state = addr.state || addr.region || addr.province || "";
        const zip = addr.postcode || "";
        const country = addr.country || "";

        onLocationSelect(lat, lng, {
          street,
          city,
          state,
          zip,
          country,
          raw: data.display_name || ""
        });
      } else {
        onLocationSelect(lat, lng, { ...emptyAddress, raw: "Address not found" });
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      onLocationSelect(lat, lng, { 
        street: "", city: "", state: "", zip: "", country: "", raw: "Error fetching address" 
      });
    }
  };

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          updateAddress(newPos.lat, newPos.lng);
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Initial fetch
  useEffect(() => {
    updateAddress(position.lat, position.lng);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      updateAddress(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <div className="h-[250px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      <MapContainer center={position} zoom={15} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={position}
          ref={markerRef}
        />
      </MapContainer>
    </div>
  );
}
