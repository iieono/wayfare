"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/client";
import {
  Shield,
  Filter,
  MapPin,
  X,
  AlertTriangle,
  Users,
  RefreshCw,
} from "lucide-react";

interface SafetyReport {
  id: number;
  rating: number;
  tags: string[];
  comment: string;
  images: string[];
  created_at: string;
  geometry: any;
  country_code?: string;
}

interface Country {
  code: string;
  name: string;
  risk_score: number | null;
}

export default function SafetyMapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(
    null
  );
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    fetchSafetyReports();
    fetchCountries();
    loadMapboxScript();
  }, []);

  const fetchCountries = async () => {
    const { data } = await supabase
      .from("countries")
      .select("code, name, risk_score");
    if (data) {
      console.log("Fetched countries:", data.slice(0, 5));
      setCountries(data);
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
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else if (window.mapboxgl) {
      initializeMap();
    }
  };

  const initializeMap = () => {
    if (mapContainer.current && !map.current) {
      const mapboxToken =
        process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
        "pk.eyJ1IjoidGVzdC11c2VyIiwiYSI6ImNsb3d4eXl6ZDA0M3Iya3BjbzBkdXE3dGcifQ.test";

      window.mapboxgl.accessToken = mapboxToken;

      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [0, 20],
        zoom: 2,
      });

      map.current.on("load", () => {
        setMapLoaded(true);
      });
    }
  };

  const addCountryRiskLayer = () => {
    if (!map.current || !countries.length) return;

    // Remove existing layers if they exist
    if (map.current.getLayer("country-risk-fill")) {
      map.current.removeLayer("country-risk-fill");
    }
    if (map.current.getLayer("country-risk-borders")) {
      map.current.removeLayer("country-risk-borders");
    }
    if (map.current.getLayer("country-selected")) {
      map.current.removeLayer("country-selected");
    }
    if (map.current.getSource("admin-0")) {
      map.current.removeSource("admin-0");
    }

    console.log(
      "Adding country risk layer with",
      countries.length,
      "countries"
    );

    map.current.addSource("admin-0", {
      type: "vector",
      url: "mapbox://mapbox.country-boundaries-v1",
    });

    // Filter countries based on selected rating
    const filteredCountries = filterRating
      ? countries.filter(
          (country) =>
            country.risk_score &&
            getRiskLevel(country.risk_score).level ===
              getRiskLevel(filterRating).level
        )
      : countries;

    const colorExpression = ["case"];

    filteredCountries.forEach((country) => {
      if (country.risk_score !== null) {
        colorExpression.push(
          [
            "any",
            ["==", ["get", "iso_3166_1_alpha_3"], country.code],
            ["==", ["get", "iso_3166_1"], country.code],
            ["==", ["get", "worldview"], country.code],
          ],
          getRiskColor(country.risk_score)
        );
      }
    });

    // Default color - more transparent when filtering
    colorExpression.push(
      filterRating ? "rgba(200, 200, 200, 0.1)" : "rgba(200, 200, 200, 0.3)"
    );

    map.current.addLayer({
      id: "country-risk-fill",
      type: "fill",
      source: "admin-0",
      "source-layer": "country_boundaries",
      paint: {
        "fill-color": colorExpression,
        "fill-opacity": 0.6,
      },
    });

    map.current.addLayer({
      id: "country-risk-borders",
      type: "line",
      source: "admin-0",
      "source-layer": "country_boundaries",
      paint: {
        "line-color": "#ffffff",
        "line-width": 1,
        "line-opacity": 0.8,
      },
    });

    // Add selected country highlight layer
    if (selectedCountry) {
      const selectedExpression = [
        "case",
        [
          "any",
          ["==", ["get", "iso_3166_1_alpha_3"], selectedCountry.code],
          ["==", ["get", "iso_3166_1"], selectedCountry.code],
          ["==", ["get", "worldview"], selectedCountry.code],
        ],
        "#000000",
        "rgba(0,0,0,0)",
      ];

      map.current.addLayer({
        id: "country-selected",
        type: "line",
        source: "admin-0",
        "source-layer": "country_boundaries",
        paint: {
          "line-color": selectedExpression,
          "line-width": 3,
          "line-opacity": 1,
        },
      });
    }

    // Add click handler for countries
    map.current.on("click", "country-risk-fill", (e) => {
      if (e.features.length > 0) {
        const feature = e.features[0];
        const countryCode =
          feature.properties.iso_3166_1_alpha_3 ||
          feature.properties.iso_3166_1;
        const country = countries.find((c) => c.code === countryCode);

        if (country) {
          setSelectedCountry(country);
          setSelectedReport(null); // Clear selected report when selecting country

          // Focus map on the clicked country
          if (map.current) {
            map.current.flyTo({
              center: e.lngLat,
              zoom: 5,
              duration: 1000,
            });
          }
        }
      }
    });

    map.current.on("mouseenter", "country-risk-fill", () => {
      map.current.getCanvas().style.cursor = "pointer";
    });

    map.current.on("mouseleave", "country-risk-fill", () => {
      map.current.getCanvas().style.cursor = "";
    });
  };

  const fetchSafetyReports = async () => {
    const { data } = await supabase
      .from("safety_reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setSafetyReports(data);
  };

  // Update map when countries, filter, or selected country changes
  useEffect(() => {
    if (mapLoaded && countries.length > 0) {
      addCountryRiskLayer();
    }
  }, [mapLoaded, countries, filterRating, selectedCountry]);

  // Update safety report markers when filter changes
  useEffect(() => {
    if (mapLoaded && safetyReports.length > 0) {
      addMarkersToMap();
    }
  }, [mapLoaded, safetyReports, filterRating, selectedCountry]);

  const addMarkersToMap = () => {
    if (!map.current) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll(".mapbox-marker");
    existingMarkers.forEach((marker) => marker.remove());

    // Clear existing danger zones
    safetyReports.forEach((report) => {
      if (map.current.getLayer(`danger-zone-${report.id}`)) {
        map.current.removeLayer(`danger-zone-${report.id}`);
      }
      if (map.current.getSource(`danger-zone-${report.id}`)) {
        map.current.removeSource(`danger-zone-${report.id}`);
      }
    });

    let filteredReports = safetyReports;

    // Filter by rating if selected
    if (filterRating) {
      filteredReports = filteredReports.filter(
        (report) =>
          getRiskLevel(report.rating).level === getRiskLevel(filterRating).level
      );
    }

    // Filter by selected country if selected
    if (selectedCountry) {
      filteredReports = filteredReports.filter(
        (report) => report.country_code === selectedCountry.code
      );
    }

    filteredReports.forEach((report) => {
      try {
        let coords;
        if (typeof report.geometry === "string") {
          const parsed = JSON.parse(report.geometry);
          coords = parsed.coordinates || [
            parsed.lng || parsed.longitude,
            parsed.lat || parsed.latitude,
          ];
        } else if (report.geometry?.coordinates) {
          coords = report.geometry.coordinates;
        } else {
          coords = [(Math.random() - 0.5) * 360, (Math.random() - 0.5) * 180];
        }

        const markerEl = document.createElement("div");
        markerEl.className = "mapbox-marker";
        markerEl.style.width = "20px";
        markerEl.style.height = "20px";
        markerEl.style.borderRadius = "50%";
        markerEl.style.backgroundColor = getRiskColor(report.rating);
        markerEl.style.border = "2px solid white";
        markerEl.style.cursor = "pointer";
        markerEl.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
        markerEl.style.zIndex = "1000";

        const marker = new window.mapboxgl.Marker(markerEl)
          .setLngLat(coords)
          .addTo(map.current);

        markerEl.addEventListener("click", () => {
          setSelectedReport(report);
          setSelectedCountry(null); // Clear selected country when selecting report

          // Focus map on the clicked report
          if (map.current) {
            map.current.flyTo({
              center: coords,
              zoom: 12,
              duration: 1000,
            });
          }
        });

        if (report.rating <= 2) {
          map.current.addSource(`danger-zone-${report.id}`, {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: coords,
              },
            },
          });

          map.current.addLayer({
            id: `danger-zone-${report.id}`,
            type: "circle",
            source: `danger-zone-${report.id}`,
            paint: {
              "circle-radius": {
                stops: [
                  [0, 0],
                  [20, 50],
                ],
                base: 2,
              },
              "circle-color": getRiskColor(report.rating),
              "circle-opacity": 0.2,
              "circle-stroke-color": getRiskColor(report.rating),
              "circle-stroke-width": 2,
              "circle-stroke-opacity": 0.8,
            },
          });
        }
      } catch (error) {
        console.error("Error adding marker:", error);
      }
    });
  };

  const getRiskColor = (rating: number) => {
    if (rating >= 4) return "#10B981"; // Green - Safe
    if (rating === 3) return "#F59E0B"; // Yellow - Caution
    return "#EF4444"; // Red - Danger (1-2)
  };

  const getRiskLevel = (rating: number) => {
    if (rating >= 4)
      return { level: "Safe", color: "bg-green-100 text-green-800" };
    if (rating === 3)
      return { level: "Caution", color: "bg-yellow-100 text-yellow-800" };
    return { level: "Danger", color: "bg-red-100 text-red-800" };
  };

  const handleFilterChange = (rating: number | null) => {
    setFilterRating(rating);
    console.log("Filter changed to:", rating);
  };

  const getFilteredReports = () => {
    let filtered = safetyReports;

    // Filter by selected country first
    if (selectedCountry) {
      filtered = filtered.filter(
        (report) => report.country_code === selectedCountry.code
      );
    }

    // Then filter by rating if selected
    if (filterRating) {
      filtered = filtered.filter(
        (report) =>
          getRiskLevel(report.rating).level === getRiskLevel(filterRating).level
      );
    }

    return filtered;
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
      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white py-6">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              Global Safety Map
            </h1>
            <p className="text-xl opacity-90">
              Real-time safety intelligence from our global community of
              travelers
            </p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-12rem)]">
        {/* Map Container */}
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

          {/* Map Controls */}
          <div className="absolute top-4 left-4 space-y-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Filter className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium">Filter by Risk Level</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={filterRating === null ? "default" : "outline"}
                  onClick={() => handleFilterChange(null)}
                  className="text-xs"
                >
                  Show All
                </Button>
                <Button
                  size="sm"
                  variant={filterRating === 1 ? "default" : "outline"}
                  onClick={() => handleFilterChange(1)}
                  className="text-xs"
                  style={{
                    backgroundColor: filterRating === 1 ? "#EF4444" : undefined,
                    borderColor: "#EF4444",
                    color: filterRating === 1 ? "white" : "#EF4444",
                  }}
                >
                  Danger
                </Button>
                <Button
                  size="sm"
                  variant={filterRating === 3 ? "default" : "outline"}
                  onClick={() => handleFilterChange(3)}
                  className="text-xs"
                  style={{
                    backgroundColor: filterRating === 3 ? "#F59E0B" : undefined,
                    borderColor: "#F59E0B",
                    color: filterRating === 3 ? "white" : "#F59E0B",
                  }}
                >
                  Caution
                </Button>
                <Button
                  size="sm"
                  variant={filterRating === 4 ? "default" : "outline"}
                  onClick={() => handleFilterChange(4)}
                  className="text-xs"
                  style={{
                    backgroundColor: filterRating === 4 ? "#10B981" : undefined,
                    borderColor: "#10B981",
                    color: filterRating === 4 ? "white" : "#10B981",
                  }}
                >
                  Safe
                </Button>
              </div>
              {filterRating && (
                <div className="mt-2 text-xs text-gray-600">
                  Showing only {getRiskLevel(filterRating).level.toLowerCase()}{" "}
                  areas
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <h3 className="font-medium mb-3 flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-2">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                Risk Levels
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Danger (1-2) - Avoid if possible</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Caution (3) - Exercise caution</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Safe (4-5) - Generally safe</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                <p>• Click countries to select them</p>
                <p>• Click pins to view reports</p>
                <p>• Use filters to focus on risk levels</p>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="absolute bottom-4 left-4">
            <Button
              onClick={fetchSafetyReports}
              className="bg-white/95 text-gray-700 hover:bg-white shadow-lg"
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-gradient-to-b from-slate-50 to-red-50 border-l overflow-y-auto">
          <div className="p-4 space-y-4">
            {selectedReport ? (
              <div className="bg-white rounded-xl shadow-lg border border-red-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Safety Report
                      </h3>
                      <p className="text-sm text-gray-600">Incident details</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReport(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={getRiskLevel(selectedReport.rating).color}
                    >
                      {getRiskLevel(selectedReport.rating).level}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(selectedReport.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {selectedReport.tags && selectedReport.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          className={getReportTypeColor(selectedReport.tags)}
                          variant="secondary"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedReport.comment}
                    </p>
                  </div>

                  {selectedReport.images &&
                    selectedReport.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedReport.images.map((image, index) => (
                          <img
                            key={index}
                            src={`https://urjohkecusevwayoyont.supabase.co/storage/v1/object/public/uploads/${image}`}
                            alt="Safety report"
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                  {selectedReport.country_code && (
                    <div className="flex items-center space-x-2 pt-3 border-t">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Location: {selectedReport.country_code}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedCountry ? (
              <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedCountry.name}
                      </h3>
                      <p className="text-sm text-gray-600">Country overview</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCountry(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {selectedCountry.risk_score && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">
                        Overall Risk Level
                      </span>
                      <Badge
                        className={
                          getRiskLevel(selectedCountry.risk_score).color
                        }
                      >
                        {getRiskLevel(selectedCountry.risk_score).level}
                      </Badge>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <p>
                      Reports from this country: {getFilteredReports().length}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
                <div className="p-4 bg-orange-100 rounded-full w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Global Safety Intelligence
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Click on countries or safety pins to view detailed information
                  about travel safety conditions.
                </p>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-orange-700">
                    Data is crowdsourced from our community of travelers
                    worldwide.
                  </p>
                </div>
              </div>
            )}

            {/* Recent Reports */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedCountry
                      ? `Reports from ${selectedCountry.name}`
                      : "Recent Reports"}
                  </h3>
                  <p className="text-sm text-gray-600">Latest safety updates</p>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getFilteredReports()
                  .slice(0, 10)
                  .map((report) => (
                    <div
                      key={report.id}
                      className="bg-gray-50 p-3 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        setSelectedReport(report);

                        // Focus map on the selected report
                        if (map.current && report.geometry) {
                          try {
                            let coords;
                            if (typeof report.geometry === "string") {
                              const parsed = JSON.parse(report.geometry);
                              coords = parsed.coordinates || [
                                parsed.lng || parsed.longitude,
                                parsed.lat || parsed.latitude,
                              ];
                            } else if (report.geometry?.coordinates) {
                              coords = report.geometry.coordinates;
                            }

                            if (coords) {
                              map.current.flyTo({
                                center: coords,
                                zoom: 12,
                                duration: 1000,
                              });
                            }
                          } catch (error) {
                            console.error("Error focusing on report:", error);
                          }
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getRiskLevel(report.rating).color}>
                          {getRiskLevel(report.rating).level}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {report.tags && report.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {report.tags.slice(0, 2).map((tag, index) => (
                            <Badge
                              key={index}
                              className={getReportTypeColor(report.tags)}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                        {report.comment}
                      </p>

                      {report.country_code && (
                        <div className="flex items-center space-x-1 mt-2">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {report.country_code}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {getFilteredReports().length === 0 && (
                <div className="text-center py-8">
                  <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    {selectedCountry
                      ? `No reports found for ${selectedCountry.name}`
                      : filterRating
                      ? `No ${getRiskLevel(
                          filterRating
                        ).level.toLowerCase()} reports found`
                      : "No safety reports available"}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {selectedCountry || filterRating
                      ? "Try clearing filters or selecting a different area"
                      : "Be the first to contribute to community safety!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
