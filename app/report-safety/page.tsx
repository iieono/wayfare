"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import {
  MapPin,
  Star,
  AlertTriangle,
  CheckCircle,
  Navigation,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface SelectedLocation {
  lat: number;
  lng: number;
  address: string;
  country_code: string;
}

export default function ReportSafetyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: "",
    tags: [] as string[],
    images: [] as string[],
  });

  const MAPBOX_TOKEN =
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    "pk.eyJ1IjoidGVzdC11c2VyIiwiYSI6ImNsb3d4eXl6ZDA0M3Iya3BjbzBkdXE3dGcifQ.test";

  const commonTags = [
    "safe",
    "dangerous",
    "pickpockets",
    "scam",
    "police",
    "tourist-friendly",
    "avoid-night",
    "well-lit",
    "crowded",
    "isolated",
    "emergency",
    "helpful-locals",
    "language-barrier",
    "overpriced",
    "authentic",
    "clean",
    "dirty",
  ];

  useEffect(() => {
    loadMapboxScript();
  }, []);

  const loadMapboxScript = () => {
    if (typeof window !== "undefined" && !window.mapboxgl) {
      const link = document.createElement("link");
      link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";
      script.async = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else if (window.mapboxgl) {
      initializeMap();
    }
  };

  const initializeMap = () => {
    if (mapContainer.current && !map.current) {
      window.mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [0, 20],
        zoom: 2,
      });

      map.current.on("load", () => {
        setMapLoaded(true);

        // Try to get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords = [
                position.coords.longitude,
                position.coords.latitude,
              ];
              map.current.flyTo({
                center: coords,
                zoom: 12,
                duration: 2000,
              });
            },
            (error) => {
              console.log("Could not get user location:", error);
            }
          );
        }
      });

      // Add click handler for map
      map.current.on("click", handleMapClick);

      // Add navigation controls
      map.current.addControl(
        new window.mapboxgl.NavigationControl(),
        "top-right"
      );

      // Add geolocate control
      const geolocate = new window.mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: false,
        showUserHeading: true,
      });
      map.current.addControl(geolocate, "top-right");

      // Change cursor to crosshair to indicate clickable
      map.current.getCanvas().style.cursor = "crosshair";
    }
  };

  const handleMapClick = async (e: any) => {
    const { lng, lat } = e.lngLat;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Add new marker
    marker.current = new window.mapboxgl.Marker({
      color: "#3B82F6",
      scale: 1.2,
    })
      .setLngLat([lng, lat])
      .addTo(map.current);

    // Reverse geocode to get address and country
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=country,region,place,locality,neighborhood,address`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const address =
          feature.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        // Extract country code from the geocoding result
        let country_code = "";
        for (const context of feature.context || []) {
          if (context.id.startsWith("country")) {
            country_code = context.short_code?.toUpperCase() || "";
            break;
          }
        }

        // If no country code found in context, try the feature properties
        if (!country_code && feature.properties?.short_code) {
          country_code = feature.properties.short_code.toUpperCase();
        }

        setSelectedLocation({
          lat,
          lng,
          address,
          country_code,
        });

        toast.success("Location selected! Now fill out your safety report.");
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      setSelectedLocation({
        lat,
        lng,
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        country_code: "",
      });
      toast.success(
        "Location selected! Please specify the country in your report."
      );
    }
  };

  const clearLocation = () => {
    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }
    setSelectedLocation(null);
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `safety-report-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("images").getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, data.publicUrl],
      }));

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to submit a report");
      return;
    }

    if (!selectedLocation) {
      toast.error("Please click on the map to select a location");
      return;
    }

    if (formData.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!formData.comment.trim()) {
      toast.error("Please add a comment");
      return;
    }

    setLoading(true);
    try {
      const geometry = {
        type: "Point",
        coordinates: [selectedLocation.lng, selectedLocation.lat],
      };

      const { error } = await supabase.from("safety_reports").insert({
        user_id: user.id,
        rating: formData.rating,
        comment: formData.comment,
        tags: formData.tags,
        images: formData.images,
        country_code: selectedLocation.country_code || null,
        geometry: geometry,
      });

      if (error) throw error;

      toast.success("Safety report submitted successfully!");
      router.push("/safety-map");
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report: " + error.message);
    } finally {
      setLoading(false);
      setFormData({
        rating: 0,
        comment: "",
        tags: [],
        images: [],
      });
    }
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Card className="max-w-md bg-white shadow-md border border-gray-200">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
            <p className="text-gray-600 mb-4">
              Please sign in to submit a safety report and help other travelers.
            </p>
            <Button asChild>
              <a href="/auth/signin">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Report Safety Experience
            </h1>
            <p className="text-lg opacity-90">
              Click on the map to select a location, then share your experience
            </p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-12rem)]">
        {/* Map Section */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="w-full h-full" />

          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}

          {/* Map Instructions */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Select Location</h3>
            </div>
            <p className="text-sm text-gray-600">
              Click anywhere on the map to select the location where you want to
              report your safety experience.
            </p>
            {selectedLocation && (
              <div className="mt-3 p-2 bg-blue-50 rounded border">
                <p className="text-xs font-medium text-blue-800">Selected:</p>
                <p className="text-xs text-blue-700">
                  {selectedLocation.address}
                </p>
                {selectedLocation.country_code && (
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    {selectedLocation.country_code}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div className="w-96 bg-white border-l overflow-y-auto">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Location */}
              {selectedLocation ? (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">
                            Location Selected
                          </span>
                        </div>
                        <p className="text-sm text-green-700">
                          {selectedLocation.address}
                        </p>
                        {selectedLocation.country_code && (
                          <Badge className="mt-2 bg-green-100 text-green-800">
                            {selectedLocation.country_code}
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearLocation}
                        className="text-green-600 hover:text-green-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-blue-700">
                      Click on the map to select a location
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Safety Rating */}
              <Card className="bg-white shadow-md border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Star className="h-4 w-4 mr-2" />
                    Safety Rating *
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-1 mb-3">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, rating }))
                        }
                        className={`p-1 rounded transition-colors ${
                          formData.rating >= rating
                            ? "text-yellow-400 hover:text-yellow-500"
                            : "text-gray-300 hover:text-gray-400"
                        }`}
                      >
                        <Star
                          className={`h-6 w-6 ${
                            formData.rating >= rating ? "fill-current" : ""
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formData.rating === 0 && "Click stars to rate"}
                    {formData.rating === 1 && "⭐ Very Dangerous"}
                    {formData.rating === 2 && "⭐⭐ Dangerous"}
                    {formData.rating === 3 && "⭐⭐⭐ Moderate"}
                    {formData.rating === 4 && "⭐⭐⭐⭐ Safe"}
                    {formData.rating === 5 && "⭐⭐⭐⭐⭐ Very Safe"}
                  </div>
                </CardContent>
              </Card>

              {/* Experience Description */}
              <Card className="bg-white shadow-md border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base">Your Experience *</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Describe what happened and what other travelers should know..."
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    className="w-full min-h-[100px] text-sm"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.comment.length}/500
                  </p>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="bg-white shadow-md border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {commonTags.slice(0, 12).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          formData.tags.includes(tag)
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card className="bg-white shadow-md border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base">Images (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach((file) => handleImageUpload(file));
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formData.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !selectedLocation}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
