"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalizedChecklist } from "@/components/personalized-checklist";
import { AITravelAssistant } from "@/components/ai-travel-assistant";
import { supabase } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import { useChat } from "ai/react";
import {
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  FileText,
  Shield,
  Plane,
  ArrowLeft,
  Star,
  Calendar,
  Bot,
} from "lucide-react";
import Link from "next/link";

interface Checklist {
  id: number;
  country: number;
  user_type: "student" | "tourist" | "other";
  required_items: {
    [category: string]: string[];
  };
  restricted_items?: {
    [category: string]: string[];
  };
  preparation_steps?: {
    [step: string]: string;
  };
  official_links?: {
    [title: string]: string;
  };
  is_template: boolean;
}

interface Route {
  id: number;
  from_country_code: string;
  to_country_code: string;
  description?: string;
  risk_score?: number;
  updated_at?: string;
}

interface Country {
  id: number;
  code: string;
  name: string;
  flag_url?: string;
  region?: string;
  official_languages?: string[];
  risk_score?: number;
}

interface SafetyReport {
  id: number;
  rating: number;
  comment: string;
  tags: string[];
  created_at: string;
}

export default function RoutePlannerPage() {
  const { user } = useAuth();
  const [route, setRoute] = useState<{ from: string; to: string } | null>(null);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [routeData, setRouteData] = useState<Route | null>(null);
  const [destinationCountry, setDestinationCountry] = useState<Country | null>(
    null
  );
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasInitializedChat, setHasInitializedChat] = useState(false);

  // Move chat state to parent component to persist across tab switches
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
  } = useChat({
    api: "/api/chat",
    initialMessages: [],
  });

  useEffect(() => {
    loadRouteData();
  }, []);

  // Initialize chat when route data is loaded
  useEffect(() => {
    if (!hasInitializedChat && route && destinationCountry) {
      const welcomeMessage = `Hi! 👋 I'm your AI travel assistant for your trip from ${
        route.from
      } to ${destinationCountry.name}.

${
  routeData?.risk_score
    ? `🛡️ Safety Level: ${
        routeData.risk_score === 1
          ? "Safe"
          : routeData.risk_score === 2
          ? "Caution"
          : "High Risk"
      }`
    : ""
}
${checklist?.required_items ? `📋 Travel checklist ready` : ""}
${
  safetyReports.length > 0
    ? `⚠️ ${safetyReports.length} safety reports available`
    : ""
}

I can help with documents, packing, safety tips, and local customs. What would you like to know? 🤔`;

      append({
        role: "assistant",
        content: welcomeMessage,
      });

      setHasInitializedChat(true);
    }
  }, [
    route,
    destinationCountry,
    hasInitializedChat,
    append,
    routeData,
    checklist,
    safetyReports,
  ]);

  const loadRouteData = async () => {
    try {
      // Load route from localStorage
      const saved = localStorage.getItem("wayfare-route");
      if (saved) {
        const routeData = JSON.parse(saved);
        if (routeData.from && routeData.to) {
          setRoute(routeData);
          await fetchRouteData(routeData.from, routeData.to);
        }
      }
    } catch (error) {
      console.error("Error loading route data:", error);
    }
    setLoading(false);
  };

  const fetchRouteData = async (from: string, to: string) => {
    try {
      // Fetch destination country information
      const { data: countryData, error: countryError } = await supabase
        .from("countries")
        .select("*")
        .eq("code", to)
        .single();

      if (countryError) {
        console.error("Error fetching country:", countryError);
        return;
      }

      if (countryData) {
        setDestinationCountry(countryData);

        // Fetch checklist for this country
        const { data: checklistData, error: checklistError } = await supabase
          .from("checklists")
          .select("*")
          .eq("country", countryData.id)
          .eq("user_type", "tourist")
          .eq("is_template", true)
          .single();

        if (checklistError) {
          console.error("Error fetching checklist:", checklistError);
        } else if (checklistData) {
          setChecklist(checklistData);
        }
      }

      // Fetch route information
      const { data: routeData, error: routeError } = await supabase
        .from("routes")
        .select("*")
        .eq("from_country_code", from)
        .eq("to_country_code", to)
        .single();

      if (routeError) {
        console.error("Error fetching route:", routeError);
      } else if (routeData) {
        setRouteData(routeData);
      }

      // Fetch safety reports for destination
      const { data: safetyData } = await supabase
        .from("safety_reports")
        .select("id, rating, comment, tags, created_at")
        .eq("country_code", to)
        .order("created_at", { ascending: false })
        .limit(5);

      if (safetyData) {
        setSafetyReports(safetyData);
      }
    } catch (error) {
      console.error("Error in fetchRouteData:", error);
    }
  };

  const createSystemContext = () => {
    let context = `You are Wayfare AI, a helpful travel assistant specializing in international travel planning and safety.`;

    if (route && destinationCountry) {
      context += ` The user is planning to travel from ${route.from} to ${route.to} (${destinationCountry.name}).`;

      if (routeData?.risk_score) {
        const riskLevel =
          routeData.risk_score === 1
            ? "Safe"
            : routeData.risk_score === 2
            ? "Caution"
            : "Danger";
        context += ` The route has a ${riskLevel} risk level.`;
      }

      if (checklist) {
        context += ` You have access to the travel checklist with required items, restricted items, and preparation steps for this destination.`;
      }

      if (safetyReports.length > 0) {
        context += ` There are ${safetyReports.length} recent safety reports available.`;
      }
    }

    context += ` Provide helpful, accurate travel advice. Keep responses conversational and concise. Always prioritize safety.`;

    return context;
  };

  const getRiskColor = (score: number) => {
    if (score === 1) return "bg-green-100 text-green-800 border-green-200";
    if (score === 2) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getRiskLevel = (score: number) => {
    if (score === 1) return "Safe";
    if (score === 2) return "Caution";
    return "Danger";
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your travel plan...</p>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-6">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
                Route Planner
              </h1>
              <p className="text-xl opacity-90">
                Plan your journey with detailed checklists and safety insights
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 flex items-center justify-center">
          <Card className="max-w-md bg-white shadow-lg border-0">
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Plane className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Route Selected</h3>
              <p className="text-gray-600 mb-4">
                Please select your origin and destination countries from the
                home page to get started.
              </p>
              <Button asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Select Route
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-6">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              Your Travel Plan
            </h1>
            <div className="flex items-center space-x-4 text-lg">
              <span className="opacity-90">From</span>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
              >
                {route.from}
              </Badge>
              <span className="opacity-90">to</span>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-white/30"
              >
                {route.to}
              </Badge>
              {routeData?.risk_score && (
                <Badge className={getRiskColor(routeData.risk_score)}>
                  {getRiskLevel(routeData.risk_score)}
                </Badge>
              )}
            </div>
            {destinationCountry && (
              <p className="text-lg opacity-90 mt-2">
                Destination: {destinationCountry.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-4">
        <Tabs defaultValue="ai-assistant" className="space-y-2">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg border-0 h-14 rounded-xl">
            <TabsTrigger
              value="ai-assistant"
              className="text-base font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger
              value="checklist"
              className="text-base font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              My Checklist
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="text-base font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger
              value="safety"
              className="text-base font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              Safety
            </TabsTrigger>
          </TabsList>

          {/* AI ASSISTANT TAB */}
          <TabsContent value="ai-assistant" className="space-y-6">
            <AITravelAssistant
              route={route}
              destinationCountry={destinationCountry}
              checklist={checklist}
              routeData={routeData}
              safetyReports={safetyReports}
              messages={messages}
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              append={append}
              createSystemContext={createSystemContext}
            />
          </TabsContent>

          {/* CHECKLIST TAB */}
          <TabsContent value="checklist" className="space-y-6">
            {user && destinationCountry ? (
              <PersonalizedChecklist
                countryId={destinationCountry.id}
                userType="other"
              />
            ) : (
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-8 text-center">
                  <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Sign In for Personalized Checklist
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create an account to get a personalized, trackable checklist
                    for your journey.
                  </p>
                  <Button asChild>
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    asChild
                    className="h-auto p-4 text-left hover:bg-gray-50"
                  >
                    <Link href="/safety-map">
                      <div>
                        <div className="font-medium">View Safety Map</div>
                        <div className="text-xs text-gray-500">
                          Check destination safety
                        </div>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="h-auto p-4 text-left hover:bg-gray-50"
                  >
                    <Link href="/stories">
                      <div>
                        <div className="font-medium">Read Stories</div>
                        <div className="text-xs text-gray-500">
                          Learn from other travelers
                        </div>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="h-auto p-4 text-left hover:bg-gray-50"
                  >
                    <Link href="/places">
                      <div>
                        <div className="font-medium">Explore Places</div>
                        <div className="text-xs text-gray-500">
                          Find great destinations
                        </div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DOCUMENTS TAB */}
          <TabsContent value="documents" className="space-y-6">
            {/* Required Items Checklist */}
            {checklist?.required_items && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <CardTitle className="text-gray-900">
                      Required Items Checklist
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(checklist.required_items).map(
                      ([category, items]: [string, any]) => {
                        const itemList = Array.isArray(items) ? items : [items];
                        return (
                          <div key={category} className="space-y-3">
                            <h4 className="font-semibold text-gray-900 capitalize border-b border-gray-200 pb-2">
                              {category}
                            </h4>
                            <ul className="space-y-2">
                              {itemList.map((item: string, index: number) => (
                                <li
                                  key={index}
                                  className="flex items-start space-x-2"
                                >
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                  <span className="text-gray-700 text-sm">
                                    {item}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Restricted Items */}
            {checklist?.restricted_items && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <CardTitle className="text-gray-900">
                      Restricted Items
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(checklist.restricted_items).map(
                      ([category, items]: [string, any]) => {
                        const itemList = Array.isArray(items) ? items : [items];
                        return (
                          <div key={category} className="space-y-3">
                            <h4 className="font-semibold text-gray-900 capitalize border-b border-red-200 pb-2">
                              {category}
                            </h4>
                            <ul className="space-y-2">
                              {itemList.map((item: string, index: number) => (
                                <li
                                  key={index}
                                  className="flex items-start space-x-2"
                                >
                                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                  <span className="text-gray-700 text-sm">
                                    {item}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Document Preparation Steps */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-gray-900">
                    Document Preparation Steps
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {checklist?.preparation_steps ? (
                  <div className="space-y-4">
                    {Object.entries(checklist.preparation_steps).map(
                      ([step, details]: [string, any], index) => (
                        <div
                          key={step}
                          className="flex space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2 capitalize">
                              {step}
                            </h4>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {details}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-3">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">
                      No preparation steps available for this route.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Official Links */}
            {checklist?.official_links && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ExternalLink className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-gray-900">
                      Official Resources
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(checklist.official_links).map(
                      ([title, url]: [string, any]) => (
                        <Button
                          key={title}
                          variant="outline"
                          asChild
                          className="justify-start h-auto p-4 text-left hover:bg-gray-50"
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="flex-1">
                              <div className="font-medium capitalize">
                                {title}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {url}
                              </div>
                            </div>
                            <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
                          </a>
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* SAFETY TAB */}
          <TabsContent value="safety" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Route Risk Assessment */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <CardTitle className="text-gray-900">
                      Route Risk Assessment
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {routeData?.risk_score ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Overall Risk Level</span>
                        <Badge className={getRiskColor(routeData.risk_score)}>
                          {getRiskLevel(routeData.risk_score)}
                        </Badge>
                      </div>
                      {routeData.description && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-gray-600 text-sm">
                            {routeData.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-3">
                        <Shield className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">
                        Risk assessment not available for this route.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Safety Reports */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    <CardTitle className="text-gray-900">
                      Recent Safety Reports
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {safetyReports.length > 0 ? (
                    <div className="space-y-3">
                      {safetyReports.map((report) => (
                        <div
                          key={report.id}
                          className="border-l-4 border-blue-200 pl-4 py-2 bg-gray-50 rounded-r-lg"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= report.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              {report.tags?.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(
                                  report.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">
                            {report.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-3">
                        <AlertTriangle className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">
                        No recent safety reports for this destination.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
