"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Portfolio, QRCode } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Palette,
  Upload,
  QrCode,
  Eye,
  Settings,
  Save,
  Link2,
  Smartphone,
} from "lucide-react";
import QRCodeCanvas from "qrcode";
import { z } from "zod";

const qrCodeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  portfolio_id: z.string().min(1, "Portfolio is required"),
  style: z.enum(["square", "dots", "rounded"]),
  foreground_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  background_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  logo_url: z.string().optional(),
  logo_size: z.number().min(10).max(100),
  frame_style: z.string().optional(),
  frame_text: z.string().optional(),
  file_format: z.enum(["png", "svg", "pdf"]),
  is_active: z.boolean(),
  // Additional fields for QR generation (not stored in DB)
  size: z.number().min(128).max(1024),
  error_correction: z.enum(["L", "M", "Q", "H"]),
  margin: z.number().min(0).max(10),
});

type FormData = z.infer<typeof qrCodeSchema>;

interface QRCodeGeneratorProps {
  qrCode?: QRCode;
  mode: "create" | "edit";
}

export function QRCodeGenerator({ qrCode, mode }: QRCodeGeneratorProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const [formData, setFormData] = useState<FormData>({
    name: qrCode?.name || "",
    portfolio_id: qrCode?.portfolio_id || "",
    style: qrCode?.style || "square",
    foreground_color: qrCode?.foreground_color || "#000000",
    background_color: qrCode?.background_color || "#FFFFFF",
    logo_url: qrCode?.logo_url || "",
    logo_size: qrCode?.logo_size || 20,
    frame_style: qrCode?.frame_style || "",
    frame_text: qrCode?.frame_text || "",
    file_format: qrCode?.file_format || "png",
    is_active: qrCode?.is_active ?? true,
    // Default values for generation settings
    size: 256,
    error_correction: "M",
    margin: 4,
  });

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    if (formData.portfolio_id) {
      const selectedPortfolio = portfolios.find(
        (p) => p.id === formData.portfolio_id
      );
      if (selectedPortfolio) {
        const url = `${window.location.origin}/portfolio/${selectedPortfolio.slug}`;
        setQrCodeUrl(url);
        generatePreview(url);
      }
    }
  }, [formData, portfolios]);

  const fetchPortfolios = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_published", true)
        .order("name");

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreview = async (url: string) => {
    if (!url || !canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const options = {
        width: formData.size,
        height: formData.size,
        margin: formData.margin,
        color: {
          dark: formData.foreground_color,
          light: formData.background_color,
        },
        errorCorrectionLevel: formData.error_correction,
      };

      await QRCodeCanvas.toCanvas(canvas, url, options);
      setPreviewUrl(canvas.toDataURL());
    } catch (error) {
      console.error("Error generating QR code preview:", error);
    }
  };

  const validateForm = (): boolean => {
    try {
      qrCodeSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path.join(".")] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;

    try {
      setIsSaving(true);

      // Only include fields that exist in the database
      const qrCodeData = {
        name: formData.name,
        user_id: user.id,
        portfolio_id: formData.portfolio_id,
        target_url: qrCodeUrl,
        qr_data: previewUrl,
        foreground_color: formData.foreground_color,
        background_color: formData.background_color,
        logo_url: formData.logo_url || null,
        logo_size: formData.logo_size,
        style: formData.style,
        frame_style: formData.frame_style || null,
        frame_text: formData.frame_text || null,
        file_format: formData.file_format,
        file_size: null, // Will be set when file is generated
        file_url: null, // Will be set when file is generated
        is_active: formData.is_active,
      };

      if (mode === "edit" && qrCode) {
        const { error } = await supabase
          .from("qr_codes")
          .update(qrCodeData)
          .eq("id", qrCode.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("qr_codes").insert([qrCodeData]);

        if (error) throw error;
      }

      alert(
        mode === "edit"
          ? "QR code updated successfully!"
          : "QR code created successfully!"
      );
    } catch (error) {
      console.error("Error saving QR code:", error);
      alert("Error saving QR code. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadQRCode = (format: "png" | "svg" | "pdf") => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement("a");

    if (format === "png") {
      link.download = `${formData.name || "qr-code"}.png`;
      link.href = canvas.toDataURL("image/png");
    } else if (format === "svg") {
      // For SVG, we'd need a different library like qrcode-svg
      alert("SVG download coming soon!");
      return;
    } else if (format === "pdf") {
      // For PDF, we'd need a library like jsPDF
      alert("PDF download coming soon!");
      return;
    }

    link.click();
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const selectedPortfolio = portfolios.find(
    (p) => p.id === formData.portfolio_id
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {mode === "edit" ? "Edit QR Code" : "Generate QR Code"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Create custom QR codes for your portfolios
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : mode === "edit" ? "Update" : "Create"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                QR Code Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Settings */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">QR Code Name</Label>
                  <Input
                    id="name"
                    placeholder="My Portfolio QR Code"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="portfolio">Portfolio</Label>
                  <Select
                    value={formData.portfolio_id}
                    onValueChange={(value) =>
                      handleInputChange("portfolio_id", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.portfolio_id ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select a portfolio" />
                    </SelectTrigger>
                    <SelectContent>
                      {portfolios.map((portfolio) => (
                        <SelectItem key={portfolio.id} value={portfolio.id}>
                          <div className="flex items-center space-x-2">
                            <span>{portfolio.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {portfolio.template_id}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.portfolio_id && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.portfolio_id}
                    </p>
                  )}
                  {selectedPortfolio && (
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2 text-sm">
                        <Link2 className="h-4 w-4" />
                        <span className="font-mono text-xs">{qrCodeUrl}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Style Settings */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center">
                  <Palette className="h-4 w-4 mr-2" />
                  Design & Style
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="style">Style</Label>
                    <Select
                      value={formData.style}
                      onValueChange={(value) =>
                        handleInputChange("style", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="dots">Dots</SelectItem>
                        <SelectItem value="rounded">Rounded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="size">Size (px)</Label>
                    <Input
                      id="size"
                      type="number"
                      min="128"
                      max="1024"
                      step="32"
                      value={formData.size}
                      onChange={(e) =>
                        handleInputChange("size", parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="foreground">Foreground Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="foreground"
                        type="color"
                        value={formData.foreground_color}
                        onChange={(e) =>
                          handleInputChange("foreground_color", e.target.value)
                        }
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.foreground_color}
                        onChange={(e) =>
                          handleInputChange("foreground_color", e.target.value)
                        }
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="background">Background Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="background"
                        type="color"
                        value={formData.background_color}
                        onChange={(e) =>
                          handleInputChange("background_color", e.target.value)
                        }
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.background_color}
                        onChange={(e) =>
                          handleInputChange("background_color", e.target.value)
                        }
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="error_correction">Error Correction</Label>
                    <Select
                      value={formData.error_correction}
                      onValueChange={(value) =>
                        handleInputChange("error_correction", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (7%)</SelectItem>
                        <SelectItem value="M">Medium (15%)</SelectItem>
                        <SelectItem value="Q">Quartile (25%)</SelectItem>
                        <SelectItem value="H">High (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="margin">Margin</Label>
                    <Input
                      id="margin"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.margin}
                      onChange={(e) =>
                        handleInputChange("margin", parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable tracking and analytics for this QR code
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      handleInputChange("is_active", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Preview
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadQRCode("png")}
                    disabled={!previewUrl}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PNG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadQRCode("svg")}
                    disabled={!previewUrl}
                  >
                    SVG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadQRCode("pdf")}
                    disabled={!previewUrl}
                  >
                    PDF
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                {/* QR Code Preview */}
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="border rounded-lg shadow-lg"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                  {!previewUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">
                          Select a portfolio to generate QR code
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Preview */}
                {selectedPortfolio && (
                  <div className="w-full max-w-sm">
                    <h3 className="font-medium mb-3 flex items-center">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Mobile Preview
                    </h3>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {selectedPortfolio.name.slice(0, 2).toUpperCase()}
                        </div>
                        <h4 className="font-semibold">
                          {selectedPortfolio.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {selectedPortfolio.tagline ||
                            "Professional Portfolio"}
                        </p>
                        <Button size="sm" className="w-full">
                          View Portfolio
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* QR Code Info */}
                {previewUrl && (
                  <div className="w-full space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">Size:</span>
                        <span className="ml-2">
                          {formData.size}×{formData.size}px
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Format:</span>
                        <span className="ml-2">{formData.style}</span>
                      </div>
                      <div>
                        <span className="font-medium">Error Correction:</span>
                        <span className="ml-2">
                          {formData.error_correction}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge
                          variant={formData.is_active ? "default" : "secondary"}
                          className="ml-2"
                        >
                          {formData.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
