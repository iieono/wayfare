"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LeafletMap } from "@/components/leaflet-map";
import { Shield, Users, Filter } from "lucide-react";

interface SafetyReport {
  id: number;
  rating: number;
  tags: string[];
  comment: string;
  images: string[];
  created_at: string;
  geometry: any;
}

export default function LeafletSafetyMapPage() {
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(
    null
  );
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    fetchSafetyReports();
  }, []);

  const fetchSafetyReports = async () => {
    // Create some demo data since we don't have real data
    const demoReports: SafetyReport[] = [
      {
        id: 1,
        rating: 1,
        tags: ["theft", "scam"],
        comment:
          "High crime area, avoid walking alone at night. Multiple reports of pickpocketing.",
        images: [],
        created_at: new Date().toISOString(),
        geometry: null,
      },
      {
        id: 2,
        rating: 3,
        tags: ["traffic", "caution"],
        comment:
          "Heavy traffic area, be careful when crossing streets. Generally safe during day.",
        images: [],
        created_at: new Date().toISOString(),
        geometry: null,
      },
      {
        id: 3,
        rating: 5,
        tags: ["safe", "tourist-friendly"],
        comment:
          "Very safe area with good police presence. Tourist-friendly with helpful locals.",
        images: [],
        created_at: new Date().toISOString(),
        geometry: null,
      },
      {
        id: 4,
        rating: 2,
        tags: ["political", "unrest"],
        comment:
          "Recent political demonstrations. Avoid large gatherings and stay updated on local news.",
        images: [],
        created_at: new Date().toISOString(),
        geometry: null,
      },
    ];

    setSafetyReports(demoReports);
  };

  const getRiskLevel = (rating: number) => {
    if (rating >= 4)
      return { level: "Safe", color: "bg-green-100 text-green-800" };
    if (rating === 3)
      return { level: "Caution", color: "bg-yellow-100 text-yellow-800" };
    return { level: "Danger", color: "bg-red-100 text-red-800" };
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white py-12">
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
        {/* Map */}
        <div className="flex-1 relative">
          <LeafletMap
            reports={safetyReports}
            onReportClick={setSelectedReport}
            filterRating={filterRating}
          />

          {/* Map Controls */}
          <div className="absolute top-4 left-4 space-y-2">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Filter className="h-4 w-4" />
                  <span className="font-medium">Filter by Risk</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={filterRating === null ? "default" : "outline"}
                    onClick={() => setFilterRating(null)}
                    className="text-xs"
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={filterRating === 1 ? "default" : "outline"}
                    onClick={() => setFilterRating(1)}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white"
                  >
                    High Risk
                  </Button>
                  <Button
                    size="sm"
                    variant={filterRating === 3 ? "default" : "outline"}
                    onClick={() => setFilterRating(3)}
                    className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Medium
                  </Button>
                  <Button
                    size="sm"
                    variant={filterRating === 5 ? "default" : "outline"}
                    onClick={() => setFilterRating(5)}
                    className="text-xs bg-green-500 hover:bg-green-600 text-white"
                  >
                    Safe
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Risk Levels
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>High Risk - Avoid if possible</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Medium Risk - Exercise caution</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Low Risk - Generally safe</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-white border-l overflow-y-auto">
          {selectedReport ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Safety Report</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge className={getRiskLevel(selectedReport.rating).color}>
                    {getRiskLevel(selectedReport.rating).level}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedReport.created_at).toLocaleDateString()}
                  </span>
                </div>

                {selectedReport.tags && selectedReport.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedReport.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-gray-700">{selectedReport.comment}</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Recent Reports
              </h3>

              <div className="space-y-3">
                {safetyReports.map((report) => (
                  <Card
                    key={report.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedReport(report)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getRiskLevel(report.rating).color}>
                          {getRiskLevel(report.rating).level}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {report.comment}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
