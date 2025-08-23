import { StoryMetadata } from "./contracts";

// IPFS/Pinata configuration
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || "";
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || "";
const PINATA_API_URL = "https://api.pinata.cloud";

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Upload story metadata to IPFS via Pinata
 */
export async function uploadStoryMetadata(
  metadata: StoryMetadata
): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API credentials not configured");
  }

  try {
    const data = JSON.stringify(metadata, null, 2);
    const blob = new Blob([data], { type: "application/json" });

    const formData = new FormData();
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
      },
    });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", pinataOptions);

    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
    }

    const result: PinataResponse = await response.json();
    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("Failed to upload story metadata to IPFS");
  }
}

/**
 * Upload file content to IPFS via Pinata
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API credentials not configured");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const pinataMetadata = JSON.stringify({
      name: `ShapeSaga File: ${file.name}`,
      keyvalues: {
        fileType: file.type,
        fileName: file.name,
      },
    });
    formData.append("pinataMetadata", pinataMetadata);

    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
    }

    const result: PinataResponse = await response.json();
    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw new Error("Failed to upload file to IPFS");
  }
}

/**
 * Get IPFS URL from hash
 */
export function getIPFSUrl(ipfsHash: string): string {
  const gateway =
    import.meta.env.VITE_IPFS_GATEWAY || "https://gateway.pinata.cloud";
  if (ipfsHash.startsWith("ipfs://")) {
    return `${gateway}/ipfs/${ipfsHash.slice(7)}`;
  }
  return `${gateway}/ipfs/${ipfsHash}`;
}

/**
 * Fetch metadata from IPFS
 */
export async function fetchStoryMetadata(
  ipfsUri: string
): Promise<StoryMetadata> {
  try {
    const url = getIPFSUrl(ipfsUri);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }

    const metadata: StoryMetadata = await response.json();
    return metadata;
  } catch (error) {
    console.error("Error fetching story metadata:", error);
    throw new Error("Failed to fetch story metadata from IPFS");
  }
}
