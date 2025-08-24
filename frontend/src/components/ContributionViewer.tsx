import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { type ContributionNode, ContentType } from "../lib/contracts";

interface ContributionViewerProps {
  node: ContributionNode | null;
  storyContentType: ContentType;
  storyId?: string;
}

interface ContributeToStorySectionProps {
  node: ContributionNode;
  storyId: string;
}

function ContributeToStorySection({
  node,
  storyId,
}: ContributeToStorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-t border-gray-200 pt-4 mt-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Path: {node.path} • Level: {node.level}
        </div>
        <div className="flex items-center space-x-2">
          <a
            href={
              node.contribution.metadataURI.startsWith("ipfs://")
                ? `https://ipfs.io/ipfs/${node.contribution.metadataURI.replace(
                    "ipfs://",
                    ""
                  )}`
                : node.contribution.metadataURI
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            View Raw Metadata →
          </a>
        </div>
      </div>

      {/* Contribute to Story Toggle Section */}
      <div className="mt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full p-3 bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-lg hover:from-blue-100 hover:to-green-100 transition-colors duration-200"
        >
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="font-medium text-gray-900">
              Contribute to Story
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isExpanded && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Choose how you'd like to contribute to this story:
            </p>
            <div className="flex items-center space-x-3">
              <Link
                to={`/story/${storyId}/contribute?parent=${node.contribution.id.toString()}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Continue Story
                <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded">
                  Sequential
                </span>
              </Link>
              <Link
                to={`/story/${storyId}/contribute?parent=${node.contribution.id.toString()}&branch=true`}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Create Branch
                <span className="ml-2 text-xs bg-green-500 px-2 py-1 rounded">
                  Alternative
                </span>
              </Link>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <p>
                <strong>Continue:</strong> Add the next part to this story path
              </p>
              <p>
                <strong>Branch:</strong> Create an alternative storyline from
                this point
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ContributionViewer({
  node,
  storyContentType,
  storyId,
}: ContributionViewerProps) {
  const [content, setContent] = useState<{
    title?: string;
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
    description?: string;
    branchTitle?: string;
    authorNotes?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      if (!node?.contribution.metadataURI) {
        setContent(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const ipfsUrl = node.contribution.metadataURI.startsWith("ipfs://")
          ? `https://ipfs.io/ipfs/${node.contribution.metadataURI.replace(
              "ipfs://",
              ""
            )}`
          : node.contribution.metadataURI;

        const response = await fetch(ipfsUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch metadata");
        }

        const metadata = await response.json();

        console.log("Fetched metadata:", metadata);
        console.log("Story content type:", storyContentType);

        let imageUrl: string | undefined;
        let videoUrl: string | undefined;

        // Extract media URLs from content if present
        if (storyContentType === ContentType.IMAGE) {
          // Look for both ipfs:// and https:// URLs in parentheses
          const imageMatch = metadata.content.match(
            /\((?:ipfs:\/\/|https:\/\/[^/]*\/ipfs\/)([^)]+)\)/
          );
          console.log("Image match result:", imageMatch);
          if (imageMatch && imageMatch[1]) {
            imageUrl = `https://ipfs.io/ipfs/${imageMatch[1]}`;
          }
        } else if (storyContentType === ContentType.VIDEO) {
          // Look for video patterns with both ipfs:// and https:// URLs
          const videoMatch = metadata.content.match(
            /\[Video: [^\]]+\]\((?:ipfs:\/\/|https:\/\/[^/]*\/ipfs\/)([^)]+)\)/
          );
          console.log("Video match result:", videoMatch);
          console.log("Full content text:", metadata.content);
          if (videoMatch && videoMatch[1]) {
            videoUrl = `https://ipfs.io/ipfs/${videoMatch[1]}`;
            console.log("Extracted video URL:", videoUrl);
          } else {
            // Fallback: Look for any IPFS URL in the content
            const fallbackMatch = metadata.content.match(
              /(?:ipfs:\/\/|https:\/\/[^/]*\/ipfs\/)([a-zA-Z0-9]+)/
            );
            if (fallbackMatch && fallbackMatch[1]) {
              videoUrl = `https://ipfs.io/ipfs/${fallbackMatch[1]}`;
              console.log("Fallback extracted video URL:", videoUrl);
            }
          }
        }

        setContent({
          title: metadata.title,
          text: metadata.content,
          imageUrl,
          videoUrl,
          description: metadata.description,
          branchTitle: metadata.branchTitle,
          authorNotes: metadata.authorNotes,
        });
      } catch (err) {
        console.error("Error fetching contribution content:", err);
        setError("Failed to load contribution content");
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [node?.contribution.metadataURI, storyContentType]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: bigint) => {
    const timestampMs = Number(timestamp) * 1000;
    return new Date(timestampMs).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!node) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-4xl mb-2">👁️</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Select a Contribution
        </h3>
        <p className="text-gray-500">
          Click on any contribution in the tree to view its content
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Content Unavailable
          </h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-xl font-bold text-gray-900">
                {content?.title ||
                  `Contribution #${node.contribution.id.toString()}`}
              </h2>
              {node.contribution.isBranch && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                  Branch
                </span>
              )}
            </div>

            {content?.branchTitle && (
              <div className="text-sm text-green-700 mb-2">
                <span className="font-medium">Branch:</span>{" "}
                {content.branchTitle}
              </div>
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <span>👤</span>
                <span>By {formatAddress(node.contribution.contributor)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>📅</span>
                <span>{formatDate(node.contribution.createdAt)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>🆔</span>
                <span>#{node.contribution.id.toString()}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {Number(node.contribution.upvotes)}
              </div>
              <div className="text-xs text-gray-500">👍</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {Number(node.contribution.downvotes)}
              </div>
              <div className="text-xs text-gray-500">👎</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {content?.description && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-1">Description</h4>
            <p className="text-blue-800 text-sm">{content.description}</p>
          </div>
        )}

        <div className="mb-6">
          {/* Image content */}
          {storyContentType === ContentType.IMAGE && content?.imageUrl && (
            <div className="mb-4">
              <img
                src={content.imageUrl}
                alt="Contribution visual"
                className="max-w-full h-auto rounded-lg shadow-sm"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Video content */}
          {storyContentType === ContentType.VIDEO && (
            <div className="mb-4">
              {content?.videoUrl ? (
                <video
                  src={content.videoUrl}
                  controls
                  preload="metadata"
                  className="max-w-full h-auto rounded-lg shadow-sm"
                  onError={(e) => {
                    console.error("Video failed to load:", content.videoUrl);
                    const target = e.target as HTMLVideoElement;
                    target.style.display = "none";
                    // Show fallback message
                    const parent = target.parentElement;
                    if (
                      parent &&
                      !parent.querySelector(".video-error-message")
                    ) {
                      const errorDiv = document.createElement("div");
                      errorDiv.className =
                        "video-error-message bg-red-50 border border-red-200 rounded-lg p-4 text-center";
                      errorDiv.innerHTML = `
                        <div class="text-red-600 mb-2">⚠️ Video Preview Unavailable</div>
                        <p class="text-sm text-red-700">The video could not be loaded. You can try accessing it directly:</p>
                        <a href="${content.videoUrl}" target="_blank" rel="noopener noreferrer" 
                           class="inline-block mt-2 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                          Open Video in New Tab →
                        </a>
                      `;
                      parent.appendChild(errorDiv);
                    }
                  }}
                  onLoadStart={() => {
                    console.log("Video loading started:", content.videoUrl);
                  }}
                  onCanPlay={() => {
                    console.log("Video can play:", content.videoUrl);
                  }}
                >
                  <p className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    Your browser does not support the video tag.
                    <br />
                    <a
                      href={content.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Open Video in New Tab →
                    </a>
                  </p>
                </video>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-yellow-600 mb-2">
                    🎥 Video Content Expected
                  </div>
                  <p className="text-sm text-yellow-700">
                    This is a video story, but no video content was found in the
                    contribution.
                  </p>
                  <details className="mt-2 text-xs text-gray-600">
                    <summary className="cursor-pointer">Debug Info</summary>
                    <pre className="mt-2 text-left bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(
                        { content: content?.text, videoUrl: content?.videoUrl },
                        null,
                        2
                      )}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          )}

          {/* Text content */}
          {content?.text && (
            <div className="prose max-w-none">
              <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-line text-gray-800">
                {content.text}
              </div>
            </div>
          )}
        </div>

        {content?.authorNotes && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Author Notes</h4>
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-yellow-800 text-sm italic">
                {content.authorNotes}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {node && storyId && (
          <ContributeToStorySection node={node} storyId={storyId} />
        )}

        {/* Metadata link (fallback if no storyId) */}
        {node && !storyId && (
          <div className="border-t border-gray-200 pt-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Path: {node.path} • Level: {node.level}
              </div>
              <a
                href={
                  node.contribution.metadataURI.startsWith("ipfs://")
                    ? `https://ipfs.io/ipfs/${node.contribution.metadataURI.replace(
                        "ipfs://",
                        ""
                      )}`
                    : node.contribution.metadataURI
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                View Raw Metadata →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
