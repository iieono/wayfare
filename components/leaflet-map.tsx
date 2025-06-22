"use client"

import { useEffect, useRef } from "react"

interface LeafletMapProps {
  reports: any[]
  onReportClick: (report: any) => void
  filterRating: number | null
}

export function LeafletMap({ reports, onReportClick, filterRating }: LeafletMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)

  useEffect(() => {
    loadLeafletScript()
  }, [])

  const loadLeafletScript = () => {
    if (typeof window !== "undefined" && !window.L) {
      // Load Leaflet CSS
      const link = document.createElement("link")
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      link.rel = "stylesheet"
      document.head.appendChild(link)

      // Load Leaflet JS
      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.async = true
      script.onload = initializeMap
      document.head.appendChild(script)
    } else if (window.L) {
      initializeMap()
    }
  }

  const initializeMap = () => {
    if (mapContainer.current && !map.current) {
      map.current = window.L.map(mapContainer.current).setView([20, 0], 2)

      // Add OpenStreetMap tiles (completely free)
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map.current)

      addMarkersToMap()
    }
  }

  const addMarkersToMap = () => {
    if (!map.current) return

    const filteredReports = filterRating ? reports.filter((report) => report.rating === filterRating) : reports

    filteredReports.forEach((report) => {
      try {
        // Generate demo coordinates
        const lat = (Math.random() - 0.5) * 180
        const lng = (Math.random() - 0.5) * 360

        const color = getRiskColor(report.rating)

        const marker = window.L.circleMarker([lat, lng], {
          color: "#fff",
          weight: 2,
          fillColor: color,
          fillOpacity: 0.8,
          radius: 8,
        }).addTo(map.current)

        marker.on("click", () => {
          onReportClick(report)
        })

        // Add danger zone for high risk
        if (report.rating <= 2) {
          window.L.circle([lat, lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.2,
            radius: 5000, // 5km radius
          }).addTo(map.current)
        }
      } catch (error) {
        console.error("Error adding marker:", error)
      }
    })
  }

  const getRiskColor = (rating: number) => {
    if (rating >= 4) return "#10B981" // Green
    if (rating === 3) return "#F59E0B" // Yellow
    return "#EF4444" // Red
  }

  useEffect(() => {
    if (map.current) {
      // Clear existing markers
      map.current.eachLayer((layer: any) => {
        if (layer instanceof window.L.CircleMarker || layer instanceof window.L.Circle) {
          map.current.removeLayer(layer)
        }
      })
      addMarkersToMap()
    }
  }, [reports, filterRating])

  return <div ref={mapContainer} className="w-full h-full" />
}
