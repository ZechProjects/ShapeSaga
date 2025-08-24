import type { VercelRequest, VercelResponse } from "@vercel/node";

interface ContributionMetadata {
  title: string;
  content: string;
  contentType: number;
  description?: string;
  tags?: string[];
  parentId: number;
  isBranch: boolean;
  createdBy: string;
}

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
    const metadata: ContributionMetadata = req.body;

    // Validate required fields
    if (
      !metadata.title ||
      !metadata.content ||
      typeof metadata.parentId !== "number"
    ) {
      return res.status(400).json({
        error: "Missing required fields: title, content, parentId",
      });
    }

    // Create the JSON data
    const data = JSON.stringify(metadata, null, 2);
    const blob = new Blob([data], { type: "application/json" });

    const formData = new FormData();
    formData.append(
      "file",
      blob,
      `contribution-${metadata.title.replace(/\s+/g, "-").toLowerCase()}.json`
    );

    // Pinata metadata for v3 API
    const pinataMetadata = JSON.stringify({
      name: `ShapeSaga Contribution: ${metadata.title}`,
      keyvalues: {
        contentType: metadata.contentType.toString(),
        isBranch: metadata.isBranch.toString(),
        app: "ShapeSaga",
        type: "contribution-metadata",
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
    console.error("Error in upload-contribution API:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
