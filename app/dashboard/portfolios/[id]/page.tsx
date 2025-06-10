"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Portfolio } from "@/lib/types/database";
import { PortfolioForm } from "@/components/portfolio/portfolio-form";

interface EditPortfolioPageProps {
  params: {
    id: string;
  };
}

export default function EditPortfolioPage({ params }: EditPortfolioPageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
      return;
    }

    if (user && params.id) {
      fetchPortfolio();
    }
  }, [user, loading, params.id, router]);

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user!.id)
        .single();

      if (error) {
        console.error("Error fetching portfolio:", error);
        router.push("/dashboard/portfolios");
        return;
      }

      setPortfolio(data);
    } catch (error) {
      console.error("Error:", error);
      router.push("/dashboard/portfolios");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Portfolio not found</h1>
          <p className="text-muted-foreground mt-2">
            The portfolio you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
        </div>
      </div>
    );
  }

  return <PortfolioForm portfolio={portfolio} mode="edit" />;
}
