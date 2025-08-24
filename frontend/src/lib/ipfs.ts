import { StoryMetadata, ContributionMetadata } from "./contracts";

// IPFS configuration - now using secure server-side API
const API_BASE_URL = import.meta.env.VITE_APP_URL || window.location.origin;

/**
 * Upload story metadata to IPFS via secure API
 */
export async function uploadStoryMetadata(
  metadata: StoryMetadata
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/upload-story`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        `Upload failed: ${errorData.error || response.statusText}`
      );
    }

    const result = await response.json();
    return result.ipfsUri;
  } catch (error) {
    console.error("Error uploading story metadata:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to upload story metadata to IPFS"
    );
  }
}

/**
 * Upload contribution metadata to IPFS via secure API
 */
export async function uploadContributionMetadata(
  metadata: ContributionMetadata
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/upload-contribution`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        `Upload failed: ${errorData.error || response.statusText}`
      );
    }

    const result = await response.json();
    return result.ipfsUri;
  } catch (error) {
    console.error("Error uploading contribution metadata:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to upload contribution metadata to IPFS"
    );
  }
}

/**
 * Upload file content to IPFS via secure API
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  try {
    // Convert file to base64 for transmission
    const fileBuffer = await file.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

    const response = await fetch(`${API_BASE_URL}/api/upload-file`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileData: base64Data,
        fileName: file.name,
        fileType: file.type,
      }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        `Upload failed: ${errorData.error || response.statusText}`
      );
    }

    const result = await response.json();
    return result.ipfsUri;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to upload file to IPFS"
    );
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
