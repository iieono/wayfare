"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import {
  Star,
  MapPin,
  Locate,
  X,
  Send,
  Flag,
  Plus,
  Users,
  RefreshCw,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface SelectedLocation {
  lat: number;
  lng: number;
  address: string;
  country_code: string;
}

interface CommunityPlace {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  place_type: string;
  tags: string[];
  average_rating: number;
  review_count: number;
  created_by_user_id: string;
  is_community_created: boolean;
  verification_status: string;
  created_at: string;
  country_code: string;
  address: string;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface PlaceReview {
  id: number;
  user_id: string;
  place_id: number;
  rating: number;
  comment: string;
  images: string[];
  created_at: string;
  user_profile?: UserProfile;
  places?: {
    name: string;
    latitude: number;
    longitude: number;
    place_type: string;
  };
}

interface SafetyReport {
  id: number;
  user_id: string;
  place_id: number | null;
  rating: number;
  tags: string[];
  comment: string;
  created_at: string;
  country_code: string | null;
}

export default function PlacesPage() {
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const userLocationMarker = useRef<any>(null);
  const selectedLocationMarker = useRef<any>(null);
  const placeMarkers = useRef<any[]>([]);

  const [communityPlaces, setCommunityPlaces] = useState<CommunityPlace[]>([]);
  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<CommunityPlace | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Dialog states
  const [showCreatePlaceDialog, setShowCreatePlaceDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  // Form states
  const [createPlaceForm, setCreatePlaceForm] = useState({
    name: "",
    description: "",
    place_type: "restaurant",
    tags: [] as string[],
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    images: [] as string[],
  });
  const [reportForm, setReportForm] = useState({
    type: "scam",
    description: "",
    severity: 3,
    images: [] as string[],
  });

  const MAPBOX_TOKEN =
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    "pk.eyJ1IjoidGVzdC11c2VyIiwiYSI6ImNsb3d4eXl6ZDA0M3Iya3BjbzBkdXE3dGcifQ.test";

  useEffect(() => {
    fetchCommunityPlaces();
    fetchReviews();
    fetchSafetyReports();
    getCurrentLocation();
    loadMapboxScript();
  }, []);

  // Initialize map when both script is loaded and user location is available
  useEffect(() => {
    if (
      userLocation &&
      !mapInitialized &&
      typeof window !== "undefined" &&
      window.mapboxgl
    ) {
      initializeMap();
      setMapInitialized(true);
    }
  }, [userLocation, mapInitialized]);

  // Load places on map when map is ready and places are fetched
  useEffect(() => {
    if (mapLoaded && communityPlaces.length > 0) {
      loadCommunityPlacesOnMap();
    }
  }, [mapLoaded, communityPlaces]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          setUserLocation(coords);
          setLocationError(null);
          console.log("User location set:", coords);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Unable to get your location");
          // Default to New York City
          const defaultCoords: [number, number] = [-74.006, 40.7128];
          setUserLocation(defaultCoords);
          console.log("Using default location:", defaultCoords);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      setLocationError("Geolocation not supported");
      const defaultCoords: [number, number] = [-74.006, 40.7128];
      setUserLocation(defaultCoords);
      console.log("Geolocation not supported, using default:", defaultCoords);
    }
  };

  const loadMapboxScript = () => {
    if (typeof window !== "undefined" && !window.mapboxgl) {
      const link = document.createElement("link");
      link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";
      script.async = true;
      script.onload = () => {
        console.log("Mapbox script loaded");
      };
      document.head.appendChild(script);
    } else if (window.mapboxgl) {
      console.log("Mapbox already available");
    }
  };

  const initializeMap = () => {
    if (mapContainer.current && !map.current && userLocation) {
      console.log("Initializing map with location:", userLocation);

      window.mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: userLocation,
        zoom: 12, // Zoom out a bit to see more places
      });

      map.current.on("load", () => {
        console.log("Map loaded successfully");
        setMapLoaded(true);

        // Add user location marker (blue)
        userLocationMarker.current = new window.mapboxgl.Marker({
          color: "#3B82F6",
          scale: 1.2,
        })
          .setLngLat(userLocation)
          .setPopup(
            new window.mapboxgl.Popup({ offset: 25 }).setHTML(
              "<div class='p-3'><strong>📍 You are here</strong></div>"
            )
          )
          .addTo(map.current);

        // Add selected location marker (green) - initially at user location
        selectedLocationMarker.current = new window.mapboxgl.Marker({
          color: "#10B981",
          scale: 1.2,
        })
          .setLngLat(userLocation)
          .addTo(map.current);

        // Set user location as default selected location
        reverseGeocode(userLocation[1], userLocation[0]);
      });

      map.current.on("error", (e: any) => {
        console.error("Map error:", e);
        toast.error("Failed to load map. Please refresh the page.");
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

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=poi,address,place,locality,neighborhood&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const address =
          feature.place_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        // Extract country code with better logic
        let country_code = "";
        if (feature.context) {
          for (const context of feature.context) {
            if (context.id && context.id.startsWith("country")) {
              country_code = context.short_code?.toUpperCase() || "";
              break;
            }
          }
        }

        // Fallback to feature properties
        if (!country_code && feature.properties?.short_code) {
          country_code = feature.properties.short_code.toUpperCase();
        }

        setSelectedLocation({
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          address,
          country_code,
        });
        console.log("Location set:", { lat, lng, address, country_code });
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      setSelectedLocation({
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        country_code: "",
      });
    }
  };

  const handleMapClick = async (e: any) => {
    const { lng, lat } = e.lngLat;

    // Update selected location marker
    if (selectedLocationMarker.current) {
      selectedLocationMarker.current.setLngLat([lng, lat]);
    }

    // Reverse geocode and set location
    await reverseGeocode(lat, lng);
    setSelectedPlace(null); // Clear any selected place
    toast.success("Location selected!");
  };

  const loadCommunityPlacesOnMap = async () => {
    if (!map.current || !mapLoaded) {
      console.log("Map not ready for loading places");
      return;
    }

    try {
      console.log(`Loading ${communityPlaces.length} places on map`);

      // Clear existing place markers
      placeMarkers.current.forEach((marker) => marker.remove());
      placeMarkers.current = [];

      communityPlaces.forEach((place: CommunityPlace) => {
        const markerEl = document.createElement("div");
        markerEl.className = "community-place-marker";
        markerEl.style.width = "24px";
        markerEl.style.height = "24px";
        markerEl.style.borderRadius = "50%";
        markerEl.style.backgroundColor = getPlaceTypeColor(place.place_type);
        markerEl.style.border = "3px solid white";
        markerEl.style.cursor = "pointer";
        markerEl.style.boxShadow = "0 3px 12px rgba(0,0,0,0.4)";
        markerEl.style.transition = "all 0.2s";
        markerEl.style.display = "flex";
        markerEl.style.alignItems = "center";
        markerEl.style.justifyContent = "center";
        markerEl.style.fontSize = "12px";
        markerEl.style.zIndex = "1000";

        // Add icon based on place type
        markerEl.innerHTML = getPlaceTypeIcon(place.place_type);

        // Add click handler
        markerEl.addEventListener("click", (e) => {
          e.stopPropagation();
          console.log("Place clicked:", place.name);
          setSelectedPlace(place);
          setSelectedLocation({
            lat: place.latitude,
            lng: place.longitude,
            address: place.address || place.name,
            country_code: place.country_code || "",
          });

          // Update selected location marker
          if (selectedLocationMarker.current) {
            selectedLocationMarker.current.setLngLat([
              place.longitude,
              place.latitude,
            ]);
          }

          // Fly to place
          map.current.flyTo({
            center: [place.longitude, place.latitude],
            zoom: 16,
            duration: 1000,
          });

          toast.success(`Selected ${place.name}`);
        });

        const marker = new window.mapboxgl.Marker(markerEl)
          .setLngLat([place.longitude, place.latitude])
          .addTo(map.current);

        placeMarkers.current.push(marker);
      });

      console.log(`Added ${placeMarkers.current.length} place markers to map`);
    } catch (error) {
      console.error("Error loading community places on map:", error);
    }
  };

  const getPlaceTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      restaurant: "#10B981",
      hotel: "#3B82F6",
      attraction: "#8B5CF6",
      shopping: "#06B6D4",
      transport: "#F59E0B",
      hospital: "#EC4899",
      bank: "#84CC16",
      general: "#6B7280",
    };
    return colors[type] || "#6B7280";
  };

  const getPlaceTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      restaurant: "🍽️",
      hotel: "🏨",
      attraction: "🎯",
      shopping: "🛍️",
      transport: "🚌",
      hospital: "🏥",
      bank: "🏦",
      general: "📍",
    };
    return icons[type] || "📍";
  };

  const handleImageUpload = async (
    file: File,
    formType: "review" | "report"
  ) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${formType}-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);

      if (formType === "review") {
        setReviewForm((prev) => ({
          ...prev,
          images: [...prev.images, data.publicUrl],
        }));
      } else {
        setReportForm((prev) => ({
          ...prev,
          images: [...prev.images, data.publicUrl],
        }));
      }

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleCreatePlace = async () => {
    if (!user || !selectedLocation) {
      toast.error("Please sign in and select a location");
      return;
    }

    if (!createPlaceForm.name.trim()) {
      toast.error("Please enter a place name");
      return;
    }

    try {
      setLoading(true);
      const { data: newPlace, error } = await supabase
        .from("places")
        .insert({
          name: createPlaceForm.name,
          description: createPlaceForm.description,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          place_type: createPlaceForm.place_type,
          tags: createPlaceForm.tags,
          country_code: selectedLocation.country_code || null,
          address: selectedLocation.address,
          created_by_user_id: user.id,
          is_community_created: true,
          verification_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Place created successfully!");
      setShowCreatePlaceDialog(false);
      setCreatePlaceForm({
        name: "",
        description: "",
        place_type: "restaurant",
        tags: [],
      });

      // Refresh places
      await fetchCommunityPlaces();
    } catch (error) {
      console.error("Error creating place:", error);
      toast.error("Failed to create place");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !selectedPlace) {
      toast.error("Please sign in and select a place to review");
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error("Please write a review comment");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("place_reviews").insert({
        user_id: user.id,
        place_id: selectedPlace.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        images: reviewForm.images,
      });

      if (error) throw error;

      toast.success("Review submitted successfully!");
      setShowReviewDialog(false);
      setReviewForm({ rating: 5, comment: "", images: [] });

      // Update the selected place with new rating data
      if (selectedPlace) {
        const { data: updatedPlace } = await supabase
          .from("places")
          .select("*")
          .eq("id", selectedPlace.id)
          .single();

        if (updatedPlace) {
          setSelectedPlace(updatedPlace);
        }
      }

      // Refresh data
      await Promise.all([fetchReviews(), fetchCommunityPlaces()]);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!user || !selectedLocation) {
      toast.error("Please sign in and select a location to report an issue");
      return;
    }

    if (!reportForm.description.trim()) {
      toast.error("Please describe the safety issue");
      return;
    }

    try {
      setLoading(true);
      const geometry = {
        type: "Point",
        coordinates: [selectedLocation.lng, selectedLocation.lat],
      };

      const { error } = await supabase.from("safety_reports").insert({
        user_id: user.id,
        place_id: selectedPlace?.id || null,
        rating: 6 - reportForm.severity, // Convert severity to rating (1-5 scale)
        tags: [reportForm.type],
        comment: reportForm.description,
        country_code: selectedLocation.country_code || null,
        geometry: geometry,
        images: reportForm.images,
      });

      if (error) throw error;

      toast.success("Safety report submitted successfully!");
      setShowReportDialog(false);
      setReportForm({ type: "scam", description: "", severity: 3, images: [] });

      // Refresh safety reports
      await fetchSafetyReports();
    } catch (error) {
      console.error("Error submitting safety report:", error);
      toast.error("Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityPlaces = async () => {
    try {
      console.log("Fetching community places...");
      const { data, error } = await supabase
        .from("places")
        .select(
          `
          id,
          name,
          description,
          latitude,
          longitude,
          place_type,
          tags,
          average_rating,
          review_count,
          created_by_user_id,
          is_community_created,
          verification_status,
          created_at,
          country_code,
          address
        `
        )
        .eq("is_community_created", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching places:", error);
        toast.error("Failed to load places");
        return;
      }

      console.log(`Fetched ${data?.length || 0} community places`);
      if (data) setCommunityPlaces(data);
    } catch (error) {
      console.error("Error in fetchCommunityPlaces:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      // First, let's try a simpler query to get reviews with user info
      const { data, error } = await supabase
        .from("place_reviews")
        .select(
          `
          id,
          user_id,
          place_id,
          rating,
          comment,
          images,
          created_at,
          places (
            name,
            latitude,
            longitude,
            place_type
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching reviews:", error);
        return;
      }

      // Now fetch user profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((review) => review.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", userIds);

        // Combine the data
        const reviewsWithProfiles = data.map((review) => ({
          ...review,
          user_profile:
            profiles?.find((profile) => profile.id === review.user_id) || null,
        }));

        setReviews(reviewsWithProfiles);
      } else {
        setReviews(data || []);
      }
    } catch (error) {
      console.error("Error in fetchReviews:", error);
    }
  };

  const fetchSafetyReports = async () => {
    try {
      const { data, error } = await supabase
        .from("safety_reports")
        .select(
          `
          id,
          user_id,
          place_id,
          rating,
          tags,
          comment,
          created_at,
          country_code
        `
        )
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching safety reports:", error);
        return;
      }

      if (data) setSafetyReports(data);
    } catch (error) {
      console.error("Error in fetchSafetyReports:", error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
            ? "text-yellow-400 fill-current opacity-50"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const getSeverityColor = (rating: number) => {
    if (rating >= 4) return "text-green-600 bg-green-100";
    if (rating >= 3) return "text-yellow-600 bg-yellow-100";
    if (rating >= 2) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getSeverityText = (rating: number) => {
    if (rating >= 4) return "Safe";
    if (rating >= 3) return "Moderate";
    if (rating >= 2) return "Concerning";
    return "Dangerous";
  };

  const removeImage = (index: number, formType: "review" | "report") => {
    if (formType === "review") {
      setReviewForm((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    } else {
      setReportForm((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  };

  const getReportTypeColor = (tags: string[]) => {
    const tag = tags[0]?.toLowerCase();
    if (tag === "scam" || tag === "fraud") return "text-red-600 bg-red-100";
    if (tag === "theft") return "text-red-600 bg-red-100";
    if (tag === "harassment") return "text-orange-600 bg-orange-100";
    if (tag === "overcharging") return "text-yellow-600 bg-yellow-100";
    if (tag === "unsafe") return "text-orange-600 bg-orange-100";
    return "text-gray-600 bg-gray-100";
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-6">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Community Places
              </h1>
              <p className="text-lg opacity-90">
                Discover places created by travelers like you. Click on the map
                to create new places or review existing ones.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{communityPlaces.length}</div>
              <div className="text-sm opacity-75">Places Found</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-12rem)]">
        {/* Map Section */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="w-full h-full" />

          {(!mapLoaded || !userLocation) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">
                  {!userLocation
                    ? "Getting your location..."
                    : "Loading map..."}
                </p>
                {locationError && (
                  <p className="text-red-500 text-sm mt-2">{locationError}</p>
                )}
              </div>
            </div>
          )}

          {/* Map Instructions */}
          {mapLoaded && (
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Community Places</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Click colored dots to select places, or click anywhere else to
                create new ones.
              </p>
              <div className="text-xs text-gray-500">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Your location</span>
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Selected location</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>{communityPlaces.length} community places</span>
                </div>
              </div>
            </div>
          )}

          {/* Refresh Places Button */}
          {mapLoaded && (
            <div className="absolute bottom-4 left-4">
              <Button
                onClick={fetchCommunityPlaces}
                className="bg-white/95 text-gray-700 hover:bg-white shadow-lg"
                size="sm"
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          )}

          {/* Current Location Button */}
          {mapLoaded && (
            <div className="absolute bottom-4 right-4">
              <Button
                onClick={() => {
                  if (userLocation && map.current) {
                    map.current.flyTo({
                      center: userLocation,
                      zoom: 15,
                      duration: 1000,
                    });
                  }
                }}
                className="bg-white/95 text-gray-700 hover:bg-white shadow-lg"
                size="sm"
              >
                <Locate className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-gradient-to-b from-slate-50 to-blue-50 border-l overflow-y-auto">
          <div className="p-4 space-y-6">
            {selectedLocation && (
              <>
                {/* Selected Location Info */}
                <div className="bg-white rounded-xl shadow-lg border border-green-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MapPin className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {selectedPlace
                              ? "Selected Place"
                              : "Selected Location"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedPlace
                              ? selectedPlace.name
                              : selectedLocation.address}
                          </p>
                        </div>
                      </div>
                      {selectedPlace && (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              {getPlaceTypeIcon(selectedPlace.place_type)}{" "}
                              {selectedPlace.place_type}
                            </Badge>
                            <Badge
                              className={`${
                                selectedPlace.verification_status === "verified"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {selectedPlace.verification_status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex">
                              {renderStars(selectedPlace.average_rating || 0)}
                            </div>
                            <span className="text-sm text-gray-600 font-medium">
                              {(selectedPlace.average_rating || 0).toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({selectedPlace.review_count || 0} reviews)
                            </span>
                          </div>
                          {selectedPlace.description && (
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                              {selectedPlace.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                            <span>Community Place</span>
                            <span>
                              {new Date(
                                selectedPlace.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLocation(null);
                        setSelectedPlace(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Safety Alerts for Selected Location */}
                {selectedPlace &&
                  safetyReports.filter(
                    (report) => report.place_id === selectedPlace.id
                  ).length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg border border-orange-200 p-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Safety Alerts
                          </h3>
                          <p className="text-sm text-gray-600">
                            Recent reports for this location
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {safetyReports
                          .filter(
                            (report) => report.place_id === selectedPlace.id
                          )
                          .slice(0, 3)
                          .map((report) => (
                            <div
                              key={report.id}
                              className="bg-orange-50 p-3 rounded-lg border border-orange-100"
                            >
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge
                                  className={getReportTypeColor(report.tags)}
                                  variant="secondary"
                                >
                                  {report.tags[0]}
                                </Badge>
                                <Badge
                                  className={`px-2 py-1 text-xs ${getSeverityColor(
                                    report.rating
                                  )}`}
                                >
                                  {getSeverityText(report.rating)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700">
                                {report.comment}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(
                                  report.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {!selectedPlace && (
                    <Dialog
                      open={showCreatePlaceDialog}
                      onOpenChange={setShowCreatePlaceDialog}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                          disabled={!user}
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Create New Place
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md bg-white border-0 shadow-2xl">
                        <DialogHeader className="pb-4 border-b">
                          <DialogTitle className="text-xl font-semibold">
                            Create New Place
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5 pt-4">
                          <div>
                            <Label
                              htmlFor="name"
                              className="text-sm font-medium text-gray-700"
                            >
                              Place Name
                            </Label>
                            <Input
                              id="name"
                              value={createPlaceForm.name}
                              onChange={(e) =>
                                setCreatePlaceForm({
                                  ...createPlaceForm,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Enter place name..."
                              className="mt-2 h-11"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="description"
                              className="text-sm font-medium text-gray-700"
                            >
                              Description
                            </Label>
                            <Textarea
                              id="description"
                              value={createPlaceForm.description}
                              onChange={(e) =>
                                setCreatePlaceForm({
                                  ...createPlaceForm,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Describe this place..."
                              className="mt-2 min-h-[80px]"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Place Type
                            </Label>
                            <Select
                              value={createPlaceForm.place_type}
                              onValueChange={(value) =>
                                setCreatePlaceForm({
                                  ...createPlaceForm,
                                  place_type: value,
                                })
                              }
                            >
                              <SelectTrigger className="mt-2 h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="restaurant">
                                  🍽️ Restaurant
                                </SelectItem>
                                <SelectItem value="hotel">🏨 Hotel</SelectItem>
                                <SelectItem value="attraction">
                                  🎯 Attraction
                                </SelectItem>
                                <SelectItem value="shopping">
                                  🛍️ Shopping
                                </SelectItem>
                                <SelectItem value="transport">
                                  🚌 Transport
                                </SelectItem>
                                <SelectItem value="hospital">
                                  🏥 Hospital
                                </SelectItem>
                                <SelectItem value="bank">🏦 Bank</SelectItem>
                                <SelectItem value="general">
                                  📍 General
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex space-x-3 pt-4">
                            <Button
                              onClick={handleCreatePlace}
                              className="flex-1 h-11"
                              disabled={!user || loading}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {loading ? "Creating..." : "Create Place"}
                            </Button>
                            <Button
                              variant="outline"
                              className="h-11"
                              onClick={() => setShowCreatePlaceDialog(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {selectedPlace && (
                    <div className="grid grid-cols-2 gap-3">
                      <Dialog
                        open={showReviewDialog}
                        onOpenChange={setShowReviewDialog}
                      >
                        <DialogTrigger asChild>
                          <Button
                            className="h-12 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg"
                            disabled={!user}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Write Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-white border-0 shadow-2xl">
                          <DialogHeader className="pb-4 border-b">
                            <DialogTitle className="text-xl font-semibold">
                              Review {selectedPlace.name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-5 pt-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Rating
                              </Label>
                              <div className="flex space-x-1 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() =>
                                      setReviewForm({
                                        ...reviewForm,
                                        rating: star,
                                      })
                                    }
                                    className="p-1 hover:scale-110 transition-transform"
                                  >
                                    <Star
                                      className={`h-7 w-7 ${
                                        star <= reviewForm.rating
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label
                                htmlFor="comment"
                                className="text-sm font-medium text-gray-700"
                              >
                                Your Review
                              </Label>
                              <Textarea
                                id="comment"
                                value={reviewForm.comment}
                                onChange={(e) =>
                                  setReviewForm({
                                    ...reviewForm,
                                    comment: e.target.value,
                                  })
                                }
                                placeholder="Share your experience at this place..."
                                className="mt-2 min-h-[100px]"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Images (Optional)
                              </Label>
                              <div className="mt-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => {
                                    const files = Array.from(
                                      e.target.files || []
                                    );
                                    files.forEach((file) =>
                                      handleImageUpload(file, "review")
                                    );
                                  }}
                                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {reviewForm.images.length > 0 && (
                                  <div className="mt-3 grid grid-cols-2 gap-2">
                                    {reviewForm.images.map((image, index) => (
                                      <div key={index} className="relative">
                                        <img
                                          src={image || "/placeholder.svg"}
                                          alt={`Upload ${index + 1}`}
                                          className="w-full h-20 object-cover rounded-lg"
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeImage(index, "review")
                                          }
                                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-3 pt-4">
                              <Button
                                onClick={handleSubmitReview}
                                className="flex-1 h-11"
                                disabled={!user || loading}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {loading ? "Submitting..." : "Submit Review"}
                              </Button>
                              <Button
                                variant="outline"
                                className="h-11"
                                onClick={() => setShowReviewDialog(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={showReportDialog}
                        onOpenChange={setShowReportDialog}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-lg"
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            Report Issue
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-white border-0 shadow-2xl">
                          <DialogHeader className="pb-4 border-b">
                            <DialogTitle className="text-xl font-semibold">
                              Report Safety Issue
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-5 pt-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Issue Type
                              </Label>
                              <Select
                                value={reportForm.type}
                                onValueChange={(value) =>
                                  setReportForm({ ...reportForm, type: value })
                                }
                              >
                                <SelectTrigger className="mt-2 h-11">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="scam">Scam</SelectItem>
                                  <SelectItem value="theft">Theft</SelectItem>
                                  <SelectItem value="harassment">
                                    Harassment
                                  </SelectItem>
                                  <SelectItem value="overcharging">
                                    Overcharging
                                  </SelectItem>
                                  <SelectItem value="unsafe">
                                    Unsafe Conditions
                                  </SelectItem>
                                  <SelectItem value="fraud">Fraud</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Severity (1-5)
                              </Label>
                              <Select
                                value={reportForm.severity.toString()}
                                onValueChange={(value) =>
                                  setReportForm({
                                    ...reportForm,
                                    severity: Number.parseInt(value),
                                  })
                                }
                              >
                                <SelectTrigger className="mt-2 h-11">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">
                                    1 - Minor Issue
                                  </SelectItem>
                                  <SelectItem value="2">
                                    2 - Moderate
                                  </SelectItem>
                                  <SelectItem value="3">
                                    3 - Concerning
                                  </SelectItem>
                                  <SelectItem value="4">4 - Serious</SelectItem>
                                  <SelectItem value="5">
                                    5 - Dangerous
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label
                                htmlFor="description"
                                className="text-sm font-medium text-gray-700"
                              >
                                Description
                              </Label>
                              <Textarea
                                id="description"
                                value={reportForm.description}
                                onChange={(e) =>
                                  setReportForm({
                                    ...reportForm,
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Describe what happened and any safety concerns..."
                                className="mt-2 min-h-[100px]"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Images (Optional)
                              </Label>
                              <div className="mt-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => {
                                    const files = Array.from(
                                      e.target.files || []
                                    );
                                    files.forEach((file) =>
                                      handleImageUpload(file, "report")
                                    );
                                  }}
                                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {reportForm.images.length > 0 && (
                                  <div className="mt-3 grid grid-cols-2 gap-2">
                                    {reportForm.images.map((image, index) => (
                                      <div key={index} className="relative">
                                        <img
                                          src={image || "/placeholder.svg"}
                                          alt={`Upload ${index + 1}`}
                                          className="w-full h-20 object-cover rounded-lg"
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeImage(index, "report")
                                          }
                                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-3 pt-4">
                              <Button
                                onClick={handleSubmitReport}
                                className="flex-1 h-11"
                                disabled={!user || loading}
                              >
                                <Flag className="h-4 w-4 mr-2" />
                                {loading ? "Submitting..." : "Submit Report"}
                              </Button>
                              <Button
                                variant="outline"
                                className="h-11"
                                onClick={() => setShowReportDialog(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </>
            )}

            {!selectedLocation && (
              <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 text-center">
                <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Community-Driven Places
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {!userLocation
                    ? "Getting your location to show nearby places..."
                    : "Click colored dots to select places, or click anywhere else to create new ones."}
                </p>
                {!user && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-700">
                      Sign in to create places and write reviews!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Safety Reports Section - only show when no place is selected */}
            {!selectedPlace && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Shield className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Recent Safety Reports
                    </h3>
                    <p className="text-sm text-gray-600">
                      Community safety updates
                    </p>
                  </div>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {safetyReports.length > 0 ? (
                    safetyReports.slice(0, 5).map((report) => (
                      <div
                        key={report.id}
                        className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            className={getReportTypeColor(report.tags)}
                            variant="secondary"
                          >
                            {report.tags[0]}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {report.comment}
                        </p>
                        <div className="flex items-center justify-between">
                          {report.country_code && (
                            <span className="text-xs text-gray-500">
                              📍 {report.country_code}
                            </span>
                          )}
                          <Badge
                            className={`px-2 py-1 text-xs ${getSeverityColor(
                              report.rating
                            )}`}
                          >
                            {getSeverityText(report.rating)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        No safety reports yet. Help keep travelers safe by
                        reporting issues!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Recent Reviews
                  </h3>
                  <p className="text-sm text-gray-600">
                    What travelers are saying
                  </p>
                </div>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {review.user_profile?.avatar_url ? (
                            <img
                              src={
                                review.user_profile.avatar_url ||
                                "/placeholder.svg"
                              }
                              alt="User avatar"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            (
                              review.user_profile?.full_name ||
                              review.user_profile?.username ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-sm text-gray-900 truncate">
                              {review.user_profile?.full_name ||
                                review.user_profile?.username ||
                                `User ${review.user_id.slice(-4)}`}
                            </span>
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                            {review.comment}
                          </p>
                          {review.places && (
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-600 truncate">
                                {review.places.name}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {getPlaceTypeIcon(review.places.place_type)}{" "}
                                {review.places.place_type}
                              </Badge>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      No reviews yet. Be the first to review a place!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
