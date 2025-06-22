export interface MapboxPlace {
  id: string
  place_name: string
  center: [number, number] // [longitude, latitude]
  place_type: string[]
  properties: {
    category?: string
    address?: string
    tel?: string
    website?: string
  }
  context?: Array<{
    id: string
    text: string
    short_code?: string
  }>
}

export interface MapboxSearchResponse {
  features: MapboxPlace[]
}

export class MapboxPlacesService {
  private accessToken: string

  constructor() {
    this.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""
  }

  async searchPlaces(query: string, proximity?: [number, number]): Promise<MapboxPlace[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        access_token: this.accessToken,
        types: "poi,address",
        limit: "10",
      })

      if (proximity) {
        params.append("proximity", `${proximity[0]},${proximity[1]}`)
      }

      const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`)

      if (!response.ok) {
        throw new Error("Failed to search places")
      }

      const data: MapboxSearchResponse = await response.json()
      return data.features
    } catch (error) {
      console.error("Mapbox Places search error:", error)
      return []
    }
  }

  async getPlaceDetails(placeId: string): Promise<MapboxPlace | null> {
    try {
      const response = await fetch(
        `https://api.mapbox.com/search/geocode/v6/retrieve/${placeId}?access_token=${this.accessToken}`,
      )

      if (!response.ok) {
        throw new Error("Failed to get place details")
      }

      const data = await response.json()
      return data.features[0] || null
    } catch (error) {
      console.error("Mapbox Place details error:", error)
      return null
    }
  }

  async reverseGeocode(longitude: number, latitude: number): Promise<MapboxPlace[]> {
    try {
      const response = await fetch(
        `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=${this.accessToken}`,
      )

      if (!response.ok) {
        throw new Error("Failed to reverse geocode")
      }

      const data: MapboxSearchResponse = await response.json()
      return data.features
    } catch (error) {
      console.error("Mapbox reverse geocode error:", error)
      return []
    }
  }

  extractCountryCode(place: MapboxPlace): string | null {
    const countryContext = place.context?.find((ctx) => ctx.id.startsWith("country"))
    return countryContext?.short_code || null
  }

  extractCategory(place: MapboxPlace): string {
    if (place.place_type.includes("poi")) {
      return place.properties?.category || "attraction"
    }
    if (place.place_type.includes("address")) {
      return "address"
    }
    return "other"
  }
}

export const mapboxPlaces = new MapboxPlacesService()
