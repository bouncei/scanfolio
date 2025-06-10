"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Portfolio, QRCode, AnalyticsSummary } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Eye,
  QrCode,
  MousePointer,
  TrendingUp,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch portfolios
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false })
        .limit(5);

      if (portfoliosError) throw portfoliosError;
      setPortfolios(portfoliosData || []);

      // Fetch QR codes
      const { data: qrCodesData, error: qrCodesError } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (qrCodesError) throw qrCodesError;
      setQrCodes(qrCodesData || []);

      // Fetch analytics summary (simplified for now)
      await fetchAnalyticsSummary();
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalyticsSummary = async () => {
    // This is a simplified version - in production you'd want more sophisticated analytics
    try {
      const portfolioIds = portfolios.map((p) => p.id);

      if (portfolioIds.length === 0) {
        setAnalytics({
          total_views: 0,
          unique_views: 0,
          total_scans: 0,
          unique_scans: 0,
          total_clicks: 0,
          growth_rate: 0,
          top_countries: [],
          top_devices: [],
        });
        return;
      }

      // Get portfolio views
      const { data: viewsData } = await supabase
        .from("portfolio_views")
        .select("*")
        .in("portfolio_id", portfolioIds);

      // Get QR scans
      const qrCodeIds = qrCodes.map((qr) => qr.id);
      const { data: scansData } = await supabase
        .from("qr_scans")
        .select("*")
        .in("qr_code_id", qrCodeIds);

      // Get link clicks
      const { data: clicksData } = await supabase
        .from("link_clicks")
        .select("*")
        .in("portfolio_id", portfolioIds);

      setAnalytics({
        total_views: viewsData?.length || 0,
        unique_views: new Set(viewsData?.map((v) => v.visitor_id)).size || 0,
        total_scans: scansData?.length || 0,
        unique_scans: new Set(scansData?.map((s) => s.ip_address)).size || 0,
        total_clicks: clicksData?.length || 0,
        growth_rate: 0, // Calculate based on time periods
        top_countries: [],
        top_devices: [],
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {profile?.full_name || user.email}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback>
              {profile?.full_name?.slice(0, 2).toUpperCase() ||
                user.email?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Badge
            variant={
              profile?.subscription_tier === "free" ? "secondary" : "default"
            }
          >
            {profile?.subscription_tier || "free"}
          </Badge>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_views}</div>
              <p className="text-xs text-muted-foreground">Portfolio views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Scans</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_scans}</div>
              <p className="text-xs text-muted-foreground">QR code scans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_clicks}</div>
              <p className="text-xs text-muted-foreground">Total clicks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolios</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolios.length}</div>
              <p className="text-xs text-muted-foreground">Active portfolios</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                +{analytics.growth_rate}%
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Portfolios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Portfolios</CardTitle>
            <Link href="/dashboard/portfolios">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {portfolios.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No portfolios yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first portfolio to get started
                </p>
                <Link href="/dashboard/portfolios/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Portfolio
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {portfolios.map((portfolio) => (
                  <div
                    key={portfolio.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {portfolio.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium">{portfolio.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {portfolio.tagline || "No tagline"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          portfolio.is_published ? "default" : "secondary"
                        }
                      >
                        {portfolio.is_published ? "Published" : "Draft"}
                      </Badge>
                      <Link href={`/dashboard/portfolios/${portfolio.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent QR Codes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent QR Codes</CardTitle>
            <Link href="/dashboard/qr-codes">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {qrCodes.length === 0 ? (
              <div className="text-center py-8">
                <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No QR codes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate QR codes for your portfolios
                </p>
                <Link href="/dashboard/qr-codes/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create QR Code
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {qrCodes.map((qrCode) => (
                  <div
                    key={qrCode.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                        <QrCode className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{qrCode.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {qrCode.style} style
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={qrCode.is_active ? "default" : "secondary"}
                      >
                        {qrCode.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Link href={`/dashboard/qr-codes/${qrCode.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/portfolios/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center space-x-3 p-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Create Portfolio</h3>
                  <p className="text-sm text-muted-foreground">
                    Build a new business portfolio
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/qr-codes/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center space-x-3 p-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <QrCode className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Generate QR Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Create custom QR codes
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/analytics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center space-x-3 p-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">View Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Track performance metrics
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
