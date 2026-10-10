"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { ParsedAddress } from "./MapInner";

// Use next/dynamic to skip SSR because leaflet requires `window`
const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] w-full rounded-xl border border-slate-200 flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
      <p className="text-sm text-slate-500">Loading map...</p>
    </div>
  ),
});

interface DynamicMapProps {
  onLocationSelect: (lat: number, lng: number, address: ParsedAddress) => void;
}

export function DynamicMap({ onLocationSelect }: DynamicMapProps) {
  return <MapInner onLocationSelect={onLocationSelect} />;
}
