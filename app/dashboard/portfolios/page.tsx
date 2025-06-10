"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Portfolio } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Globe,
  Copy,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PortfoliosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [filteredPortfolios, setFilteredPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated_at");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
      return;
    }

    if (user) {
      fetchPortfolios();
    }
  }, [user, loading, router]);

  useEffect(() => {
    filterAndSortPortfolios();
  }, [portfolios, searchQuery, statusFilter, sortBy]);

  const fetchPortfolios = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortPortfolios = () => {
    let filtered = [...portfolios];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (portfolio) =>
          portfolio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          portfolio.tagline
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          portfolio.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "published") {
        filtered = filtered.filter((portfolio) => portfolio.is_published);
      } else if (statusFilter === "draft") {
        filtered = filtered.filter((portfolio) => !portfolio.is_published);
      } else if (statusFilter === "public") {
        filtered = filtered.filter((portfolio) => portfolio.is_public);
      } else if (statusFilter === "private") {
        filtered = filtered.filter((portfolio) => !portfolio.is_public);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created_at":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "updated_at":
        default:
          return (
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
      }
    });

    setFilteredPortfolios(filtered);
  };

  const deletePortfolio = async (portfolioId: string) => {
    try {
      const { error } = await supabase
        .from("portfolios")
        .delete()
        .eq("id", portfolioId);

      if (error) throw error;

      // Remove from local state
      setPortfolios(portfolios.filter((p) => p.id !== portfolioId));
    } catch (error) {
      console.error("Error deleting portfolio:", error);
    }
  };

  const duplicatePortfolio = async (portfolio: Portfolio) => {
    try {
      const newPortfolio = {
        ...portfolio,
        name: `${portfolio.name} (Copy)`,
        slug: `${portfolio.slug}-copy-${Date.now()}`,
        is_published: false,
      };

      // Remove fields that shouldn't be duplicated
      delete (newPortfolio as any).id;
      delete (newPortfolio as any).created_at;
      delete (newPortfolio as any).updated_at;

      const { data, error } = await supabase
        .from("portfolios")
        .insert(newPortfolio)
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setPortfolios([data, ...portfolios]);
    } catch (error) {
      console.error("Error duplicating portfolio:", error);
    }
  };

  const copyPortfolioUrl = (portfolio: Portfolio) => {
    const url = `${window.location.origin}/portfolio/${portfolio.slug}`;
    navigator.clipboard.writeText(url);
    // You might want to show a toast notification here
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading portfolios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Portfolios</h1>
          <p className="text-muted-foreground mt-1">
            Manage your business portfolios
          </p>
        </div>
        <Link href="/dashboard/portfolios/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Portfolio
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search portfolios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Portfolios</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">Last Updated</SelectItem>
            <SelectItem value="created_at">Date Created</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Portfolio Grid */}
      {filteredPortfolios.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-medium mb-2">
            {portfolios.length === 0
              ? "No portfolios yet"
              : "No portfolios found"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {portfolios.length === 0
              ? "Create your first portfolio to get started"
              : "Try adjusting your search or filters"}
          </p>
          {portfolios.length === 0 && (
            <Link href="/dashboard/portfolios/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Portfolio
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolios.map((portfolio) => (
            <Card
              key={portfolio.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: portfolio.brand_color }}
                    >
                      {portfolio.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {portfolio.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate">
                        {portfolio.tagline || "No tagline"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Status badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={portfolio.is_published ? "default" : "secondary"}
                    >
                      {portfolio.is_published ? "Published" : "Draft"}
                    </Badge>
                    <Badge
                      variant={portfolio.is_public ? "outline" : "secondary"}
                    >
                      {portfolio.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>

                  {/* Description */}
                  {portfolio.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {portfolio.description}
                    </p>
                  )}

                  {/* Portfolio URL */}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Globe className="h-3 w-3 mr-1" />
                    <span className="truncate">
                      scanfolio.com/{portfolio.slug}
                    </span>
                  </div>

                  {/* Last updated */}
                  <p className="text-xs text-muted-foreground">
                    Updated{" "}
                    {new Date(portfolio.updated_at).toLocaleDateString()}
                  </p>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/portfolios/${portfolio.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </Link>

                      {portfolio.is_published && (
                        <Link
                          href={`/portfolio/${portfolio.slug}`}
                          target="_blank"
                        >
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </Link>
                      )}
                    </div>

                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPortfolioUrl(portfolio)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicatePortfolio(portfolio)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Portfolio
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{portfolio.name}
                              "? This action cannot be undone and will also
                              delete all associated QR codes and analytics data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePortfolio(portfolio.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
