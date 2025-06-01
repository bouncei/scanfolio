"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { QRCode } from "@/lib/types/database";
import { QRCodeGenerator } from "@/components/qr-code/qr-code-generator";
import { useRouter } from "next/navigation";

interface EditQRCodePageProps {
  params: {
    id: string;
  };
}

export default function EditQRCodePage({ params }: EditQRCodePageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [qrCode, setQrCode] = useState<QRCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
      return;
    }

    if (user && params.id) {
      fetchQRCode();
    }
  }, [user, loading, params.id, router]);

  const fetchQRCode = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user!.id)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          setError(
            "QR code not found or you don't have permission to edit it."
          );
        } else {
          throw fetchError;
        }
        return;
      }

      setQrCode(data);
    } catch (error) {
      console.error("Error fetching QR code:", error);
      setError("Failed to load QR code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading QR code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">QR Code Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The QR code you're looking for doesn't exist or you don't have
            permission to edit it.
          </p>
          <button
            onClick={() => router.push("/dashboard/qr-codes")}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Back to QR Codes
          </button>
        </div>
      </div>
    );
  }

  return <QRCodeGenerator qrCode={qrCode} mode="edit" />;
}
