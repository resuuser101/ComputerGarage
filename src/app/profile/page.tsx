"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, User, Mail, Phone, Save, Shield, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";

const LocationMap = dynamic(() => import("@/components/profile/LocationMap"), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function ProfilePage() {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [isSaving, setIsSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("Philippines");
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      setStreet(profile.street || "");
      setApartment(profile.apartment || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setZip(profile.zip || "");
      setCountry(profile.country || "Philippines");
      setRequires2FA(profile.requires_2fa || false);
      if (profile.latitude && profile.longitude) {
        setMapPosition([Number(profile.latitude), Number(profile.longitude)]);
      }
    }
  }, [profile]);

  const handleMapChange = async (pos: [number, number]) => {
    setMapPosition(pos);
    setIsGeocoding(true);
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}`, {
        headers: {
          "Accept-Language": "en"
        }
      });
      const data = await res.json();
      
      if (data && data.address) {
        const addr = data.address;
        
        if (addr.road) setStreet(`${addr.house_number ? addr.house_number + ' ' : ''}${addr.road}`);
        if (addr.city || addr.town || addr.village || addr.county) setCity(addr.city || addr.town || addr.village || addr.county || "");
        if (addr.state || addr.region) setState(addr.state || addr.region || "");
        if (addr.postcode) setZip(addr.postcode);
        if (addr.country) setCountry(addr.country);
        
        toast.success("Address auto-filled from map pin!");
      }
    } catch (e) {
      console.error("Reverse geocoding failed", e);
      toast.error("Could not fetch address details for this location.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        street: street,
        apartment: apartment,
        city: city,
        state: state,
        zip: zip,
        country: country,
        requires_2fa: requires2FA,
        latitude: mapPosition ? mapPosition[0] : null,
        longitude: mapPosition ? mapPosition[1] : null,
      })
      .eq("id", user.id);
      
    setIsSaving(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated successfully! Refreshing...");
      // Force reload to update context profile
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          My Profile
          {profile?.role === "admin" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <Shield className="w-3 h-3 mr-1" /> Admin
            </span>
          )}
        </h1>
        <p className="text-slate-500 mt-2">Manage your personal information</p>
      </div>

      <form onSubmit={handleSave}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-xl">Personal Details</CardTitle>
            <CardDescription>Update your contact information</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center">
                  <User className="w-4 h-4 mr-2 text-slate-400" /> First Name
                </label>
                <Input 
                  required
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Last Name</label>
                <Input 
                  required
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-slate-400" /> Email Address
              </label>
              <Input 
                type="email" 
                value={user.email || ""} 
                disabled 
                className="bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500">Your email address cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center">
                <Phone className="w-4 h-4 mr-2 text-slate-400" /> Phone Number
              </label>
              <Input 
                type="tel" 
                placeholder="e.g. 0917 123 4567"
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm mt-8">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-xl flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-slate-700" /> 
              {profile?.role === "admin" ? "Store Address Information" : "Address Information"}
            </CardTitle>
            <CardDescription>
              {profile?.role === "admin" 
                ? "Where your physical store is located" 
                : "Where we will ship your orders"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Street Address</label>
              <Input 
                placeholder="123 Main St, Barangay San Jose"
                value={street} 
                onChange={(e) => setStreet(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Apartment, suite, etc. (optional)</label>
              <Input 
                placeholder="Unit 4B, Building 2"
                value={apartment} 
                onChange={(e) => setApartment(e.target.value)} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">City</label>
                <Input 
                  placeholder="Quezon City"
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">State / Province</label>
                <Input 
                  placeholder="Metro Manila"
                  value={state} 
                  onChange={(e) => setState(e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">ZIP / Postal Code</label>
                <Input 
                  placeholder="1100"
                  value={zip} 
                  onChange={(e) => setZip(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Country</label>
                <Input 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                Exact Location
                <span className="text-xs font-normal text-slate-500">Click on the map to drop a pin</span>
              </label>
              
              <LocationMap 
                position={mapPosition} 
                onPositionChange={handleMapChange} 
              />
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {mapPosition && (
                  <div className="flex gap-4 text-xs font-mono text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
                    <div><span className="font-semibold text-slate-700">Lat:</span> {mapPosition[0].toFixed(6)}</div>
                    <div><span className="font-semibold text-slate-700">Lng:</span> {mapPosition[1].toFixed(6)}</div>
                  </div>
                )}
                
                {isGeocoding && (
                  <div className="flex items-center text-xs text-blue-600">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Fetching address...
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
            
          </CardContent>
        </Card>

        {profile?.role === "customer" && (
          <Card className="border-slate-200 shadow-sm mt-8 mb-16 border-l-4 border-l-blue-500">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-xl flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" /> 
                Security Settings
              </CardTitle>
              <CardDescription>
                Enhance your account security with Two-Factor Authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start space-x-3 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <Checkbox 
                  id="requires2fa" 
                  checked={requires2FA}
                  onCheckedChange={(checked) => setRequires2FA(checked as boolean)}
                  className="mt-1"
                />
                <div className="grid gap-1.5">
                  <label
                    htmlFor="requires2fa"
                    className="text-sm font-semibold text-slate-900 leading-none cursor-pointer"
                  >
                    Enable Email 2FA (Two-Factor Authentication)
                  </label>
                  <p className="text-sm text-slate-500">
                    If enabled, you will be required to enter a 6-digit code sent to your email every time you log in. This dramatically increases your account security.
                  </p>
                </div>
              </div>
              <div className="pt-6 flex justify-end">
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
