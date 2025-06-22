"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import { EnhancedPlacesSearch } from "@/components/enhanced-places-search";
import {
  Heart,
  Share,
  MapPin,
  Calendar,
  Plus,
  Save,
  X,
  BookOpen,
  Star,
  Camera,
  Globe,
  Filter,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { UserType } from "@/types/database";

interface Story {
  id: number;
  user_id: string;
  place_id: number | null;
  from_country_code: string | null;
  to_country_code: string | null;
  user_type: UserType | null;
  title: string;
  content: string;
  images: string[] | null;
  category: string | null;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string;
  updated_at: string | null;
  places?: {
    name: string;
    country_code: string;
  };
  users?: {
    username: string | null;
    avatar_url: string | null;
  };
}

interface Tip {
  id: number;
  user_id: string;
  place_id: number | null;
  from_country_code: string | null;
  to_country_code: string | null;
  user_type: UserType | null;
  content: string;
  images: string[] | null;
  travel_season: string | null;
  likes_count: number | null;
  created_at: string;
  places?: {
    name: string;
    country_code: string;
  };
  users?: {
    username: string | null;
    avatar_url: string | null;
  };
}

interface Country {
  code: string;
  name: string;
  region: string;
}

interface StoryForm {
  title: string;
  content: string;
  category: string;
  place_id: number | null;
  from_country_code: string;
  to_country_code: string;
  images: File[];
}

interface TipForm {
  content: string;
  place_id: number | null;
  from_country_code: string;
  to_country_code: string;
  travel_season: string;
  images: File[];
}

export default function StoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [allTips, setAllTips] = useState<Tip[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stories");
  const [showStoryDialog, setShowStoryDialog] = useState(false);
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [likedStories, setLikedStories] = useState<Set<number>>(new Set());
  const [likedTips, setLikedTips] = useState<Set<number>>(new Set());
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedUserType, setSelectedUserType] = useState<string>("all");
  const [uploadingImages, setUploadingImages] = useState(false);

  const [storyForm, setStoryForm] = useState<StoryForm>({
    title: "",
    content: "",
    category: "experience",
    place_id: null,
    from_country_code: "",
    to_country_code: "",
    images: [],
  });

  const [tipForm, setTipForm] = useState<TipForm>({
    content: "",
    place_id: null,
    from_country_code: "",
    to_country_code: "",
    travel_season: "any",
    images: [],
  });

  useEffect(() => {
    // Get target country from localStorage (from homepage route selection)
    const savedRoute = localStorage.getItem("wayfare-route");
    if (savedRoute) {
      try {
        const route = JSON.parse(savedRoute);
        if (route.to) {
          setSelectedCountry(route.to);
        }
      } catch (error) {
        console.error("Error parsing saved route:", error);
      }
    }

    fetchCountries();
  }, []);

  useEffect(() => {
    fetchStories();
    fetchTips();
    if (user) {
      fetchUserLikes();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [
    allStories,
    allTips,
    selectedCountry,
    selectedCategory,
    selectedUserType,
  ]);

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from("countries")
        .select("code, name, region")
        .order("name");

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from("stories")
        .select(
          `
          id,
          user_id,
          place_id,
          from_country_code,
          to_country_code,
          user_type,
          title,
          content,
          images,
          category,
          likes_count,
          comments_count,
          created_at,
          updated_at,
          places (
            name,
            country_code
          ),
          users (
            username,
            avatar_url
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setAllStories(data || []);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("Failed to load stories");
    }
    setLoading(false);
  };

  const fetchTips = async () => {
    try {
      const { data, error } = await supabase
        .from("tips")
        .select(
          `
          id,
          user_id,
          place_id,
          from_country_code,
          to_country_code,
          user_type,
          content,
          images,
          travel_season,
          likes_count,
          created_at,
          places (
            name,
            country_code
          ),
          users (
            username,
            avatar_url
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setAllTips(data || []);
    } catch (error) {
      console.error("Error fetching tips:", error);
      toast.error("Failed to load tips");
    }
  };

  const applyFilters = () => {
    let filteredStories = [...allStories];
    let filteredTips = [...allTips];

    // Country filter
    if (selectedCountry !== "all") {
      filteredStories = filteredStories.filter(
        (story) =>
          story.from_country_code === selectedCountry ||
          story.to_country_code === selectedCountry ||
          story.places?.country_code === selectedCountry
      );
      filteredTips = filteredTips.filter(
        (tip) =>
          tip.from_country_code === selectedCountry ||
          tip.to_country_code === selectedCountry ||
          tip.places?.country_code === selectedCountry
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filteredStories = filteredStories.filter(
        (story) => story.category === selectedCategory
      );
    }

    // User type filter
    if (selectedUserType !== "all") {
      filteredStories = filteredStories.filter(
        (story) => story.user_type === selectedUserType
      );
      filteredTips = filteredTips.filter(
        (tip) => tip.user_type === selectedUserType
      );
    }

    setStories(filteredStories);
    setTips(filteredTips);
  };

  const fetchUserLikes = async () => {
    if (!user) return;

    try {
      const [storyLikes, tipLikes] = await Promise.all([
        supabase.from("story_likes").select("story_id").eq("user_id", user.id),
        supabase.from("tip_likes").select("tip_id").eq("user_id", user.id),
      ]);

      if (storyLikes.data) {
        setLikedStories(new Set(storyLikes.data.map((like) => like.story_id)));
      }
      if (tipLikes.data) {
        setLikedTips(new Set(tipLikes.data.map((like) => like.tip_id)));
      }
    } catch (error) {
      console.error("Error fetching user likes:", error);
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${
          user!.id
        }-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `stories/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("uploads")
          .getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    }

    setUploadingImages(false);
    return uploadedUrls;
  };

  const handleCreateStory = async () => {
    if (!user) {
      toast.error("Please sign in to share your story");
      return;
    }

    if (!storyForm.title.trim() || !storyForm.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      // Upload images first
      const imageUrls = await uploadImages(storyForm.images);

      const { error } = await supabase.from("stories").insert({
        user_id: user.id,
        title: storyForm.title,
        content: storyForm.content,
        category: storyForm.category,
        place_id: storyForm.place_id,
        from_country_code: storyForm.from_country_code || null,
        to_country_code: storyForm.to_country_code || null,
        user_type: user.user_metadata?.user_type || "tourist",
        images: imageUrls.length > 0 ? imageUrls : null,
        likes_count: 0,
        comments_count: 0,
      });

      if (error) throw error;

      toast.success("Story shared successfully!");
      setShowStoryDialog(false);
      resetStoryForm();
      fetchStories();
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error("Failed to share story");
    }
    setSaving(false);
  };

  const handleCreateTip = async () => {
    if (!user) {
      toast.error("Please sign in to share your tip");
      return;
    }

    if (!tipForm.content.trim()) {
      toast.error("Please enter your tip content");
      return;
    }

    setSaving(true);
    try {
      // Upload images first
      const imageUrls = await uploadImages(tipForm.images);

      const { error } = await supabase.from("tips").insert({
        user_id: user.id,
        content: tipForm.content,
        place_id: tipForm.place_id,
        from_country_code: tipForm.from_country_code || null,
        to_country_code: tipForm.to_country_code || null,
        travel_season: tipForm.travel_season,
        user_type: user.user_metadata?.user_type || "tourist",
        images: imageUrls.length > 0 ? imageUrls : null,
        likes_count: 0,
      });

      if (error) throw error;

      toast.success("Tip shared successfully!");
      setShowTipDialog(false);
      resetTipForm();
      fetchTips();
    } catch (error) {
      console.error("Error creating tip:", error);
      toast.error("Failed to share tip");
    }
    setSaving(false);
  };

  const handleLikeStory = async (storyId: number) => {
    if (!user) {
      toast.error("Please sign in to like stories");
      return;
    }

    try {
      const isLiked = likedStories.has(storyId);

      if (isLiked) {
        await supabase
          .from("story_likes")
          .delete()
          .eq("story_id", storyId)
          .eq("user_id", user.id);
        await supabase.rpc("decrement_story_likes", { story_id: storyId });
        setLikedStories((prev) => {
          const newSet = new Set(prev);
          newSet.delete(storyId);
          return newSet;
        });
      } else {
        await supabase
          .from("story_likes")
          .insert({ story_id: storyId, user_id: user.id });
        await supabase.rpc("increment_story_likes", { story_id: storyId });
        setLikedStories((prev) => new Set(prev).add(storyId));
      }

      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId
            ? {
                ...story,
                likes_count: (story.likes_count || 0) + (isLiked ? -1 : 1),
              }
            : story
        )
      );
      setAllStories((prev) =>
        prev.map((story) =>
          story.id === storyId
            ? {
                ...story,
                likes_count: (story.likes_count || 0) + (isLiked ? -1 : 1),
              }
            : story
        )
      );
    } catch (error) {
      console.error("Error liking story:", error);
      toast.error("Failed to like story");
    }
  };

  const handleLikeTip = async (tipId: number) => {
    if (!user) {
      toast.error("Please sign in to like tips");
      return;
    }

    try {
      const isLiked = likedTips.has(tipId);

      if (isLiked) {
        await supabase
          .from("tip_likes")
          .delete()
          .eq("tip_id", tipId)
          .eq("user_id", user.id);
        await supabase.rpc("decrement_tip_likes", { tip_id: tipId });
        setLikedTips((prev) => {
          const newSet = new Set(prev);
          newSet.delete(tipId);
          return newSet;
        });
      } else {
        await supabase
          .from("tip_likes")
          .insert({ tip_id: tipId, user_id: user.id });
        await supabase.rpc("increment_tip_likes", { tip_id: tipId });
        setLikedTips((prev) => new Set(prev).add(tipId));
      }

      setTips((prev) =>
        prev.map((tip) =>
          tip.id === tipId
            ? {
                ...tip,
                likes_count: (tip.likes_count || 0) + (isLiked ? -1 : 1),
              }
            : tip
        )
      );
      setAllTips((prev) =>
        prev.map((tip) =>
          tip.id === tipId
            ? {
                ...tip,
                likes_count: (tip.likes_count || 0) + (isLiked ? -1 : 1),
              }
            : tip
        )
      );
    } catch (error) {
      console.error("Error liking tip:", error);
      toast.error("Failed to like tip");
    }
  };

  const handleShare = async (
    type: "story" | "tip",
    id: number,
    title?: string
  ) => {
    try {
      const url = `${window.location.origin}/stories?${type}=${id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const resetStoryForm = () => {
    setStoryForm({
      title: "",
      content: "",
      category: "experience",
      place_id: null,
      from_country_code: "",
      to_country_code: "",
      images: [],
    });
  };

  const resetTipForm = () => {
    setTipForm({
      content: "",
      place_id: null,
      from_country_code: "",
      to_country_code: "",
      travel_season: "any",
      images: [],
    });
  };

  const clearAllFilters = () => {
    setSelectedCountry("all");
    setSelectedCategory("all");
    setSelectedUserType("all");
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "student":
        return "bg-blue-100 text-blue-800";
      case "tourist":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const groupedCountries = countries.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = [];
    }
    acc[country.region].push(country);
    return acc;
  }, {} as Record<string, Country[]>);

  const getSelectedCountryName = () => {
    if (selectedCountry === "all") return "All Countries";
    const country = countries.find((c) => c.code === selectedCountry);
    return country ? country.name : selectedCountry;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCountry !== "all") count++;
    if (selectedCategory !== "all") count++;
    if (selectedUserType !== "all") count++;
    return count;
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
                Travel Stories & Tips
              </h1>
              <p className="text-xl opacity-90">
                Learn from fellow travelers' experiences and share your own
                journey
              </p>
            </div>
            {user && (
              <div className="flex space-x-3">
                <Dialog
                  open={showStoryDialog}
                  onOpenChange={setShowStoryDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
                      onClick={resetStoryForm}
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Share Story
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader>
                      <DialogTitle>Share Your Travel Story</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={storyForm.title}
                          onChange={(e) =>
                            setStoryForm({
                              ...storyForm,
                              title: e.target.value,
                            })
                          }
                          placeholder="Give your story a compelling title..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="content">Story Content *</Label>
                        <Textarea
                          id="content"
                          value={storyForm.content}
                          onChange={(e) =>
                            setStoryForm({
                              ...storyForm,
                              content: e.target.value,
                            })
                          }
                          placeholder="Share your travel experience, tips, or insights..."
                          className="min-h-[200px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="images">Images (Optional)</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="images"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setStoryForm({ ...storyForm, images: files });
                            }}
                            className="flex-1"
                          />
                          <Camera className="h-5 w-5 text-gray-400" />
                        </div>
                        {storyForm.images.length > 0 && (
                          <p className="text-sm text-gray-500">
                            {storyForm.images.length} image(s) selected
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={storyForm.category}
                            onValueChange={(value) =>
                              setStoryForm({ ...storyForm, category: value })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="experience">
                                Experience
                              </SelectItem>
                              <SelectItem value="tip">Travel Tip</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                              <SelectItem value="culture">Culture</SelectItem>
                              <SelectItem value="food">
                                Food & Dining
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Related Place (Optional)</Label>
                          <div className="bg-white h-12">
                            <EnhancedPlacesSearch
                              placeholder="Search for a place..."
                              onPlaceSelect={(place) =>
                                setStoryForm({
                                  ...storyForm,
                                  place_id: place.databaseId || null,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="from">From Country (Optional)</Label>
                          <Select
                            value={storyForm.from_country_code}
                            onValueChange={(value) =>
                              setStoryForm({
                                ...storyForm,
                                from_country_code: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {Object.entries(groupedCountries).map(
                                ([region, regionCountries]) => (
                                  <div key={region}>
                                    <div className="px-2 py-1 text-sm font-semibold text-gray-500 bg-gray-50">
                                      {region}
                                    </div>
                                    {regionCountries.map((country) => (
                                      <SelectItem
                                        key={country.code}
                                        value={country.code}
                                      >
                                        {country.name}
                                      </SelectItem>
                                    ))}
                                  </div>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="to">To Country (Optional)</Label>
                          <Select
                            value={storyForm.to_country_code}
                            onValueChange={(value) =>
                              setStoryForm({
                                ...storyForm,
                                to_country_code: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {Object.entries(groupedCountries).map(
                                ([region, regionCountries]) => (
                                  <div key={region}>
                                    <div className="px-2 py-1 text-sm font-semibold text-gray-500 bg-gray-50">
                                      {region}
                                    </div>
                                    {regionCountries.map((country) => (
                                      <SelectItem
                                        key={country.code}
                                        value={country.code}
                                      >
                                        {country.name}
                                      </SelectItem>
                                    ))}
                                  </div>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          onClick={handleCreateStory}
                          disabled={saving || uploadingImages}
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {saving
                            ? "Sharing..."
                            : uploadingImages
                            ? "Uploading..."
                            : "Share Story"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowStoryDialog(false);
                            resetStoryForm();
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                      onClick={resetTipForm}
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Share Tip
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader>
                      <DialogTitle>Share a Travel Tip</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="tipContent">Your Tip *</Label>
                        <Textarea
                          id="tipContent"
                          value={tipForm.content}
                          onChange={(e) =>
                            setTipForm({ ...tipForm, content: e.target.value })
                          }
                          placeholder="Share a helpful travel tip..."
                          className="min-h-[120px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tipImages">Images (Optional)</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="tipImages"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setTipForm({ ...tipForm, images: files });
                            }}
                            className="flex-1"
                          />
                          <Camera className="h-5 w-5 text-gray-400" />
                        </div>
                        {tipForm.images.length > 0 && (
                          <p className="text-sm text-gray-500">
                            {tipForm.images.length} image(s) selected
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Related Place (Optional)</Label>
                          <div className="bg-white">
                            <EnhancedPlacesSearch
                              placeholder="Search for a place..."
                              onPlaceSelect={(place) =>
                                setTipForm({
                                  ...tipForm,
                                  place_id: place.databaseId || null,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="season">Best Season</Label>
                          <Select
                            value={tipForm.travel_season}
                            onValueChange={(value) =>
                              setTipForm({ ...tipForm, travel_season: value })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any Season</SelectItem>
                              <SelectItem value="spring">Spring</SelectItem>
                              <SelectItem value="summer">Summer</SelectItem>
                              <SelectItem value="autumn">Autumn</SelectItem>
                              <SelectItem value="winter">Winter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tipFrom">
                            From Country (Optional)
                          </Label>
                          <Select
                            value={tipForm.from_country_code}
                            onValueChange={(value) =>
                              setTipForm({
                                ...tipForm,
                                from_country_code: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {Object.entries(groupedCountries).map(
                                ([region, regionCountries]) => (
                                  <div key={region}>
                                    <div className="px-2 py-1 text-sm font-semibold text-gray-500 bg-gray-50">
                                      {region}
                                    </div>
                                    {regionCountries.map((country) => (
                                      <SelectItem
                                        key={country.code}
                                        value={country.code}
                                      >
                                        {country.name}
                                      </SelectItem>
                                    ))}
                                  </div>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tipTo">To Country (Optional)</Label>
                          <Select
                            value={tipForm.to_country_code}
                            onValueChange={(value) =>
                              setTipForm({ ...tipForm, to_country_code: value })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {Object.entries(groupedCountries).map(
                                ([region, regionCountries]) => (
                                  <div key={region}>
                                    <div className="px-2 py-1 text-sm font-semibold text-gray-500 bg-gray-50">
                                      {region}
                                    </div>
                                    {regionCountries.map((country) => (
                                      <SelectItem
                                        key={country.code}
                                        value={country.code}
                                      >
                                        {country.name}
                                      </SelectItem>
                                    ))}
                                  </div>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          onClick={handleCreateTip}
                          disabled={saving || uploadingImages}
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {saving
                            ? "Sharing..."
                            : uploadingImages
                            ? "Uploading..."
                            : "Share Tip"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowTipDialog(false);
                            resetTipForm();
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Filter Panel Sidebar */}
          <div className="hidden lg:block w-80 space-y-6">
            <Card className="bg-white shadow-lg border-0 sticky top-24">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Filter & Browse
                  </CardTitle>
                  {getActiveFiltersCount() > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-purple-600"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                {getActiveFiltersCount() > 0 && (
                  <p className="text-sm text-gray-500">
                    {getActiveFiltersCount()} filter(s) active
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Country Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm font-medium">Country</Label>
                  </div>
                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                  >
                    <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                      <SelectValue>
                        <div className="flex items-center space-x-2">
                          {selectedCountry === "all" ? (
                            <span>All Countries</span>
                          ) : (
                            <>
                              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                              <span>{getSelectedCountryName()}</span>
                            </>
                          )}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">All Countries</SelectItem>
                      {Object.entries(groupedCountries).map(
                        ([region, regionCountries]) => (
                          <div key={region}>
                            <div className="px-2 py-1 text-sm font-semibold text-gray-500 bg-gray-50">
                              {region}
                            </div>
                            {regionCountries.map((country) => (
                              <SelectItem
                                key={country.code}
                                value={country.code}
                              >
                                {country.name}
                              </SelectItem>
                            ))}
                          </div>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm font-medium">Categories</Label>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant={selectedCategory === "all" ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={() => setSelectedCategory("all")}
                    >
                      <span>All Categories</span>
                    </Button>
                    {["experience", "tip", "warning", "culture", "food"].map(
                      (category) => (
                        <Button
                          key={category}
                          variant={
                            selectedCategory === category ? "default" : "ghost"
                          }
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => setSelectedCategory(category)}
                        >
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${
                              getCategoryColor(category).split(" ")[0]
                            }`}
                          />
                          <span className="capitalize">{category}</span>
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {/* User Type Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm font-medium">User Types</Label>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant={selectedUserType === "all" ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={() => setSelectedUserType("all")}
                    >
                      <span>All Users</span>
                    </Button>
                    {["student", "tourist"].map((userType) => (
                      <Button
                        key={userType}
                        variant={
                          selectedUserType === userType ? "default" : "ghost"
                        }
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={() => setSelectedUserType(userType)}
                      >
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            getUserTypeColor(userType).split(" ")[0]
                          }`}
                        />
                        <span className="capitalize">{userType}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Stories</span>
                      <span className="font-medium">{stories.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tips</span>
                      <span className="font-medium">{tips.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span className="font-medium">
                        {stories.length + tips.length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-4xl space-y-8">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-2 bg-white shadow-lg border-0 h-14 rounded-xl">
                <TabsTrigger
                  value="stories"
                  className="text-base font-medium data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Stories ({stories.length})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="tips"
                  className="text-base font-medium data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                >
                  <Star className="h-4 w-4 mr-2" />
                  <span>Tips ({tips.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stories" className="space-y-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading stories...</p>
                  </div>
                ) : stories.length === 0 ? (
                  <Card className="bg-white shadow-lg border-0">
                    <CardContent className="p-12 text-center">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold mb-4">
                        No Stories Found
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        No stories match your current filters. Try adjusting
                        your search criteria.
                      </p>
                      <Button onClick={clearAllFilters} variant="outline">
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {stories.map((story) => (
                      <Card
                        key={story.id}
                        className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300"
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage
                                  src={
                                    story.users?.avatar_url ||
                                    "/placeholder.svg"
                                  }
                                  alt={story.users?.username || "User"}
                                />
                                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                  {(story.users?.username || story.user_id)
                                    .charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-900">
                                    {story.users?.username || "Anonymous"}
                                  </span>
                                  <Badge
                                    className={getUserTypeColor(
                                      story.user_type || "tourist"
                                    )}
                                    variant="secondary"
                                  >
                                    {story.user_type}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {new Date(
                                      story.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                  {story.places && (
                                    <>
                                      <span>•</span>
                                      <MapPin className="h-3 w-3" />
                                      <span>{story.places.name}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {story.category && (
                                <Badge
                                  className={getCategoryColor(story.category)}
                                  variant="outline"
                                >
                                  {story.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 font-poppins">
                              {story.title}
                            </h3>

                            {story.from_country_code &&
                              story.to_country_code && (
                                <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                  <span className="font-medium">Route:</span>
                                  <span>
                                    {countries.find(
                                      (c) => c.code === story.from_country_code
                                    )?.name || story.from_country_code}{" "}
                                    →{" "}
                                    {countries.find(
                                      (c) => c.code === story.to_country_code
                                    )?.name || story.to_country_code}
                                  </span>
                                </div>
                              )}
                          </div>

                          {/* Story Images */}
                          {story.images && story.images.length > 0 && (
                            <div className="mb-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 rounded-lg overflow-hidden">
                                {story.images
                                  .slice(0, 3)
                                  .map((image, index) => (
                                    <div
                                      key={index}
                                      className="relative aspect-video rounded-lg overflow-hidden"
                                    >
                                      <img
                                        src={image || "/placeholder.svg"}
                                        alt={`Story image ${index + 1}`}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                      />
                                      {story.images!.length > 3 &&
                                        index === 2 && (
                                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white font-semibold text-lg">
                                              +{story.images!.length - 3}
                                            </span>
                                          </div>
                                        )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="text-gray-700 leading-relaxed">
                              {story.content.length > 400
                                ? `${story.content.substring(0, 400)}...`
                                : story.content}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLikeStory(story.id)}
                                className={`${
                                  likedStories.has(story.id)
                                    ? "text-red-500"
                                    : "text-gray-500"
                                } hover:text-red-500 hover:bg-red-50`}
                                disabled={!user}
                              >
                                <Heart
                                  className={`h-4 w-4 mr-1 ${
                                    likedStories.has(story.id)
                                      ? "fill-current"
                                      : ""
                                  }`}
                                />
                                {story.likes_count || 0}
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                              onClick={() =>
                                handleShare("story", story.id, story.title)
                              }
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tips" className="space-y-6">
                {tips.length === 0 ? (
                  <Card className="bg-white shadow-lg border-0">
                    <CardContent className="p-12 text-center">
                      <Star className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold mb-4">
                        No Tips Found
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        No tips match your current filters. Try adjusting your
                        search criteria.
                      </p>
                      <Button onClick={clearAllFilters} variant="outline">
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {tips.map((tip) => (
                      <Card
                        key={tip.id}
                        className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={
                                    tip.users?.avatar_url || "/placeholder.svg"
                                  }
                                  alt={tip.users?.username || "User"}
                                />
                                <AvatarFallback className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                                  {(tip.users?.username || tip.user_id)
                                    .charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-900">
                                    {tip.users?.username || "Anonymous"}
                                  </span>
                                  <Badge
                                    className={getUserTypeColor(
                                      tip.user_type || "tourist"
                                    )}
                                    variant="secondary"
                                  >
                                    {tip.user_type}
                                  </Badge>
                                  {tip.travel_season &&
                                    tip.travel_season !== "any" && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs capitalize"
                                      >
                                        {tip.travel_season}
                                      </Badge>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {new Date(
                                    tip.created_at
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          {tip.places && (
                            <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                              <MapPin className="h-3 w-3" />
                              <span className="font-medium">Location:</span>
                              <span>{tip.places.name}</span>
                            </div>
                          )}

                          {tip.from_country_code && tip.to_country_code && (
                            <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                              <span className="font-medium">Route:</span>
                              <span>
                                {countries.find(
                                  (c) => c.code === tip.from_country_code
                                )?.name || tip.from_country_code}{" "}
                                →{" "}
                                {countries.find(
                                  (c) => c.code === tip.to_country_code
                                )?.name || tip.to_country_code}
                              </span>
                            </div>
                          )}

                          {/* Tip Images */}
                          {tip.images && tip.images.length > 0 && (
                            <div className="mb-4">
                              <div className="grid grid-cols-2 gap-3 rounded-lg overflow-hidden">
                                {tip.images.slice(0, 2).map((image, index) => (
                                  <div
                                    key={index}
                                    className="relative aspect-video rounded-lg overflow-hidden"
                                  >
                                    <img
                                      src={image || "/placeholder.svg"}
                                      alt={`Tip image ${index + 1}`}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                    />
                                    {tip.images!.length > 2 && index === 1 && (
                                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white font-semibold">
                                          +{tip.images!.length - 2}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                            <p className="text-gray-700 leading-relaxed font-medium">
                              {tip.content}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikeTip(tip.id)}
                              className={`${
                                likedTips.has(tip.id)
                                  ? "text-red-500"
                                  : "text-gray-500"
                              } hover:text-red-500 hover:bg-red-50`}
                              disabled={!user}
                            >
                              <Heart
                                className={`h-4 w-4 mr-1 ${
                                  likedTips.has(tip.id) ? "fill-current" : ""
                                }`}
                              />
                              {tip.likes_count || 0}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                              onClick={() => handleShare("tip", tip.id)}
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
