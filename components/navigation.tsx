"use client";

import Link from "next/link";
import { useAuth } from "./auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapPin, Shield, Users, Route, Map, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/client";

interface UserProfile {
  avatar_url: string | null;
  username: string | null;
}

export function Navigation() {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("avatar_url, username")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    if (userProfile?.username) return userProfile.username;
    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User"
    );
  };

  const getUserAvatar = () => {
    if (!user) return "/placeholder.svg?height=40&width=40";
    if (userProfile?.avatar_url) return userProfile.avatar_url;
    return (
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      "/placeholder.svg?height=40&width=40"
    );
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <MapPin className="h-8 w-8 text-blue-600 group-hover:text-purple-600 transition-colors duration-300" />
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
            </div>
            <span className="text-2xl font-bold font-poppins text-gradient">
              Wayfare
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="/safety-map" icon={Shield} label="Safety Map" />
            <NavLink href="/route-planner" icon={Route} label="Route Planner" />
            <NavLink href="/stories" icon={Users} label="Stories" />
            <NavLink href="/places" icon={Map} label="Places" />
            <NavLink
              href="/report-safety"
              icon={AlertTriangle}
              label="Report Safety"
            />
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-700">
                    {getUserDisplayName()}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {user.user_metadata?.user_type || "Tourist"}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <Avatar className="h-10 w-10 ring-2 ring-white/20">
                        <AvatarImage
                          src={getUserAvatar() || "/placeholder.svg"}
                          alt={getUserDisplayName()}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {getUserDisplayName().charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-white border border-gray-200 shadow-lg"
                    align="end"
                  >
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-stories">My Stories</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/report-safety">Report Safety</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" asChild className="hover:bg-white/10">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                >
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-white/50 transition-all duration-200 group cursor-pointer"
    >
      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
