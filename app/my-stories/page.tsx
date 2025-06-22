"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Edit,
  Trash2,
  Heart,
  MapPin,
  Calendar,
  Save,
  X,
  BookOpen,
  Star,
  Camera,
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
  existingImages: string[];
  removedImages: string[];
}

interface TipForm {
  content: string;
  place_id: number | null;
  from_country_code: string;
  to_country_code: string;
  travel_season: string;
  images: File[];
  existingImages: string[];
  removedImages: string[];
}

export default function MyStoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stories");
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [showStoryDialog, setShowStoryDialog] = useState(false);
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [storyForm, setStoryForm] = useState<StoryForm>({
    title: "",
    content: "",
    category: "experience",
    place_id: null,
    from_country_code: "",
    to_country_code: "",
    images: [],
    existingImages: [],
    removedImages: [],
  });

  const [tipForm, setTipForm] = useState<TipForm>({
    content: "",
    place_id: null,
    from_country_code: "",
    to_country_code: "",
    travel_season: "any",
    images: [],
    existingImages: [],
    removedImages: [],
  });

  useEffect(() => {
    if (user) {
      fetchMyStories();
      fetchMyTips();
      fetchCountries();
    }
  }, [user]);

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

  const fetchMyStories = async () => {
    try {
      const { data, error } = await supabase
        .from("stories")
        .select(
          `
          *,
          places (
            name,
            country_code
          )
        `
        )
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("Failed to load your stories");
    }
    setLoading(false);
  };

  const fetchMyTips = async () => {
    try {
      const { data, error } = await supabase
        .from("tips")
        .select(
          `
          *,
          places (
            name,
            country_code
          )
        `
        )
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTips(data || []);
    } catch (error) {
      console.error("Error fetching tips:", error);
      toast.error("Failed to load your tips");
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
    if (!storyForm.title.trim() || !storyForm.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const imageUrls = await uploadImages(storyForm.images);

      const { data, error } = await supabase
        .from("stories")
        .insert({
          user_id: user!.id,
          title: storyForm.title,
          content: storyForm.content,
          category: storyForm.category,
          place_id: storyForm.place_id,
          from_country_code: storyForm.from_country_code || null,
          to_country_code: storyForm.to_country_code || null,
          user_type: user!.user_metadata?.user_type || "tourist",
          images: imageUrls.length > 0 ? imageUrls : null,
          likes_count: 0,
          comments_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Story created successfully!");
      setShowStoryDialog(false);
      resetStoryForm();
      fetchMyStories();
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error("Failed to create story");
    }
    setSaving(false);
  };

  const handleUpdateStory = async () => {
    if (!editingStory || !storyForm.title.trim() || !storyForm.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const newImageUrls = await uploadImages(storyForm.images);
      const remainingImages = storyForm.existingImages.filter(
        (img) => !storyForm.removedImages.includes(img)
      );
      const finalImages = [...remainingImages, ...newImageUrls];

      const { error } = await supabase
        .from("stories")
        .update({
          title: storyForm.title,
          content: storyForm.content,
          category: storyForm.category,
          place_id: storyForm.place_id,
          from_country_code: storyForm.from_country_code || null,
          to_country_code: storyForm.to_country_code || null,
          images: finalImages.length > 0 ? finalImages : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingStory.id);

      if (error) throw error;

      toast.success("Story updated successfully!");
      setEditingStory(null);
      setShowStoryDialog(false);
      resetStoryForm();
      fetchMyStories();
    } catch (error) {
      console.error("Error updating story:", error);
      toast.error("Failed to update story");
    }
    setSaving(false);
  };

  const handleCreateTip = async () => {
    if (!tipForm.content.trim()) {
      toast.error("Please enter your tip content");
      return;
    }

    setSaving(true);
    try {
      const imageUrls = await uploadImages(tipForm.images);

      const { error } = await supabase.from("tips").insert({
        user_id: user!.id,
        content: tipForm.content,
        place_id: tipForm.place_id,
        from_country_code: tipForm.from_country_code || null,
        to_country_code: tipForm.to_country_code || null,
        travel_season: tipForm.travel_season,
        user_type: user!.user_metadata?.user_type || "tourist",
        images: imageUrls.length > 0 ? imageUrls : null,
        likes_count: 0,
      });

      if (error) throw error;

      toast.success("Tip created successfully!");
      setShowTipDialog(false);
      resetTipForm();
      fetchMyTips();
    } catch (error) {
      console.error("Error creating tip:", error);
      toast.error("Failed to create tip");
    }
    setSaving(false);
  };

  const handleUpdateTip = async () => {
    if (!editingTip || !tipForm.content.trim()) {
      toast.error("Please enter your tip content");
      return;
    }

    setSaving(true);
    try {
      const newImageUrls = await uploadImages(tipForm.images);
      const remainingImages = tipForm.existingImages.filter(
        (img) => !tipForm.removedImages.includes(img)
      );
      const finalImages = [...remainingImages, ...newImageUrls];

      const { error } = await supabase
        .from("tips")
        .update({
          content: tipForm.content,
          place_id: tipForm.place_id,
          from_country_code: tipForm.from_country_code || null,
          to_country_code: tipForm.to_country_code || null,
          travel_season: tipForm.travel_season,
          images: finalImages.length > 0 ? finalImages : null,
        })
        .eq("id", editingTip.id);

      if (error) throw error;

      toast.success("Tip updated successfully!");
      setEditingTip(null);
      setShowTipDialog(false);
      resetTipForm();
      fetchMyTips();
    } catch (error) {
      console.error("Error updating tip:", error);
      toast.error("Failed to update tip");
    }
    setSaving(false);
  };

  const handleDeleteStory = async (storyId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this story? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);

      if (error) throw error;

      toast.success("Story deleted successfully!");
      fetchMyStories();
    } catch (error) {
      console.error("Error deleting story:", error);
      toast.error("Failed to delete story");
    }
  };

  const handleDeleteTip = async (tipId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this tip? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.from("tips").delete().eq("id", tipId);

      if (error) throw error;

      toast.success("Tip deleted successfully!");
      fetchMyTips();
    } catch (error) {
      console.error("Error deleting tip:", error);
      toast.error("Failed to delete tip");
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
      existingImages: [],
      removedImages: [],
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
      existingImages: [],
      removedImages: [],
    });
  };

  const openEditStoryDialog = (story: Story) => {
    setEditingStory(story);
    setStoryForm({
      title: story.title,
      content: story.content,
      category: story.category || "experience",
      place_id: story.place_id,
      from_country_code: story.from_country_code || "",
      to_country_code: story.to_country_code || "",
      images: [],
      existingImages: story.images || [],
      removedImages: [],
    });
    setShowStoryDialog(true);
  };

  const openEditTipDialog = (tip: Tip) => {
    setEditingTip(tip);
    setTipForm({
      content: tip.content,
      place_id: tip.place_id,
      from_country_code: tip.from_country_code || "",
      to_country_code: tip.to_country_code || "",
      travel_season: tip.travel_season || "any",
      images: [],
      existingImages: tip.images || [],
      removedImages: [],
    });
    setShowTipDialog(true);
  };

  const removeExistingImage = (imageUrl: string, type: "story" | "tip") => {
    if (type === "story") {
      setStoryForm((prev) => ({
        ...prev,
        removedImages: [...prev.removedImages, imageUrl],
      }));
    } else {
      setTipForm((prev) => ({
        ...prev,
        removedImages: [...prev.removedImages, imageUrl],
      }));
    }
  };

  const restoreExistingImage = (imageUrl: string, type: "story" | "tip") => {
    if (type === "story") {
      setStoryForm((prev) => ({
        ...prev,
        removedImages: prev.removedImages.filter((img) => img !== imageUrl),
      }));
    } else {
      setTipForm((prev) => ({
        ...prev,
        removedImages: prev.removedImages.filter((img) => img !== imageUrl),
      }));
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

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
                My Stories & Tips
              </h1>
              <p className="text-xl opacity-90">
                Manage your travel experiences and helpful tips
              </p>
            </div>
            <div className="flex space-x-3">
              <Dialog open={showStoryDialog} onOpenChange={setShowStoryDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
                    onClick={() => {
                      setEditingStory(null);
                      resetStoryForm();
                    }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    New Story
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>
                      {editingStory ? "Edit Story" : "Create New Story"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={storyForm.title}
                        onChange={(e) =>
                          setStoryForm({ ...storyForm, title: e.target.value })
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

                    {/* Existing Images */}
                    {editingStory && storyForm.existingImages.length > 0 && (
                      <div className="space-y-2">
                        <Label>Current Images</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {storyForm.existingImages
                            .filter(
                              (img) => !storyForm.removedImages.includes(img)
                            )
                            .map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image || "/placeholder.svg"}
                                  alt={`Story image ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() =>
                                    removeExistingImage(image, "story")
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Removed Images */}
                    {editingStory && storyForm.removedImages.length > 0 && (
                      <div className="space-y-2">
                        <Label>Removed Images (click to restore)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {storyForm.removedImages.map((image, index) => (
                            <div
                              key={index}
                              className="relative group opacity-50"
                            >
                              <img
                                src={image || "/placeholder.svg"}
                                alt={`Removed image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg cursor-pointer"
                                onClick={() =>
                                  restoreExistingImage(image, "story")
                                }
                              />
                              <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  Click to restore
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="images">Add New Images (Optional)</Label>
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
                          {storyForm.images.length} new image(s) selected
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
                            <SelectItem value="food">Food & Dining</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Related Place (Optional)</Label>
                        <div className="bg-white">
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
                        onClick={
                          editingStory ? handleUpdateStory : handleCreateStory
                        }
                        disabled={saving || uploadingImages}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving
                          ? "Saving..."
                          : uploadingImages
                          ? "Uploading..."
                          : editingStory
                          ? "Update Story"
                          : "Create Story"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingStory(null);
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
                    onClick={() => {
                      setEditingTip(null);
                      resetTipForm();
                    }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    New Tip
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTip ? "Edit Tip" : "Create New Tip"}
                    </DialogTitle>
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

                    {/* Existing Images */}
                    {editingTip && tipForm.existingImages.length > 0 && (
                      <div className="space-y-2">
                        <Label>Current Images</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {tipForm.existingImages
                            .filter(
                              (img) => !tipForm.removedImages.includes(img)
                            )
                            .map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image || "/placeholder.svg"}
                                  alt={`Tip image ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() =>
                                    removeExistingImage(image, "tip")
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="tipImages">
                        Add New Images (Optional)
                      </Label>
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
                          {tipForm.images.length} new image(s) selected
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
                        <Label htmlFor="tipFrom">From Country (Optional)</Label>
                        <Select
                          value={tipForm.from_country_code}
                          onValueChange={(value) =>
                            setTipForm({ ...tipForm, from_country_code: value })
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
                        onClick={editingTip ? handleUpdateTip : handleCreateTip}
                        disabled={saving || uploadingImages}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving
                          ? "Saving..."
                          : uploadingImages
                          ? "Uploading..."
                          : editingTip
                          ? "Update Tip"
                          : "Create Tip"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingTip(null);
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
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
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
              <span>My Stories ({stories.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="tips"
              className="text-base font-medium data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              <Star className="h-4 w-4 mr-2" />
              <span>My Tips ({tips.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="space-y-6">
            {stories.length === 0 ? (
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold mb-4">
                    No Stories Yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start sharing your travel experiences! Your stories can help
                    other travelers discover amazing places.
                  </p>
                  <Button onClick={() => setShowStoryDialog(true)} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Write Your First Story
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {stories.map((story) => (
                  <Card
                    key={story.id}
                    className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge
                              className={getCategoryColor(
                                story.category || "experience"
                              )}
                            >
                              {story.category || "experience"}
                            </Badge>
                            {story.places && (
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <MapPin className="h-3 w-3" />
                                <span>{story.places.name}</span>
                              </div>
                            )}
                          </div>
                          <CardTitle className="text-xl font-poppins mb-2">
                            {story.title}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(
                                  story.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {story.from_country_code &&
                              story.to_country_code && (
                                <span>
                                  {story.from_country_code} →{" "}
                                  {story.to_country_code}
                                </span>
                              )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditStoryDialog(story)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStory(story.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Story Images */}
                      {story.images && story.images.length > 0 && (
                        <div className="mb-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {story.images.slice(0, 3).map((image, index) => (
                              <div
                                key={index}
                                className="relative aspect-video rounded-lg overflow-hidden"
                              >
                                <img
                                  src={image || "/placeholder.svg"}
                                  alt={`Story image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {story.images!.length > 3 && index === 2 && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="text-white font-semibold">
                                      +{story.images!.length - 3}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {story.content.length > 300
                          ? `${story.content.substring(0, 300)}...`
                          : story.content}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Heart className="h-4 w-4" />
                            <span>{story.likes_count || 0}</span>
                          </div>
                        </div>
                        {story.updated_at && (
                          <span className="text-xs text-gray-400">
                            Updated{" "}
                            {new Date(story.updated_at).toLocaleDateString()}
                          </span>
                        )}
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
                  <h3 className="text-2xl font-semibold mb-4">No Tips Yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Share your travel wisdom! Your tips can help fellow
                    travelers have better experiences.
                  </p>
                  <Button onClick={() => setShowTipDialog(true)} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Share Your First Tip
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {tips.map((tip) => (
                  <Card
                    key={tip.id}
                    className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {tip.travel_season &&
                              tip.travel_season !== "any" && (
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {tip.travel_season}
                                </Badge>
                              )}
                            {tip.places && (
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <MapPin className="h-3 w-3" />
                                <span>{tip.places.name}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mb-3">
                            {new Date(tip.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditTipDialog(tip)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTip(tip.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {tip.from_country_code && tip.to_country_code && (
                        <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                          <span>
                            {tip.from_country_code} → {tip.to_country_code}
                          </span>
                        </div>
                      )}

                      {/* Tip Images */}
                      {tip.images && tip.images.length > 0 && (
                        <div className="mb-4">
                          <div className="grid grid-cols-2 gap-2">
                            {tip.images.slice(0, 2).map((image, index) => (
                              <div
                                key={index}
                                className="relative aspect-video rounded-lg overflow-hidden"
                              >
                                <img
                                  src={image || "/placeholder.svg"}
                                  alt={`Tip image ${index + 1}`}
                                  className="w-full h-full object-cover"
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

                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {tip.content}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Heart className="h-4 w-4" />
                          <span>{tip.likes_count || 0}</span>
                        </div>
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
  );
}
