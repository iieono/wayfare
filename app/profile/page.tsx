"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import {
  User,
  MapPin,
  Calendar,
  Save,
  Camera,
  Heart,
  MessageCircle,
  Edit,
  Trash2,
  Eye,
  Settings,
  Activity,
  BarChart3,
  Star,
  Clock,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import type { UserType } from "@/types/database";

interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  user_type: UserType | null;
  created_at: string | null;
  last_active_at: string | null;
}

interface UserStats {
  stories_count: number;
  tips_count: number;
  reviews_count: number;
  checklists_count: number;
  total_likes_received: number;
}

interface Story {
  id: number;
  title: string;
  content: string;
  category: string | null;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string;
  places?: {
    name: string;
    country_code: string;
  };
}

interface Tip {
  id: number;
  content: string;
  travel_season: string | null;
  likes_count: number | null;
  created_at: string;
  places?: {
    name: string;
    country_code: string;
  };
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    stories_count: 0,
    tips_count: 0,
    reviews_count: 0,
    checklists_count: 0,
    total_likes_received: 0,
  });
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [userTips, setUserTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Form state for settings
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    user_type: "tourist" as UserType,
    email: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      fetchUserContent();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user!.id)
        .single();

      if (error) throw error;
      setProfile(data);

      // Initialize form data
      setFormData({
        username: data.username || "",
        bio: data.bio || "",
        user_type: data.user_type || "tourist",
        email: data.email || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const [storiesResult, tipsResult, reviewsResult, checklistsResult] =
        await Promise.all([
          supabase
            .from("stories")
            .select("id, likes_count", { count: "exact" })
            .eq("user_id", user!.id),
          supabase
            .from("tips")
            .select("id, likes_count", { count: "exact" })
            .eq("user_id", user!.id),
          supabase
            .from("place_reviews")
            .select("id", { count: "exact" })
            .eq("user_id", user!.id),
          supabase
            .from("user_checklists")
            .select("id", { count: "exact" })
            .eq("user_id", user!.id),
        ]);

      // Calculate total likes received
      const storyLikes =
        storiesResult.data?.reduce(
          (sum, story) => sum + (story.likes_count || 0),
          0
        ) || 0;
      const tipLikes =
        tipsResult.data?.reduce(
          (sum, tip) => sum + (tip.likes_count || 0),
          0
        ) || 0;

      setStats({
        stories_count: storiesResult.count || 0,
        tips_count: tipsResult.count || 0,
        reviews_count: reviewsResult.count || 0,
        checklists_count: checklistsResult.count || 0,
        total_likes_received: storyLikes + tipLikes,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUserContent = async () => {
    try {
      const [storiesResult, tipsResult] = await Promise.all([
        supabase
          .from("stories")
          .select(
            `
            id, title, content, category, likes_count, comments_count, created_at,
            places (name, country_code)
          `
          )
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("tips")
          .select(
            `
            id, content, travel_season, likes_count, created_at,
            places (name, country_code)
          `
          )
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      if (storiesResult.data) setUserStories(storiesResult.data);
      if (tipsResult.data) setUserTips(tipsResult.data);
    } catch (error) {
      console.error("Error fetching user content:", error);
    }
  };

  const handleSaveAll = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          username: formData.username,
          bio: formData.bio,
          user_type: formData.user_type,
          last_active_at: new Date().toISOString(),
        })
        .eq("id", user!.id);

      if (error) throw error;

      // Update local profile state
      setProfile({
        ...profile,
        username: formData.username,
        bio: formData.bio,
        user_type: formData.user_type,
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user!.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user!.id);

      if (updateError) throw updateError;

      setProfile((prev) =>
        prev ? { ...prev, avatar_url: data.publicUrl } : null
      );
      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    }
  };

  const handleDeleteStory = async (storyId: number) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);
      if (error) throw error;

      setUserStories((prev) => prev.filter((story) => story.id !== storyId));
      toast.success("Story deleted successfully!");
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Error deleting story:", error);
      toast.error("Failed to delete story");
    }
  };

  const handleDeleteTip = async (tipId: number) => {
    if (!confirm("Are you sure you want to delete this tip?")) return;

    try {
      const { error } = await supabase.from("tips").delete().eq("id", tipId);
      if (error) throw error;

      setUserTips((prev) => prev.filter((tip) => tip.id !== tipId));
      toast.success("Tip deleted successfully!");
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Error deleting tip:", error);
      toast.error("Failed to delete tip");
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      experience: "bg-blue-100 text-blue-800",
      tip: "bg-green-100 text-green-800",
      warning: "bg-red-100 text-red-800",
      culture: "bg-purple-100 text-purple-800",
      food: "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
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

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md bg-white shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-4">
              <User className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Profile Not Found</h3>
            <p className="text-gray-600 mb-4">
              Unable to load your profile information.
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-white/20">
                <AvatarImage
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt={profile.username || "User"}
                />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-2xl">
                  {(profile.username || profile.email)?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-white text-gray-700 p-2 rounded-full cursor-pointer hover:bg-gray-50 transition-colors shadow-lg"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold font-poppins mb-2">
                {profile.username || "Anonymous Traveler"}
              </h1>
              <p className="text-xl opacity-90 mb-3">{profile.email}</p>
              <div className="flex items-center space-x-4">
                {profile.user_type && (
                  <Badge className="bg-white/20 text-white border-white/30 capitalize">
                    {profile.user_type}
                  </Badge>
                )}
                {profile.created_at && (
                  <div className="flex items-center space-x-1 text-sm opacity-75">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg border-0 h-14 rounded-xl">
            <TabsTrigger
              value="overview"
              className="text-base font-medium data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="text-base font-medium data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="text-base font-medium data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {stats.stories_count}
                  </div>
                  <div className="text-sm text-gray-600">Stories</div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
                    <Star className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {stats.tips_count}
                  </div>
                  <div className="text-sm text-gray-600">Tips</div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {stats.reviews_count}
                  </div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <div className="p-3 bg-orange-100 rounded-lg w-fit mx-auto mb-3">
                    <Shield className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {stats.checklists_count}
                  </div>
                  <div className="text-sm text-gray-600">Checklists</div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-4 text-center">
                  <div className="p-3 bg-red-100 rounded-lg w-fit mx-auto mb-3">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {stats.total_likes_received}
                  </div>
                  <div className="text-sm text-gray-600">Likes</div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-gray-900">
                      Profile Information
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Username:</span>
                    <span className="font-semibold text-gray-900">
                      {profile.username || "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Email:</span>
                    <span className="font-semibold text-gray-900 truncate">
                      {profile.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">
                      Traveler Type:
                    </span>
                    <Badge className="bg-purple-100 text-purple-800 capitalize">
                      {profile.user_type || "Not set"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">
                      Member Since:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {profile.created_at
                        ? new Date(profile.created_at).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">
                      Last Active:
                    </span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">
                        {profile.last_active_at
                          ? new Date(
                              profile.last_active_at
                            ).toLocaleDateString()
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <CardTitle className="text-gray-900">About Me</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      {profile.bio ||
                        "This traveler hasn't shared their story yet. Add a bio in settings to tell other travelers about your experiences and what you love about exploring the world!"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Star className="h-5 w-5 text-orange-600" />
                  </div>
                  <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    asChild
                    className="h-auto p-4 text-left border-2 hover:border-blue-300 hover:bg-blue-50"
                  >
                    <a href="/my-stories">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <MessageCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            My Stories
                          </div>
                          <div className="text-xs text-gray-500">
                            Manage your stories
                          </div>
                        </div>
                      </div>
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="h-auto p-4 text-left border-2 hover:border-green-300 hover:bg-green-50"
                  >
                    <a href="/stories">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Edit className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            Share Story
                          </div>
                          <div className="text-xs text-gray-500">
                            Tell your experience
                          </div>
                        </div>
                      </div>
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="h-auto p-4 text-left border-2 hover:border-purple-300 hover:bg-purple-50"
                  >
                    <a href="/route-planner">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <MapPin className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            Plan Trip
                          </div>
                          <div className="text-xs text-gray-500">
                            Create travel checklist
                          </div>
                        </div>
                      </div>
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="h-auto p-4 text-left border-2 hover:border-red-300 hover:bg-red-50"
                  >
                    <a href="/safety-map">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Shield className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            Safety Map
                          </div>
                          <div className="text-xs text-gray-500">
                            Check destination safety
                          </div>
                        </div>
                      </div>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Stories */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-gray-900">
                        Recent Stories
                      </CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <a href="/my-stories">
                        <Eye className="h-4 w-4 mr-2" />
                        View All
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {userStories.length > 0 ? (
                    <div className="space-y-4">
                      {userStories.map((story) => (
                        <div
                          key={story.id}
                          className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-sm text-gray-900">
                                  {story.title}
                                </h4>
                                {story.category && (
                                  <Badge
                                    className={getCategoryColor(story.category)}
                                    variant="secondary"
                                  >
                                    {story.category}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                                {story.content.length > 100
                                  ? `${story.content.substring(0, 100)}...`
                                  : story.content}
                              </p>
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {new Date(
                                      story.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                {story.places && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{story.places.name}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Heart className="h-3 w-3" />
                                  <span>{story.likes_count || 0}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-8 w-8 p-0"
                              >
                                <a href={`/my-stories?edit=${story.id}`}>
                                  <Edit className="h-3 w-3" />
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStory(story.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-3">
                        <MessageCircle className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm mb-3">
                        No stories yet
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <a href="/stories">Share Your First Story</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Tips */}
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Star className="h-5 w-5 text-green-600" />
                      </div>
                      <CardTitle className="text-gray-900">
                        Recent Tips
                      </CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-green-200 text-green-600 hover:bg-green-50"
                    >
                      <a href="/stories?tab=tips">
                        <Eye className="h-4 w-4 mr-2" />
                        View All
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {userTips.length > 0 ? (
                    <div className="space-y-4">
                      {userTips.map((tip) => (
                        <div
                          key={tip.id}
                          className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                                {tip.content.length > 120
                                  ? `${tip.content.substring(0, 120)}...`
                                  : tip.content}
                              </p>
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {new Date(
                                      tip.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                {tip.travel_season &&
                                  tip.travel_season !== "any" && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs capitalize border-green-200 text-green-700"
                                    >
                                      {tip.travel_season}
                                    </Badge>
                                  )}
                                {tip.places && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{tip.places.name}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Heart className="h-3 w-3" />
                                  <span>{tip.likes_count || 0}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTip(tip.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-3">
                        <Star className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm mb-3">No tips yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-green-200 text-green-600 hover:bg-green-50"
                      >
                        <a href="/stories">Share Your First Tip</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900">
                      Profile Settings
                    </CardTitle>
                    <p className="text-gray-600 text-sm">
                      Update your profile information and preferences
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="text-sm font-medium text-gray-700"
                    >
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="Enter your username"
                      className="h-11"
                    />
                    <p className="text-xs text-gray-500">
                      This is how other travelers will see you
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="Enter your email"
                      disabled
                      className="h-11 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      Email cannot be changed here
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="userType"
                      className="text-sm font-medium text-gray-700"
                    >
                      Traveler Type
                    </Label>
                    <Select
                      value={formData.user_type}
                      onValueChange={(value: UserType) =>
                        setFormData({ ...formData, user_type: value })
                      }
                    >
                      <SelectTrigger className="py-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">
                          <div className="flex items-center space-x-4">
                            <div className="p-1 bg-blue-100 rounded">
                              <User className="h-3 w-3 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">Student</div>
                              <div className="text-xs text-gray-500">
                                Get student-specific travel advice
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="tourist">
                          <div className="flex items-center space-x-4">
                            <div className="p-1 bg-green-100 rounded">
                              <MapPin className="h-3 w-3 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">Tourist</div>
                              <div className="text-xs text-gray-500">
                                Discover amazing destinations
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="other">
                          <div className="flex items-center space-x-4">
                            <div className="p-1 bg-purple-100 rounded">
                              <Star className="h-3 w-3 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium">Other</div>
                              <div className="text-xs text-gray-500">
                                Customize your experience
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      This affects the content and advice you receive
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="bio"
                    className="text-sm font-medium text-gray-700"
                  >
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Tell other travelers about yourself, your travel experiences, and what you love about exploring the world..."
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-gray-500">
                    Share your travel story and help others connect with you
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Save className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Save Changes
                      </h3>
                      <p className="text-sm text-gray-500">
                        Update all your profile settings at once
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveAll}
                    disabled={saving}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save All Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Shield className="h-5 w-5 text-orange-600" />
                  </div>
                  <CardTitle className="text-gray-900">
                    Account Actions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Change Password
                      </div>
                      <div className="text-sm text-gray-500">
                        Update your account password
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Eye className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Download Data
                      </div>
                      <div className="text-sm text-gray-500">
                        Export all your stories, tips, and data
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-200 text-green-600 hover:bg-green-50"
                  >
                    Download
                  </Button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant="destructive"
                    onClick={signOut}
                    className="w-full h-12 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
