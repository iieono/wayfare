"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/client";
import { EarthGridBackground } from "@/components/earth-grid-background";
import { Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import type { UserType } from "@/types/database";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState<UserType>("tourist");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          user_type: userType,
        },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("This email is already registered. Try signing in.");
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      // Check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        setError("Failed to check existing profile");
        setLoading(false);
        return;
      }

      if (!existingProfile) {
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email!,
          username,
          user_type: userType,
        });

        if (profileError) {
          setError("Failed to create profile");
          setLoading(false);
          return;
        }
      }

      router.push("/");
    }

    setLoading(false);
  };

  const getUserTypeDescription = (type: UserType) => {
    switch (type) {
      case "student":
        return "Get student-specific travel advice and budget tips";
      case "tourist":
        return "Discover amazing destinations and travel experiences";
      case "other":
        return "Customize your travel experience to your needs";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <EarthGridBackground />

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-element" />
      <div
        className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-element"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 floating-element"
        style={{ animationDelay: "4s" }}
      />

      <Card className="w-full max-w-md glass-card relative z-10 border-0 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full opacity-20 blur-lg" />
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold font-poppins text-gradient mb-2">
            Join Wayfare
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Start your journey to safer, smarter travel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 rounded-2xl border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Username
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 h-14 rounded-2xl border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="userType"
                className="text-sm font-medium text-gray-700"
              >
                I am a...
              </Label>
              <Select
                value={userType}
                onValueChange={(value: UserType) => setUserType(value)}
              >
                <SelectTrigger className="py-8  w-full rounded-2xl border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="student" className="p-4">
                    <div>
                      <div className="font-medium">Student</div>
                      <div className="text-sm text-gray-500">
                        Get student-specific travel advice
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="tourist" className="p-4">
                    <div>
                      <div className="font-medium">Tourist</div>
                      <div className="text-sm text-gray-500">
                        Discover amazing destinations
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="other" className="p-4">
                    <div>
                      <div className="font-medium">Other</div>
                      <div className="text-sm text-gray-500">
                        Customize your experience
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                {getUserTypeDescription(userType)}
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 rounded-2xl border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="Create a strong password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 group"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center">
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center text-blue-600 hover:text-purple-600 font-semibold transition-colors duration-200 group"
            >
              Sign in instead
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
