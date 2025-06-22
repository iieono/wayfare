"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Shield,
  Users,
  CheckSquare,
  AlertTriangle,
  Map,
  ArrowRight,
  Globe,
  Compass,
  Plane,
  Star,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react";
import { supabase } from "@/lib/client";

interface Country {
  code: string;
  name: string;
  flag_url: string | null;
  risk_score: number | null;
}

interface Stats {
  totalUsers: number;
  totalCountries: number;
  totalReports: number;
  averageRating: number;
}

export default function HomePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [fromCountry, setFromCountry] = useState("");
  const [toCountry, setToCountry] = useState("");
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCountries: 0,
    totalReports: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchCountries();
    fetchStats();
    // Load from localStorage
    const saved = localStorage.getItem("wayfare-route");
    if (saved) {
      const { from, to } = JSON.parse(saved);
      setFromCountry(from || "");
      setToCountry(to || "");
    }
  }, []);

  useEffect(() => {
    // Save to localStorage
    if (fromCountry || toCountry) {
      localStorage.setItem(
        "wayfare-route",
        JSON.stringify({
          from: fromCountry,
          to: toCountry,
        })
      );
    }
  }, [fromCountry, toCountry]);

  const fetchCountries = async () => {
    const { data } = await supabase
      .from("countries")
      .select("code, name, flag_url, risk_score")
      .order("name");

    if (data) setCountries(data);
  };

  const fetchStats = async () => {
    try {
      // Get total users count
      const { count: usersCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      // Get total countries count
      const { count: countriesCount } = await supabase
        .from("countries")
        .select("*", { count: "exact", head: true });

      // Get total safety reports count
      const { count: reportsCount } = await supabase
        .from("safety_reports")
        .select("*", { count: "exact", head: true });

      // Get average rating from safety reports
      const { data: ratingData } = await supabase
        .from("safety_reports")
        .select("rating");

      let averageRating = 0;
      if (ratingData && ratingData.length > 0) {
        const totalRating = ratingData.reduce(
          (sum, report) => sum + (report.rating || 0),
          0
        );
        averageRating = totalRating / ratingData.length;
      }

      setStats({
        totalUsers: usersCount || 0,
        totalCountries: countriesCount || 0,
        totalReports: reportsCount || 0,
        averageRating: Math.round(averageRating * 10) / 10,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const getRiskColor = (score: number | null) => {
    if (!score) return "bg-gray-100";
    if (score === 1) return "bg-green-100 text-green-800";
    if (score === 2) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <div className="relative container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center text-white space-y-8">
            {/* Main Heading */}
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                <Award className="h-4 w-4" />
                <span>
                  Trusted by {stats.totalUsers.toLocaleString()}+ travelers
                  worldwide
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold font-poppins leading-tight">
                Travel Safely with{" "}
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Wayfare
                </span>
              </h1>

              <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                Your AI-powered travel companion for crossing borders smoothly.
                Get personalized checklists, real-time safety insights, and
                community-driven travel wisdom.
              </p>
            </div>

            {/* Route Planning Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-center mb-6">
                <div className="p-3 bg-white/20 rounded-full mr-3">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold">Plan Your Journey</h3>
              </div>

              <div className="grid md:grid-cols-5 gap-4 items-  ">
                <div className="md:col-span-2 space-y-2 flex flex-col items-start">
                  <label className="text-sm font-medium text-white/80">
                    From
                  </label>
                  <Select value={fromCountry} onValueChange={setFromCountry}>
                    <SelectTrigger className="h-14 w-full rounded-xl bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 hover:bg-white/30 transition-all">
                      <SelectValue placeholder="Select origin country" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-lg border-white/20 max-h-80">
                      {countries.map((country) => (
                        <SelectItem
                          key={country.code}
                          value={country.code}
                          className="py-3"
                        >
                          <div className="flex items-center space-x-3 w-full">
                            {country.flag_url && (
                              <img
                                src={country.flag_url || "/placeholder.svg"}
                                alt=""
                                className="w-6 h-4 object-cover rounded"
                              />
                            )}
                            <span className="flex-1">{country.name}</span>
                            {country.risk_score && (
                              <Badge
                                className={`text-xs ${getRiskColor(
                                  country.risk_score
                                )}`}
                              >
                                Risk {country.risk_score}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center items-end">
                  <div className="bg-white/20 p-3 h-min rounded-full backdrop-blur-sm">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2 flex flex-col items-start">
                  <label className="text-sm font-medium text-white/80">
                    To
                  </label>
                  <Select value={toCountry} onValueChange={setToCountry}>
                    <SelectTrigger className="h-14 rounded-xl w-full bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 hover:bg-white/30 transition-all">
                      <SelectValue placeholder="Select destination country" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-lg border-white/20 max-h-80">
                      {countries.map((country) => (
                        <SelectItem
                          key={country.code}
                          value={country.code}
                          className="py-3"
                        >
                          <div className="flex items-center space-x-3 w-full">
                            {country.flag_url && (
                              <img
                                src={country.flag_url || "/placeholder.svg"}
                                alt=""
                                className="w-6 h-4 object-cover rounded"
                              />
                            )}
                            <span className="flex-1">{country.name}</span>
                            {country.risk_score && (
                              <Badge
                                className={`text-xs ${getRiskColor(
                                  country.risk_score
                                )}`}
                              >
                                Risk {country.risk_score}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {fromCountry && toCountry && (
                <div className="mt-8 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      asChild
                      className="flex-1 h-14 rounded-xl bg-white text-gray-900 hover:bg-gray-100 text-lg font-semibold shadow-lg"
                    >
                      <Link href="/route-planner">
                        <CheckSquare className="mr-2 h-5 w-5" />
                        Get Travel Checklist
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="flex-1 h-14 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 text-lg font-semibold"
                    >
                      <Link href="/safety-map">
                        <Shield className="mr-2 h-5 w-5" />
                        View Safety Map
                      </Link>
                    </Button>
                  </div>

                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="flex items-center justify-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">
                        Route:{" "}
                        {countries.find((c) => c.code === fromCountry)?.name} →{" "}
                        {countries.find((c) => c.code === toCountry)?.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalUsers.toLocaleString()}+
              </div>
              <div className="text-gray-600">Active Travelers</div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalCountries}
              </div>
              <div className="text-gray-600">Countries Covered</div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalReports.toLocaleString()}+
              </div>
              <div className="text-gray-600">Safety Reports</div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-orange-100 rounded-full w-fit mx-auto mb-4">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.averageRating || "4.9"}/5
              </div>
              <div className="text-gray-600">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 text-sm font-medium text-blue-700 mb-4">
              <TrendingUp className="h-4 w-4" />
              <span>Powered by AI & Community</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-poppins mb-4 text-gray-900">
              Everything You Need to Travel Smart
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and insights to make your international travel
              seamless and secure
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Plane}
              title="Smart Route Planning"
              description="AI-powered route optimization with real-time border conditions and travel requirements"
              href="/route-planner"
              gradient="from-blue-500 to-cyan-500"
              badge="AI-Powered"
            />

            <FeatureCard
              icon={CheckSquare}
              title="Personalized Checklists"
              description="Custom travel checklists based on your profile, destination, and current regulations"
              href="/route-planner"
              gradient="from-green-500 to-emerald-500"
              badge="Personalized"
            />

            <FeatureCard
              icon={Shield}
              title="Live Safety Intelligence"
              description="Real-time safety reports, risk assessments, and community-verified danger zones"
              href="/safety-map"
              gradient="from-red-500 to-pink-500"
              badge="Real-time"
            />

            <FeatureCard
              icon={AlertTriangle}
              title="Scam & Fraud Alerts"
              description="Stay ahead of the latest scams with location-specific warnings and prevention tips"
              href="/safety-map"
              gradient="from-orange-500 to-yellow-500"
              badge="Community"
            />

            <FeatureCard
              icon={Users}
              title="Traveler Community"
              description="Connect with experienced travelers, share stories, and get insider tips"
              href="/stories"
              gradient="from-purple-500 to-indigo-500"
              badge="Social"
            />

            <FeatureCard
              icon={Map}
              title="Place Discovery"
              description="Discover hidden gems, read authentic reviews, and find trusted accommodations"
              href="/places"
              gradient="from-teal-500 to-blue-500"
              badge="Discover"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto text-white space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                <span>Join thousands of smart travelers</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-bold font-poppins">
                Ready to Transform Your{" "}
                <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Travel Experience?
                </span>
              </h2>

              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Join thousands of smart travelers who rely on Wayfare for safe,
                informed, and memorable journeys.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-white text-gray-900 hover:bg-gray-100 h-16 px-8 rounded-xl font-semibold text-lg shadow-2xl"
              >
                <Link href="/auth/signup">
                  <Globe className="mr-2 h-6 w-6" />
                  Start Planning Now
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 h-16 px-8 rounded-xl font-semibold text-lg"
              >
                <Link href="/safety-map">
                  <Map className="mr-2 h-6 w-6" />
                  Explore Safety Map
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
  gradient,
  badge,
}: {
  icon: any;
  title: string;
  description: string;
  href: string;
  gradient: string;
  badge?: string;
}) {
  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
          >
            <Icon className="h-7 w-7 text-white" />
          </div>
          {badge && (
            <Badge className="bg-gray-100 text-gray-700 text-xs font-medium">
              {badge}
            </Badge>
          )}
        </div>

        <h3 className="text-xl font-semibold mb-3 font-poppins text-gray-900">
          {title}
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>

        <Button
          variant="ghost"
          asChild
          className="p-0 h-auto text-blue-600 hover:text-purple-600 font-semibold group/btn"
        >
          <Link href={href} className="flex items-center">
            Explore
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
