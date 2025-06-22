"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Star, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/client";
import { mapboxPlaces, type MapboxPlace } from "@/lib/mapbox-places";

interface DatabasePlace {
  id: number;
  name: string;
  country_code: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  address: string | null;
  is_user_added: boolean;
  average_rating?: number;
  review_count?: number;
}

interface CombinedPlace {
  id: string;
  name: string;
  address: string;
  category: string;
  coordinates: [number, number];
  source: "mapbox" | "database";
  databaseId?: number;
  mapboxId?: string;
  average_rating?: number;
  review_count?: number;
  is_user_added?: boolean;
}

interface EnhancedPlacesSearchProps {
  onPlaceSelect?: (place: CombinedPlace) => void;
  placeholder?: string;
  proximity?: [number, number];
}

export function EnhancedPlacesSearch({
  onPlaceSelect,
  placeholder = "Search places...",
  proximity,
}: EnhancedPlacesSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CombinedPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length > 2) {
      debounceRef.current = setTimeout(() => {
        searchPlaces();
      }, 300);
    } else {
      setResults([]);
      setShowResults(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const searchPlaces = async () => {
    setLoading(true);

    try {
      // Search both Mapbox and database simultaneously
      const [mapboxResults, databaseResults] = await Promise.all([
        mapboxPlaces.searchPlaces(query, proximity),
        searchDatabasePlaces(query),
      ]);

      const combinedResults = combineResults(mapboxResults, databaseResults);
      setResults(combinedResults);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
    }

    setLoading(false);
  };

  const searchDatabasePlaces = async (
    searchQuery: string
  ): Promise<DatabasePlace[]> => {
    const { data } = await supabase
      .from("places")
      .select(
        `
        id, name, country_code, latitude, longitude, category, address, is_user_added,
        place_reviews(rating)
      `
      )
      .ilike("name", `%${searchQuery}%`)
      .limit(5);

    if (!data) return [];

    return data.map((place: any) => ({
      ...place,
      average_rating:
        place.place_reviews.length > 0
          ? place.place_reviews.reduce(
              (sum: number, review: any) => sum + review.rating,
              0
            ) / place.place_reviews.length
          : 0,
      review_count: place.place_reviews.length,
    }));
  };

  const combineResults = (
    mapboxResults: MapboxPlace[],
    databaseResults: DatabasePlace[]
  ): CombinedPlace[] => {
    const combined: CombinedPlace[] = [];

    // Add database results first (prioritize user-added places)
    databaseResults.forEach((place) => {
      combined.push({
        id: `db-${place.id}`,
        name: place.name,
        address: place.address || `${place.country_code}`,
        category: place.category,
        coordinates: [place.longitude || 0, place.latitude || 0],
        source: "database",
        databaseId: place.id,
        average_rating: place.average_rating,
        review_count: place.review_count,
        is_user_added: place.is_user_added,
      });
    });

    // Add Mapbox results
    mapboxResults.forEach((place) => {
      // Check if this place is already in database results
      const existsInDb = databaseResults.some(
        (dbPlace) =>
          Math.abs((dbPlace.latitude || 0) - place.center[1]) < 0.001 &&
          Math.abs((dbPlace.longitude || 0) - place.center[0]) < 0.001
      );

      if (!existsInDb) {
        combined.push({
          id: `mb-${place.id}`,
          name: place.place_name.split(",")[0], // Get main name
          address: place.place_name,
          category: mapboxPlaces.extractCategory(place),
          coordinates: place.center,
          source: "mapbox",
          mapboxId: place.id,
        });
      }
    });

    return combined.slice(0, 8); // Limit results
  };

  const handlePlaceSelect = async (place: CombinedPlace) => {
    setQuery(place.name);
    setShowResults(false);

    // If it's a Mapbox place, add it to database
    if (place.source === "mapbox" && place.mapboxId) {
      await addMapboxPlaceToDatabase(place);
    }

    onPlaceSelect?.(place);
  };

  const addMapboxPlaceToDatabase = async (place: CombinedPlace) => {
    try {
      const { data } = await supabase
        .from("places")
        .insert({
          mapbox_place_id: place.mapboxId,
          name: place.name,
          address: place.address,
          latitude: place.coordinates[1],
          longitude: place.coordinates[0],
          category: place.category,
          country_code: mapboxPlaces.extractCountryCode({
            id: place.mapboxId!,
            place_name: place.address,
            center: place.coordinates,
            place_type: [],
          }),
          is_user_added: false,
        })
        .select()
        .single();

      if (data) {
        // Update the place with database ID
        place.databaseId = data.id;
        place.source = "database";
      }
    } catch (error) {
      console.error("Error adding place to database:", error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "hotel":
      case "lodging":
        return "🏨";
      case "restaurant":
      case "food":
        return "🍽️";
      case "attraction":
      case "tourism":
        return "🎯";
      case "transport":
        return "🚌";
      case "hospital":
        return "🏥";
      case "embassy":
        return "🏛️";
      default:
        return "📍";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      hotel: "bg-blue-100 text-blue-800",
      restaurant: "bg-green-100 text-green-800",
      attraction: "bg-purple-100 text-purple-800",
      embassy: "bg-red-100 text-red-800",
      hospital: "bg-pink-100 text-pink-800",
      transport: "bg-yellow-100 text-yellow-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 h-9 l border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors"
          onFocus={() => query.length > 2 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
      </div>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 glass-card max-h-96 overflow-y-auto">
          <CardContent className="p-2">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
                Searching places...
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => handlePlaceSelect(place)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">
                        {getCategoryIcon(place.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="font-medium truncate group-hover:text-blue-600 transition-colors">
                            {place.name}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge
                              className={getCategoryColor(place.category)}
                              variant="secondary"
                            >
                              {place.category}
                            </Badge>
                            {place.source === "database" &&
                              place.is_user_added && (
                                <Badge variant="outline" className="text-xs">
                                  Community
                                </Badge>
                              )}
                            {place.source === "mapbox" && (
                              <Badge variant="outline" className="text-xs">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Mapbox
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {place.address}
                        </div>
                        {place.average_rating && place.review_count && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">
                              {place.average_rating.toFixed(1)} (
                              {place.review_count} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <div className="text-center text-gray-500 mb-3">
                  No places found
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add "{query}" as new place
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
