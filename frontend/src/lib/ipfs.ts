import { StoryMetadata, ContributionMetadata } from "./contracts";

// IPFS/Pinata v3 API configuration
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || "";
const PINATA_API_URL = "https://api.pinata.cloud";

interface PinataV3Response {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

/**
 * Upload story metadata to IPFS via Pinata v3 API
 */
export async function uploadStoryMetadata(
  metadata: StoryMetadata
): Promise<string> {
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT not configured");
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

    // Pinata metadata for v3 API
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

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", pinataOptions);

    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
    }

    const result: PinataV3Response = await response.json();
    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("Failed to upload story metadata to IPFS");
  }
}

/**
 * Upload contribution metadata to IPFS via Pinata v3 API
 */
export async function uploadContributionMetadata(
  metadata: ContributionMetadata
): Promise<string> {
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT not configured");
  }

  try {
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

    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
    }

    const result: PinataV3Response = await response.json();
    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading contribution to IPFS:", error);
    throw new Error("Failed to upload contribution metadata to IPFS");
  }
}

/**
 * Upload file content to IPFS via Pinata v3 API
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT not configured");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    // Pinata metadata for v3 API
    const pinataMetadata = JSON.stringify({
      name: `ShapeSaga File: ${file.name}`,
      keyvalues: {
        fileType: file.type,
        fileName: file.name,
        app: "ShapeSaga",
        type: "story-file",
      },
    });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", pinataOptions);

    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
    }

    const result: PinataV3Response = await response.json();
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

/**
 * Fetch contribution metadata from IPFS
 */
export async function fetchContributionMetadata(
  ipfsUri: string
): Promise<ContributionMetadata> {
  try {
    const url = getIPFSUrl(ipfsUri);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }

    const metadata: ContributionMetadata = await response.json();
    return metadata;
  } catch (error) {
    console.error("Error fetching contribution metadata:", error);
    throw new Error("Failed to fetch contribution metadata from IPFS");
  }
}
