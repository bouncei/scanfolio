"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForms } from "@/components/auth/auth-forms";
import { useAuth } from "@/lib/context/auth-context";

export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot-password">(
    "signin"
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">ScanFolio</h1>
          <p className="text-muted-foreground mt-2">
            Create. Share. Track. Your digital portfolio awaits.
          </p>
        </div>

        {/* Auth Forms */}
        <AuthForms mode={mode} onModeChange={setMode} />

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
