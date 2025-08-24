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
    // Validate file size
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error(
        `File size ${(file.size / 1024 / 1024).toFixed(
          2
        )}MB exceeds 100MB limit`
      );
    }

    // Validate file type
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

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported`);
    }

    // Always use FileReader for base64 conversion to avoid memory issues
    const base64Data = await convertLargeFileToBase64(file);

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

      // Provide more specific error messages based on status
      if (response.status === 413) {
        throw new Error(
          "File too large for upload service. Please try a smaller file."
        );
      } else if (response.status === 429) {
        throw new Error(
          "Upload rate limit exceeded. Please wait before uploading another file."
        );
      } else if (response.status === 408) {
        throw new Error(
          "Upload timeout. Please try a smaller file or check your connection."
        );
      } else {
        throw new Error(
          `Upload failed: ${errorData.error || response.statusText}`
        );
      }
    }

    const result = await response.json();
    return result.ipfsUri;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);

    // Handle specific errors
    if (
      error instanceof RangeError &&
      error.message.includes("Maximum call stack size exceeded")
    ) {
      throw new Error(
        "File too large to process. Please try a smaller file (under 50MB)."
      );
    }

    throw new Error(
      error instanceof Error ? error.message : "Failed to upload file to IPFS"
    );
  }
}

/**
 * Convert files to base64 using FileReader (memory-efficient for all file sizes)
 */
async function convertLargeFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:video/mp4;base64,")
        const base64Data = result.split(",")[1];
        if (!base64Data) {
          throw new Error("Invalid file data");
        }
        resolve(base64Data);
      } catch (error) {
        console.error("Base64 conversion error:", error);
        reject(new Error("Failed to convert file to base64"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.onabort = () => {
      reject(new Error("File reading was aborted"));
    };

    // Use readAsDataURL which is more memory efficient than ArrayBuffer + btoa
    try {
      reader.readAsDataURL(file);
    } catch (error) {
      reject(
        new Error("Unable to read file - it may be too large or corrupted")
      );
    }
  });
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
