import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useStory } from "../hooks/useStory";
import { useContributions } from "../hooks/useContributions";
import { ContentType } from "../lib/contracts";

export function StoryPage() {
  // State for fetched image URL from metadata
  const [contributionImageUrl, setContributionImageUrl] = useState<
    string | null
  >(null);
  // ...existing code...
  // All variable declarations above
  // ...existing code...

  // Place this block after all variable declarations and before return:
  // ...existing code...

  // Move useEffect to here, after all hooks and variable declarations
  // ...existing code...

  const { id } = useParams<{ id: string }>();
  const { story, isLoading, error, exists } = useStory(id);
  const {
    contributions,
    isLoading: isLoadingContributions,
    error: contributionsError,
  } = useContributions(id);
  const [currentPage, setCurrentPage] = useState(1);
  const contributionsPerPage = 1;
  const totalPages = Math.max(
    1,
    Math.ceil(contributions.length / contributionsPerPage)
  );
  const currentContribution = contributions[currentPage - 1];

  // After all hooks and variable declarations, before return:
  useEffect(() => {
    async function fetchImageFromMetadata() {
      if (
        story?.contentType === ContentType.IMAGE &&
        currentContribution?.metadataURI
      ) {
        try {
          const ipfsUrl = currentContribution.metadataURI.startsWith("ipfs://")
            ? `https://ipfs.io/ipfs/${currentContribution.metadataURI.replace(
                "ipfs://",
                ""
              )}`
            : currentContribution.metadataURI;
          const res = await fetch(ipfsUrl);
          const metadata = await res.json();
          const content = metadata.content;
          const match = content.match(/\(ipfs:\/\/([^)]+)\)/);
          const ipfsImgHash = match ? match[1] : null;

          if (ipfsImgHash && typeof ipfsImgHash === "string") {
            const imageUrl = `https://ipfs.io/ipfs/${ipfsImgHash}`;
            setContributionImageUrl(imageUrl);
          } else {
            setContributionImageUrl(null);
          }
        } catch (err) {
          setContributionImageUrl(null);
        }
      } else {
        setContributionImageUrl(null);
      }
    }
    fetchImageFromMetadata();
  }, [story?.contentType, currentContribution?.metadataURI]);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const formatDate = (timestamp: bigint) => {
    // Convert from seconds to milliseconds for JavaScript Date
    // Smart contract timestamps are in seconds, but Date expects milliseconds
    const timestampMs = Number(timestamp) * 1000;
    return new Date(timestampMs).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatRewardPool = (amount: bigint) => {
    // Convert from wei to ETH
    const eth = Number(amount) / 1e18;
    return eth > 0 ? `${eth.toFixed(4)} ETH` : "No reward pool";
  };

  const getContentTypeLabel = (contentType: ContentType) => {
    switch (contentType) {
      case ContentType.TEXT:
        return "Text Story";
      case ContentType.IMAGE:
        return "Visual Story";
      case ContentType.VIDEO:
        return "Video Story";
      default:
        return "Unknown Type";
    }
  };

  const getContentTypeIcon = (contentType: ContentType) => {
    switch (contentType) {
      case ContentType.TEXT:
        return "📝";
      case ContentType.IMAGE:
        return "🖼️";
      case ContentType.VIDEO:
        return "🎥";
      default:
        return "📄";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !exists || !story) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4m0 0V24a6 6 0 0112 0v12m-6-8h4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Story Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "The story you're looking for doesn't exist or has been removed."}
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              ← Back to Explore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back to Explore */}
      <div className="mb-6">
        <Link
          to="/explore"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Explore
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Story Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {story.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <span>👤</span>
                  <span>By {formatAddress(story.creator)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>📅</span>
                  <span>Created {formatDate(story.createdAt)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>{getContentTypeIcon(story.contentType)}</span>
                  <span>{getContentTypeLabel(story.contentType)}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {story.isActive ? (
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                  Active
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full font-medium">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Story Stats */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Number(story.totalContributions)}
              </div>
              <div className="text-sm text-gray-600">Contributions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatRewardPool(story.rewardPool)}
              </div>
              <div className="text-sm text-gray-600">Reward Pool</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                #{story.id.toString()}
              </div>
              <div className="text-sm text-gray-600">Story ID</div>
            </div>
          </div>
        </div>

        {/* Story Content */}
        <div className="px-8 py-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              About This Story
            </h2>
            <p className="text-gray-700 leading-relaxed">{story.description}</p>
          </div>

          {/* Story Content & Contributions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Story Contributions
            </h2>
            {isLoadingContributions && <p>Loading contributions...</p>}
            {contributionsError && (
              <p className="text-red-500">
                Error loading contributions: {contributionsError.message}
              </p>
            )}
            {!isLoadingContributions && !contributionsError && (
              <>
                {contributions.length > 0 && currentContribution ? (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="mb-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">
                          Contribution #{Number(currentContribution.id)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          By {formatAddress(currentContribution.contributor)}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                      </div>
                    </div>
                    {/* Show image for IMAGE stories, otherwise show link or text */}
                    <div className="bg-white rounded-md p-4 border border-gray-200 min-h-[100px]">
                      {story.contentType === ContentType.IMAGE ? (
                        <div className="flex flex-col items-center">
                          {contributionImageUrl ? (
                            <img
                              src={contributionImageUrl}
                              alt="Story Contribution"
                              className="max-w-full max-h-96 rounded shadow"
                            />
                          ) : (
                            <p className="text-gray-500 italic">
                              Image not found in metadata.
                            </p>
                          )}
                          <a
                            href={
                              currentContribution.metadataURI.startsWith(
                                "ipfs://"
                              )
                                ? `https://ipfs.io/ipfs/${currentContribution.metadataURI.replace(
                                    "ipfs://",
                                    ""
                                  )}`
                                : currentContribution.metadataURI
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-xs text-blue-600 underline"
                          >
                            View Metadata on IPFS
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-600 italic">
                          Contribution content from IPFS for{" "}
                          <code className="text-xs bg-gray-100 p-1 rounded">
                            {currentContribution.metadataURI}
                          </code>{" "}
                          would be displayed here.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">
                      This story is just beginning.
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Be the first to add a chapter!
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-end items-center mt-4 space-x-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-4">
              {story.isActive && (
                <Link
                  to={`/story/${id}/contribute`}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
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
                  Contribute to Story
                </Link>
              )}
              <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors duration-200">
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                Add to Favorites
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
