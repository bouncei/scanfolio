import QRCode from "qrcode";

export interface QRCodeOptions {
  size: number;
  margin: number;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  style: "square" | "dots" | "rounded";
}

export interface QRCodeResult {
  canvas: HTMLCanvasElement;
  dataUrl: string;
  blob: Blob;
}

/**
 * Generate QR code with custom styling
 */
export async function generateQRCode(
  text: string,
  options: QRCodeOptions,
  canvas?: HTMLCanvasElement
): Promise<QRCodeResult> {
  const targetCanvas = canvas || document.createElement("canvas");

  const qrOptions = {
    width: options.size,
    height: options.size,
    margin: options.margin,
    color: {
      dark: options.foregroundColor,
      light: options.backgroundColor,
    },
    errorCorrectionLevel: options.errorCorrectionLevel,
  };

  // Generate base QR code
  await QRCode.toCanvas(targetCanvas, text, qrOptions);

  // Apply custom styling if needed
  if (options.style !== "square") {
    applyCustomStyle(targetCanvas, options.style);
  }

  const dataUrl = targetCanvas.toDataURL("image/png");

  // Convert to blob for file operations
  const blob = await new Promise<Blob>((resolve) => {
    targetCanvas.toBlob((blob) => resolve(blob!), "image/png");
  });

  return {
    canvas: targetCanvas,
    dataUrl,
    blob,
  };
}

/**
 * Apply custom styling to QR code canvas
 */
function applyCustomStyle(
  canvas: HTMLCanvasElement,
  style: "dots" | "rounded"
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // For now, keep the basic implementation
  // In a production app, you'd implement more sophisticated styling algorithms

  if (style === "dots") {
    // Apply dot styling (simplified)
    // This would involve analyzing the QR pattern and replacing squares with dots
  } else if (style === "rounded") {
    // Apply rounded corners (simplified)
    // This would involve smoothing the corners of QR squares
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Download QR code as file
 */
export function downloadQRCode(
  dataUrl: string,
  filename: string,
  format: "png" | "jpg" | "svg" = "png"
) {
  const link = document.createElement("a");
  link.download = `${filename}.${format}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate QR code as SVG string (for vector export)
 */
export async function generateQRCodeSVG(
  text: string,
  options: Omit<QRCodeOptions, "style">
): Promise<string> {
  const svgOptions = {
    width: options.size,
    margin: options.margin,
    color: {
      dark: options.foregroundColor,
      light: options.backgroundColor,
    },
    errorCorrectionLevel: options.errorCorrectionLevel,
  };

  return QRCode.toString(text, { type: "svg", ...svgOptions });
}

/**
 * Validate QR code text/URL
 */
export function validateQRText(text: string): {
  isValid: boolean;
  error?: string;
  warnings?: string[];
} {
  const warnings: string[] = [];

  if (!text || text.trim().length === 0) {
    return {
      isValid: false,
      error: "QR code text cannot be empty",
    };
  }

  if (text.length > 2953) {
    return {
      isValid: false,
      error: "QR code text is too long (max 2953 characters)",
    };
  }

  if (text.length > 1000) {
    warnings.push(
      "Long text may result in complex QR codes that are harder to scan"
    );
  }

  // Check if it's a URL
  try {
    const url = new URL(text);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      warnings.push("Non-HTTP URLs may not be supported by all QR scanners");
    }
  } catch {
    // Not a URL, that's fine
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Estimate QR code complexity
 */
export function estimateQRComplexity(text: string): {
  level: "low" | "medium" | "high";
  recommendation: string;
} {
  const length = text.length;

  if (length <= 100) {
    return {
      level: "low",
      recommendation:
        "Perfect for quick scanning. Consider using any error correction level.",
    };
  } else if (length <= 500) {
    return {
      level: "medium",
      recommendation:
        "Good for most use cases. Recommend Medium or High error correction.",
    };
  } else {
    return {
      level: "high",
      recommendation:
        "Complex QR code. Use High error correction and ensure good print quality.",
    };
  }
}
