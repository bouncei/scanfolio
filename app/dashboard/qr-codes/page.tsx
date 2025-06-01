"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { QRCode, Portfolio } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Trash2,
  Copy,
  Edit,
  Eye,
  QrCode,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface QRCodeWithPortfolio extends QRCode {
  portfolio?: Portfolio;
  total_scans?: number;
}

export default function QRCodesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [qrCodes, setQrCodes] = useState<QRCodeWithPortfolio[]>([]);
  const [filteredQrCodes, setFilteredQrCodes] = useState<QRCodeWithPortfolio[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [styleFilter, setStyleFilter] = useState<string>("all");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
      return;
    }

    if (user) {
      fetchQRCodes();
    }
  }, [user, loading, router]);

  useEffect(() => {
    filterAndSortQRCodes();
  }, [qrCodes, searchQuery, statusFilter, styleFilter]);

  const fetchQRCodes = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch QR codes with portfolio information
      const { data: qrCodesData, error: qrCodesError } = await supabase
        .from("qr_codes")
        .select(
          `
          *,
          portfolios:portfolio_id (
            id,
            name,
            slug,
            brand_color,
            is_published
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (qrCodesError) throw qrCodesError;

      // For each QR code, get scan count
      const qrCodesWithStats = await Promise.all(
        (qrCodesData || []).map(async (qrCode) => {
          const { count } = await supabase
            .from("qr_scans")
            .select("*", { count: "exact", head: true })
            .eq("qr_code_id", qrCode.id);

          return {
            ...qrCode,
            portfolio: qrCode.portfolios,
            total_scans: count || 0,
          };
        })
      );

      setQrCodes(qrCodesWithStats);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortQRCodes = () => {
    let filtered = qrCodes;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (qr) =>
          qr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          qr.portfolio?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((qr) => {
        if (statusFilter === "active") return qr.is_active;
        if (statusFilter === "inactive") return !qr.is_active;
        return true;
      });
    }

    // Apply style filter
    if (styleFilter !== "all") {
      filtered = filtered.filter((qr) => qr.style === styleFilter);
    }

    setFilteredQrCodes(filtered);
  };

  const deleteQRCode = async (qrCodeId: string) => {
    try {
      const { error } = await supabase
        .from("qr_codes")
        .delete()
        .eq("id", qrCodeId);

      if (error) throw error;

      setQrCodes((prev) => prev.filter((qr) => qr.id !== qrCodeId));
      alert("QR code deleted successfully!");
    } catch (error) {
      console.error("Error deleting QR code:", error);
      alert("Error deleting QR code. Please try again.");
    }
  };

  const duplicateQRCode = async (qrCode: QRCodeWithPortfolio) => {
    try {
      const duplicateData = {
        ...qrCode,
        id: undefined,
        name: `${qrCode.name} (Copy)`,
        created_at: undefined,
        updated_at: undefined,
        file_url: null,
        file_size: null,
      };

      delete duplicateData.portfolio;
      delete duplicateData.total_scans;

      const { error } = await supabase.from("qr_codes").insert([duplicateData]);

      if (error) throw error;

      await fetchQRCodes();
      alert("QR code duplicated successfully!");
    } catch (error) {
      console.error("Error duplicating QR code:", error);
      alert("Error duplicating QR code. Please try again.");
    }
  };

  const copyQRCodeUrl = (qrCode: QRCodeWithPortfolio) => {
    navigator.clipboard.writeText(qrCode.target_url);
    alert("QR code URL copied to clipboard!");
  };

  const downloadQRCode = (qrCode: QRCodeWithPortfolio) => {
    if (qrCode.qr_data) {
      const link = document.createElement("a");
      link.download = `${qrCode.name}.png`;
      link.href = qrCode.qr_data;
      link.click();
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading QR codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">QR Codes</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your custom QR codes
          </p>
        </div>
        <Link href="/dashboard/qr-codes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create QR Code
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search QR codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={styleFilter} onValueChange={setStyleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Styles</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="dots">Dots</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* QR Codes Grid */}
      {filteredQrCodes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {qrCodes.length === 0
                ? "No QR codes yet"
                : "No matching QR codes"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {qrCodes.length === 0
                ? "Create your first QR code to get started"
                : "Try adjusting your search or filters"}
            </p>
            {qrCodes.length === 0 && (
              <Link href="/dashboard/qr-codes/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create QR Code
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQrCodes.map((qrCode) => (
            <Card key={qrCode.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback
                        style={{
                          backgroundColor:
                            qrCode.portfolio?.brand_color || "#3B82F6",
                        }}
                        className="text-white"
                      >
                        <QrCode className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm">{qrCode.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {qrCode.portfolio?.name || "Unknown Portfolio"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/qr-codes/${qrCode.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyQRCodeUrl(qrCode)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadQRCode(qrCode)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateQRCode(qrCode)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href={qrCode.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Portfolio
                        </a>
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete QR Code</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{qrCode.name}"?
                              This action cannot be undone and will stop all
                              tracking for this QR code.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteQRCode(qrCode.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* QR Code Preview */}
                  <div className="flex justify-center">
                    {qrCode.qr_data ? (
                      <img
                        src={qrCode.qr_data}
                        alt={qrCode.name}
                        className="w-24 h-24 border rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 border rounded-lg flex items-center justify-center bg-gray-100">
                        <QrCode className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Scans:</span>
                      <span className="font-medium">
                        {qrCode.total_scans || 0}
                      </span>
                    </div>
                    <Badge variant={qrCode.is_active ? "default" : "secondary"}>
                      {qrCode.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Style:</span>
                      <span className="capitalize">{qrCode.style}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <span className="uppercase">{qrCode.file_format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>
                        {new Date(qrCode.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => downloadQRCode(qrCode)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Link href={`/dashboard/qr-codes/${qrCode.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
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
