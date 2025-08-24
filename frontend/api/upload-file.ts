import type { VercelRequest, VercelResponse } from "@vercel/node";

interface PinataV3Response {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
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
    // Parse multipart form data (you may need to handle this differently)
    // For now, assuming the file is passed as base64 or binary data
    const { fileData, fileName, fileType } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({
        error: "Missing required fields: fileData, fileName",
      });
    }

    // Convert base64 to blob if needed
    let file: Blob;
    if (typeof fileData === "string") {
      // Assume base64
      const buffer = Buffer.from(fileData, "base64");
      file = new Blob([buffer], {
        type: fileType || "application/octet-stream",
      });
    } else {
      // Assume already a buffer or blob
      file = new Blob([fileData], {
        type: fileType || "application/octet-stream",
      });
    }

    const formData = new FormData();
    formData.append("file", file, fileName);

    // Pinata metadata for v3 API
    const pinataMetadata = JSON.stringify({
      name: `ShapeSaga File: ${fileName}`,
      keyvalues: {
        fileType: fileType || "unknown",
        fileName: fileName,
        app: "ShapeSaga",
        type: "story-file",
      },
    });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", pinataOptions);

    // Upload to Pinata
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Pinata upload failed:", response.status, errorText);
      return res.status(500).json({
        error: "Failed to upload to IPFS",
        details: `Pinata error: ${response.status}`,
      });
    }

    const result: PinataV3Response = await response.json();

    return res.status(200).json({
      success: true,
      ipfsUri: `ipfs://${result.IpfsHash}`,
      ipfsHash: result.IpfsHash,
      pinSize: result.PinSize,
      timestamp: result.Timestamp,
    });
  } catch (error) {
    console.error("Error in upload-file API:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
