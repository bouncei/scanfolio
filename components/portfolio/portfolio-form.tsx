"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import {
  Portfolio,
  PortfolioFormData,
  PortfolioTemplate,
} from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Eye,
  Palette,
  Globe,
  Lock,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import * as z from "zod";

// Form validation schema
const portfolioSchema = z.object({
  name: z.string().min(1, "Portfolio name is required").max(255),
  tagline: z.string().max(500).optional(),
  description: z.string().optional(),
  brand_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  template_id: z.string().min(1, "Template is required"),
  is_published: z.boolean(),
  is_public: z.boolean(),
  seo_title: z.string().max(60).optional(),
  seo_description: z.string().max(160).optional(),
});

type FormData = z.infer<typeof portfolioSchema>;

interface PortfolioFormProps {
  portfolio?: Portfolio;
  mode: "create" | "edit";
}

export function PortfolioForm({ portfolio, mode }: PortfolioFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [templates, setTemplates] = useState<PortfolioTemplate[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: portfolio?.name || "",
    tagline: portfolio?.tagline || "",
    description: portfolio?.description || "",
    brand_color: portfolio?.brand_color || "#3B82F6",
    template_id: portfolio?.template_id || "",
    is_published: portfolio?.is_published || false,
    is_public: portfolio?.is_public || true,
    seo_title: portfolio?.seo_title || "",
    seo_description: portfolio?.seo_description || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugPreview, setSlugPreview] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    // Generate slug preview from name
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlugPreview(slug);
  }, [formData.name]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("portfolio_templates")
        .select("*")
        .order("name");

      if (error) throw error;
      setTemplates(data || []);

      // Set default template if creating new portfolio
      if (
        mode === "create" &&
        data &&
        data.length > 0 &&
        !formData.template_id
      ) {
        setFormData((prev) => ({ ...prev, template_id: data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const validateForm = (): boolean => {
    try {
      portfolioSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    if (!slug) return false;

    try {
      const query = supabase.from("portfolios").select("id").eq("slug", slug);

      // If editing, exclude current portfolio
      if (portfolio) {
        query.neq("id", portfolio.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.length === 0; // Available if no matches found
    } catch (error) {
      console.error("Error checking slug availability:", error);
      return false;
    }
  };

  const handleSave = async (publish = false) => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Check slug availability
      const isSlugAvailable = await checkSlugAvailability(slugPreview);
      if (!isSlugAvailable) {
        setErrors({
          name: "This name creates a URL that's already taken. Please choose a different name.",
        });
        return;
      }

      const portfolioData = {
        ...formData,
        slug: slugPreview,
        user_id: user!.id,
        is_published: publish || formData.is_published,
      };

      if (mode === "create") {
        const { data, error } = await supabase
          .from("portfolios")
          .insert(portfolioData)
          .select()
          .single();

        if (error) throw error;

        router.push(`/dashboard/portfolios/${data.id}`);
      } else {
        const { error } = await supabase
          .from("portfolios")
          .update(portfolioData)
          .eq("id", portfolio!.id);

        if (error) throw error;

        // Refresh the page or update local state
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving portfolio:", error);
      setErrors({ submit: "Failed to save portfolio. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/portfolios">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolios
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {mode === "create" ? "Create Portfolio" : "Edit Portfolio"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {mode === "create"
                ? "Build your business portfolio"
                : `Editing ${portfolio?.name}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {portfolio?.is_published && (
            <Link href={`/portfolio/${portfolio.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>

          <Button onClick={() => handleSave(true)} disabled={isSaving}>
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            {formData.is_published ? "Update & Publish" : "Save & Publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Portfolio Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter portfolio name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
                {slugPreview && (
                  <p className="text-sm text-muted-foreground mt-1">
                    URL: scanfolio.com/{slugPreview}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange("tagline", e.target.value)}
                  placeholder="A brief description of your business"
                  className={errors.tagline ? "border-red-500" : ""}
                />
                {errors.tagline && (
                  <p className="text-sm text-red-500 mt-1">{errors.tagline}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Detailed description of your business..."
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Design & Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Design & Template</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template">Template *</Label>
                <Select
                  value={formData.template_id}
                  onValueChange={(value) =>
                    handleInputChange("template_id", value)
                  }
                >
                  <SelectTrigger
                    className={errors.template_id ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center space-x-2">
                          <span>{template.name}</span>
                          {template.is_premium && (
                            <Badge variant="secondary" className="ml-2">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.template_id && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.template_id}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="brand_color">Brand Color</Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="brand_color"
                    type="color"
                    value={formData.brand_color}
                    onChange={(e) =>
                      handleInputChange("brand_color", e.target.value)
                    }
                    className="w-20 h-10 p-1 border rounded"
                  />
                  <Input
                    value={formData.brand_color}
                    onChange={(e) =>
                      handleInputChange("brand_color", e.target.value)
                    }
                    placeholder="#3B82F6"
                    className={`flex-1 ${
                      errors.brand_color ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.brand_color && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.brand_color}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seo_title">Meta Title</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) =>
                    handleInputChange("seo_title", e.target.value)
                  }
                  placeholder="SEO title for search engines"
                  maxLength={60}
                  className={errors.seo_title ? "border-red-500" : ""}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.seo_title?.length || 0}/60 characters
                </p>
                {errors.seo_title && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.seo_title}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="seo_description">Meta Description</Label>
                <Textarea
                  id="seo_description"
                  value={formData.seo_description}
                  onChange={(e) =>
                    handleInputChange("seo_description", e.target.value)
                  }
                  placeholder="Brief description for search results"
                  maxLength={160}
                  rows={3}
                  className={errors.seo_description ? "border-red-500" : ""}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.seo_description?.length || 0}/160 characters
                </p>
                {errors.seo_description && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.seo_description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <div>
                    <Label htmlFor="is_published">Published</Label>
                    <p className="text-sm text-muted-foreground">
                      Make portfolio visible to visitors
                    </p>
                  </div>
                </div>
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_published", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <div>
                    <Label htmlFor="is_public">Public</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow search engines to index
                    </p>
                  </div>
                </div>
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_public", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge
                    variant={formData.is_published ? "default" : "secondary"}
                  >
                    {formData.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Visibility:</span>
                  <Badge variant={formData.is_public ? "outline" : "secondary"}>
                    {formData.is_public ? "Public" : "Private"}
                  </Badge>
                </div>

                {slugPreview && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-2">Portfolio URL:</p>
                    <p className="text-sm text-muted-foreground break-all">
                      scanfolio.com/{slugPreview}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Learn how to create an effective portfolio that converts
                visitors into customers.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Tutorial
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Messages */}
      {errors.submit && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}
    </div>
  );
}
