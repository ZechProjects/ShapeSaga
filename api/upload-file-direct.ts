import type { VercelRequest, VercelResponse } from "@vercel/node";

interface PinataV3Response {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

// Helper function to validate file type and size
function validateFile(fileType: string, fileSize: number) {
  const maxSize = 100 * 1024 * 1024; // 100MB limit
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/mov",
    "video/avi",
    "video/quicktime",
    "text/plain",
    "application/pdf",
  ];

  if (fileSize > maxSize) {
    throw new Error(
      `File size ${(fileSize / 1024 / 1024).toFixed(2)}MB exceeds 100MB limit`
    );
  }

  if (!allowedTypes.includes(fileType)) {
    throw new Error(`File type ${fileType} is not supported`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check for Pinata JWT in environment variables
  const PINATA_JWT = process.env.PINATA_JWT;
  if (!PINATA_JWT) {
    console.error("PINATA_JWT not configured");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    // For now, let's use the regular upload endpoint but optimize the base64 conversion
    // In a production environment, you would implement proper multipart/form-data parsing
    const { fileData, fileName, fileType } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({
        error: "Missing required fields: fileData, fileName",
      });
    }

    // Validate file type
    const actualFileType = fileType || "application/octet-stream";

    // Convert base64 to buffer efficiently
    let fileBuffer: Buffer;
    let fileSize: number;

    if (typeof fileData === "string") {
      // Handle base64 encoded data with streaming approach for large files
      try {
        fileBuffer = Buffer.from(fileData, "base64");
        fileSize = fileBuffer.length;
      } catch (error) {
        return res.status(400).json({
          error: "Invalid base64 file data or file too large for memory",
        });
      }
    } else {
      // Handle raw buffer data
      fileBuffer = Buffer.from(fileData);
      fileSize = fileBuffer.length;
    }

    // Validate file
    try {
      validateFile(actualFileType, fileSize);
    } catch (error) {
      return res.status(400).json({
        error:
          error instanceof Error ? error.message : "File validation failed",
      });
    }

    // Create FormData for Pinata with proper file handling
    const formData = new FormData();

    // Create a proper File-like object for large files
    const uint8Array = new Uint8Array(fileBuffer);
    const fileBlob = new Blob([uint8Array], {
      type: actualFileType,
    });
    formData.append("file", fileBlob, fileName);

    // Enhanced Pinata metadata for better organization
    const pinataMetadata = JSON.stringify({
      name: `ShapeSaga File: ${fileName}`,
      keyvalues: {
        fileType: actualFileType,
        fileName: fileName,
        fileSize: fileSize.toString(),
        app: "ShapeSaga",
        type: "story-file",
        uploadedAt: new Date().toISOString(),
        // Add content type classification
        contentCategory: actualFileType.startsWith("video/")
          ? "video"
          : actualFileType.startsWith("image/")
          ? "image"
          : "other",
        uploadMethod: "direct-formdata",
      },
    });
    formData.append("pinataMetadata", pinataMetadata);

    // Optimized Pinata options for large files
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
      // Add custom gateway options for better streaming
      customPinPolicy: {
        regions: [
          { id: "FRA1", desiredReplicationCount: 2 },
          { id: "NYC1", desiredReplicationCount: 2 },
        ],
      },
    });
    formData.append("pinataOptions", pinataOptions);

    console.log(
      `Uploading large file: ${fileName} (${(fileSize / 1024 / 1024).toFixed(
        2
      )}MB, ${actualFileType})`
    );

    // Upload to Pinata with extended timeout for large files
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout for large files

    try {
      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
          },
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Pinata upload failed:", response.status, errorText);

        // Provide more specific error messages
        if (response.status === 413) {
          return res.status(413).json({
            error: "File too large for upload service",
            details: "Please try a smaller file (under 100MB)",
          });
        } else if (response.status === 429) {
          return res.status(429).json({
            error: "Upload rate limit exceeded",
            details: "Please wait before uploading another file",
          });
        } else {
          return res.status(500).json({
            error: "Failed to upload to IPFS",
            details: `Pinata error: ${response.status}`,
          });
        }
      }

      const result: PinataV3Response = await response.json();

      console.log(`Successfully uploaded: ${fileName} -> ${result.IpfsHash}`);

      return res.status(200).json({
        success: true,
        ipfsUri: `ipfs://${result.IpfsHash}`,
        ipfsHash: result.IpfsHash,
        pinSize: result.PinSize,
        timestamp: result.Timestamp,
        isDuplicate: result.isDuplicate || false,
        fileInfo: {
          fileName,
          fileType: actualFileType,
          fileSize: fileSize,
          uploadedAt: new Date().toISOString(),
          uploadMethod: "direct-formdata",
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return res.status(408).json({
          error: "Upload timeout",
          details: "File upload took too long. Please try a smaller file.",
        });
      }

      throw fetchError;
    }
  } catch (error) {
    console.error("Error in upload-file-direct API:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
