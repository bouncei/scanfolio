"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Portfolio, QRCode } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Eye,
  QrCode,
  MousePointer,
  TrendingUp,
  Users,
  Globe,
  Calendar,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AnalyticsData {
  totalViews: number;
  totalScans: number;
  totalClicks: number;
  uniqueVisitors: number;
  topPortfolios: Array<{
    portfolio: Portfolio;
    views: number;
    scans: number;
  }>;
  topQRCodes: Array<{
    qrCode: QRCode;
    scans: number;
  }>;
  recentActivity: Array<{
    type: "view" | "scan" | "click";
    timestamp: string;
    portfolio?: Portfolio;
    qrCode?: QRCode;
    location?: string;
  }>;
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("all");
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
      return;
    }

    if (user) {
      fetchAnalytics();
      fetchPortfolios();
    }
  }, [user, loading, router, timeRange, selectedPortfolio]);

  const fetchPortfolios = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
    }
  };

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Build portfolio filter
      let portfolioFilter = {};
      if (selectedPortfolio !== "all") {
        portfolioFilter = { portfolio_id: selectedPortfolio };
      }

      // Fetch portfolio views
      const { data: viewsData } = await supabase
        .from("portfolio_views")
        .select(
          `
          *,
          portfolios:portfolio_id (*)
        `
        )
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .match(portfolioFilter);

      // Fetch QR scans
      const { data: scansData } = await supabase
        .from("qr_scans")
        .select(
          `
          *,
          qr_codes:qr_code_id (
            *,
            portfolios:portfolio_id (*)
          )
        `
        )
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      // Fetch link clicks
      const { data: clicksData } = await supabase
        .from("link_clicks")
        .select(
          `
          *,
          portfolios:portfolio_id (*)
        `
        )
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .match(portfolioFilter);

      // Process analytics data
      const totalViews = viewsData?.length || 0;
      const totalScans = scansData?.length || 0;
      const totalClicks = clicksData?.length || 0;
      const uniqueVisitors = new Set(
        viewsData?.map((v) => v.visitor_id).filter(Boolean)
      ).size;

      // Calculate top portfolios
      const portfolioStats = new Map();

      viewsData?.forEach((view) => {
        if (view.portfolios) {
          const key = view.portfolios.id;
          if (!portfolioStats.has(key)) {
            portfolioStats.set(key, {
              portfolio: view.portfolios,
              views: 0,
              scans: 0,
            });
          }
          portfolioStats.get(key).views++;
        }
      });

      scansData?.forEach((scan) => {
        if (scan.qr_codes?.portfolios) {
          const key = scan.qr_codes.portfolios.id;
          if (!portfolioStats.has(key)) {
            portfolioStats.set(key, {
              portfolio: scan.qr_codes.portfolios,
              views: 0,
              scans: 0,
            });
          }
          portfolioStats.get(key).scans++;
        }
      });

      const topPortfolios = Array.from(portfolioStats.values())
        .sort((a, b) => b.views + b.scans - (a.views + a.scans))
        .slice(0, 5);

      // Calculate top QR codes
      const qrCodeStats = new Map();

      scansData?.forEach((scan) => {
        if (scan.qr_codes) {
          const key = scan.qr_codes.id;
          if (!qrCodeStats.has(key)) {
            qrCodeStats.set(key, {
              qrCode: scan.qr_codes,
              scans: 0,
            });
          }
          qrCodeStats.get(key).scans++;
        }
      });

      const topQRCodes = Array.from(qrCodeStats.values())
        .sort((a, b) => b.scans - a.scans)
        .slice(0, 5);

      // Recent activity (last 20 items)
      const recentActivity = [
        ...(viewsData?.slice(-10).map((view) => ({
          type: "view" as const,
          timestamp: view.created_at,
          portfolio: view.portfolios,
          location: view.country || "Unknown",
        })) || []),
        ...(scansData?.slice(-10).map((scan) => ({
          type: "scan" as const,
          timestamp: scan.created_at,
          qrCode: scan.qr_codes,
          location: scan.country || "Unknown",
        })) || []),
        ...(clicksData?.slice(-10).map((click) => ({
          type: "click" as const,
          timestamp: click.created_at,
          portfolio: click.portfolios,
          location: "Unknown",
        })) || []),
      ]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 20);

      setAnalytics({
        totalViews,
        totalScans,
        totalClicks,
        uniqueVisitors,
        topPortfolios,
        topQRCodes,
        recentActivity,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportAnalytics = () => {
    if (!analytics) return;

    const csvData = [
      ["Metric", "Value"],
      ["Total Views", analytics.totalViews],
      ["Total Scans", analytics.totalScans],
      ["Total Clicks", analytics.totalClicks],
      ["Unique Visitors", analytics.uniqueVisitors],
      [""],
      ["Top Portfolios", "Views", "Scans"],
      ...analytics.topPortfolios.map((item) => [
        item.portfolio.name,
        item.views,
        item.scans,
      ]),
      [""],
      ["Top QR Codes", "Scans"],
      ...analytics.topQRCodes.map((item) => [item.qrCode.name, item.scans]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scanfolio-analytics-${timeRange}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your portfolio views, QR code scans, and engagement
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedPortfolio}
              onValueChange={setSelectedPortfolio}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="All portfolios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Portfolios</SelectItem>
                {portfolios.map((portfolio) => (
                  <SelectItem key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                Portfolio page views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Scans</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalScans}</div>
              <p className="text-xs text-muted-foreground">QR code scans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalClicks}</div>
              <p className="text-xs text-muted-foreground">
                CTA and link clicks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unique Visitors
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.uniqueVisitors}
              </div>
              <p className="text-xs text-muted-foreground">Distinct visitors</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Performance */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Portfolios</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topPortfolios.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No portfolio data available for this period
                </p>
              ) : (
                <div className="space-y-4">
                  {analytics.topPortfolios.map((item, index) => (
                    <div
                      key={item.portfolio.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.portfolio.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.views} views, {item.scans} scans
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{item.views + item.scans}</p>
                        <p className="text-xs text-muted-foreground">
                          total interactions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top QR Codes</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topQRCodes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No QR code data available for this period
                </p>
              ) : (
                <div className="space-y-4">
                  {analytics.topQRCodes.map((item, index) => (
                    <div
                      key={item.qrCode.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.qrCode.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {item.qrCode.style} style
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{item.scans}</p>
                        <p className="text-xs text-muted-foreground">scans</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {analytics.recentActivity
                  .slice(0, 10)
                  .map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === "view"
                              ? "bg-blue-100"
                              : activity.type === "scan"
                              ? "bg-green-100"
                              : "bg-purple-100"
                          }`}
                        >
                          {activity.type === "view" && (
                            <Eye className="h-4 w-4 text-blue-600" />
                          )}
                          {activity.type === "scan" && (
                            <QrCode className="h-4 w-4 text-green-600" />
                          )}
                          {activity.type === "click" && (
                            <MousePointer className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {activity.type === "view" && "Portfolio viewed"}
                            {activity.type === "scan" && "QR code scanned"}
                            {activity.type === "click" && "Link clicked"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.portfolio?.name ||
                              activity.qrCode?.name ||
                              "Unknown"}
                            {activity.location && ` • ${activity.location}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
