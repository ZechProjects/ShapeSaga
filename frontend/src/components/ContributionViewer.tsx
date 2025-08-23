import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { type ContributionNode, ContentType } from "../lib/contracts";

interface ContributionViewerProps {
  node: ContributionNode | null;
  storyContentType: ContentType;
  storyId?: string;
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

        let imageUrl: string | undefined;
        let videoUrl: string | undefined;

        // Extract media URLs from content if present
        if (storyContentType === ContentType.IMAGE) {
          const imageMatch = metadata.content.match(/\(ipfs:\/\/([^)]+)\)/);
          if (imageMatch && imageMatch[1]) {
            imageUrl = `https://ipfs.io/ipfs/${imageMatch[1]}`;
          }
        } else if (storyContentType === ContentType.VIDEO) {
          const videoMatch = metadata.content.match(
            /\[Video: [^\]]+\]\(ipfs:\/\/([^)]+)\)/
          );
          if (videoMatch && videoMatch[1]) {
            videoUrl = `https://ipfs.io/ipfs/${videoMatch[1]}`;
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
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Content</h3>

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
          {storyContentType === ContentType.VIDEO && content?.videoUrl && (
            <div className="mb-4">
              <video
                src={content.videoUrl}
                controls
                className="max-w-full h-auto rounded-lg shadow-sm"
              >
                Your browser does not support the video tag.
              </video>
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
          <div className="border-t border-gray-200 pt-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Path: {node.path} • Level: {node.level}
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to={`/story/${storyId}/contribute?parent=${node.contribution.id.toString()}`}
                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-1"
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
                  Continue
                </Link>
                <Link
                  to={`/story/${storyId}/contribute?parent=${node.contribution.id.toString()}&branch=true`}
                  className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-1"
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
                  Branch
                </Link>
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
          </div>
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
