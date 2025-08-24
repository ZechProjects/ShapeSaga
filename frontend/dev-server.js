import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const port = 3003;

// Middleware for parsing JSON
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Mock Pinata API response for development
const mockPinataResponse = {
  IpfsHash: "QmTest123456789abcdef",
  PinSize: 1024,
  Timestamp: new Date().toISOString(),
};

// API endpoints that mirror our Vercel functions
app.post("/api/upload-story", async (req, res) => {
  try {
    console.log("📄 Story upload request received");

    const metadata = req.body;

    // Validate required fields
    if (!metadata.title || !metadata.description || !metadata.genre) {
      return res.status(400).json({
        error: "Missing required fields: title, description, genre",
      });
    }

    // Check for Pinata JWT
    const PINATA_JWT = process.env.PINATA_JWT;
    if (!PINATA_JWT) {
      console.error("PINATA_JWT not configured");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Create FormData for Pinata API
    const data = JSON.stringify(metadata, null, 2);
    const formData = new FormData();
    const blob = new Blob([data], { type: "application/json" });

    formData.append(
      "file",
      blob,
      `story-${metadata.title.replace(/\s+/g, "-").toLowerCase()}.json`
    );

    const pinataMetadata = JSON.stringify({
      name: `ShapeSaga Story: ${metadata.title}`,
      keyvalues: {
        genre: metadata.genre,
        language: metadata.language,
        medium: metadata.medium,
        collaborationMode: metadata.collaborationMode,
        app: "ShapeSaga",
        type: "story-metadata",
      },
    });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({ cidVersion: 1 });
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

    const result = await response.json();

    console.log("✅ Story uploaded successfully:", result.IpfsHash);

    return res.status(200).json({
      success: true,
      ipfsUri: `ipfs://${result.IpfsHash}`,
      ipfsHash: result.IpfsHash,
      pinSize: result.PinSize,
      timestamp: result.Timestamp,
    });
  } catch (error) {
    console.error("Error in upload-story API:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/upload-contribution", async (req, res) => {
  try {
    console.log("📝 Contribution upload request received");

    const metadata = req.body;

    if (
      !metadata.title ||
      !metadata.content ||
      typeof metadata.parentId !== "number"
    ) {
      return res.status(400).json({
        error: "Missing required fields: title, content, parentId",
      });
    }

    const PINATA_JWT = process.env.PINATA_JWT;
    if (!PINATA_JWT) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Similar upload logic as story
    const data = JSON.stringify(metadata, null, 2);
    const formData = new FormData();
    const blob = new Blob([data], { type: "application/json" });

    formData.append(
      "file",
      blob,
      `contribution-${metadata.title.replace(/\s+/g, "-").toLowerCase()}.json`
    );

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
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${PINATA_JWT}` },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: "Failed to upload to IPFS" });
    }

    const result = await response.json();
    console.log("✅ Contribution uploaded successfully:", result.IpfsHash);

    return res.status(200).json({
      success: true,
      ipfsUri: `ipfs://${result.IpfsHash}`,
      ipfsHash: result.IpfsHash,
    });
  } catch (error) {
    console.error("Error in upload-contribution API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/upload-file", async (req, res) => {
  try {
    console.log("📎 File upload request received");

    const { fileData, fileName, fileType } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({
        error: "Missing required fields: fileData, fileName",
      });
    }

    const PINATA_JWT = process.env.PINATA_JWT;
    if (!PINATA_JWT) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Convert base64 to blob
    const buffer = Buffer.from(fileData, "base64");
    const blob = new Blob([buffer], {
      type: fileType || "application/octet-stream",
    });

    const formData = new FormData();
    formData.append("file", blob, fileName);

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
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${PINATA_JWT}` },
        body: formData,
      }
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to upload to IPFS" });
    }

    const result = await response.json();
    console.log("✅ File uploaded successfully:", result.IpfsHash);

    return res.status(200).json({
      success: true,
      ipfsUri: `ipfs://${result.IpfsHash}`,
      ipfsHash: result.IpfsHash,
    });
  } catch (error) {
    console.error("Error in upload-file API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Development API server running on http://localhost:${port}`);
  console.log(`📡 API endpoints available:`);
  console.log(`  POST /api/upload-story`);
  console.log(`  POST /api/upload-contribution`);
  console.log(`  POST /api/upload-file`);
});
