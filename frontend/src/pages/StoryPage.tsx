import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useStory } from "../hooks/useStory";
import { useContributionTree } from "../hooks/useContributionTree";
import { useStoryTreeMetrics } from "../hooks/useStoryTreeMetrics";
import { useFavorites } from "../hooks/useFavorites";
import { ContentType } from "../lib/contracts";
import { ContributionTree } from "../components/ContributionTree";
import { ContributionViewer } from "../components/ContributionViewer";

export function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const { story, isLoading, error, exists } = useStory(id);
  const {
    tree: contributionTree,
    allContributions,
    isLoading: isLoadingContributions,
    error: contributionsError,
  } = useContributionTree(id);
  const { metrics: treeMetrics, isLoading: isLoadingMetrics } =
    useStoryTreeMetrics(id);
  const { isFavorite, toggleFavorite } = useFavorites();

  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isTreeExpanded, setIsTreeExpanded] = useState(false);
  const [shareButtonText, setShareButtonText] = useState("Share");

  // Select the first contribution by default when tree loads
  useEffect(() => {
    if (contributionTree.length > 0 && !selectedNode) {
      setSelectedNode(contributionTree[0]);
    }
  }, [contributionTree, selectedNode]);

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

  // Helper function to calculate max depth in a tree
  const getMaxDepth = (node: any): number => {
    if (!node.children || node.children.length === 0) {
      return node.level;
    }
    return Math.max(
      node.level,
      ...node.children.map((child: any) => getMaxDepth(child))
    );
  };

  // Helper function to filter tree to maximum depth of 5 levels
  const filterTreeByDepth = (nodes: any[], maxDepth: number = 5): any[] => {
    const filterNode = (node: any): any => {
      if (node.level >= maxDepth) {
        // Return node without children if at max depth
        return {
          ...node,
          children: [],
        };
      }

      // Recursively filter children
      return {
        ...node,
        children: node.children ? node.children.map(filterNode) : [],
      };
    };

    return nodes.map(filterNode);
  };

  // Helper function to find a node's parent in the tree
  const findParentNode = (nodeId: string, tree: any[]): any | null => {
    const findParent = (nodes: any[], targetId: string): any | null => {
      for (const node of nodes) {
        if (
          node.children &&
          node.children.some(
            (child: any) => child.contribution.id.toString() === targetId
          )
        ) {
          return node;
        }
        if (node.children) {
          const found = findParent(node.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    return findParent(tree, nodeId);
  };

  // Navigation helpers
  const getNavigationOptions = (currentNode: any) => {
    if (!currentNode) return { parent: null, children: [] };

    const parent = findParentNode(
      currentNode.contribution.id.toString(),
      contributionTree
    );
    const children = currentNode.children || [];

    return { parent, children };
  };

  // Handle adding/removing story from favorites
  const handleToggleFavorite = () => {
    if (!story || !id) return;

    const favoriteStory = {
      id,
      title: story.title,
      creator: story.creator,
      createdAt: story.createdAt.toString(),
    };

    toggleFavorite(favoriteStory);
  };

  // Handle sharing the current page URL
  const handleShare = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setShareButtonText("Copied!");
      setTimeout(() => setShareButtonText("Share"), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
      // Fallback for browsers that don't support clipboard API
      setShareButtonText("Copy failed");
      setTimeout(() => setShareButtonText("Share"), 2000);
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
              to="/stories"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              ← Back to Stories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back to Stories */}
      <div className="mb-6">
        <Link
          to="/stories"
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
          Back to Stories
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {!isLoadingMetrics && treeMetrics
                  ? Number(treeMetrics.totalContributions)
                  : allContributions.length}
              </div>
              <div className="text-sm text-gray-600">Total Contributions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {!isLoadingMetrics && treeMetrics
                  ? Number(treeMetrics.rootContributions)
                  : contributionTree.length}
              </div>
              <div className="text-sm text-gray-600">Root Paths</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {!isLoadingMetrics && treeMetrics
                  ? Number(treeMetrics.branchCount)
                  : allContributions.filter((c) => c.isBranch).length}
              </div>
              <div className="text-sm text-gray-600">Branches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {!isLoadingMetrics && treeMetrics
                  ? Number(treeMetrics.maxDepth)
                  : Math.max(...contributionTree.map((n) => getMaxDepth(n)), 0)}
              </div>
              <div className="text-sm text-gray-600">Max Depth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {formatRewardPool(story.rewardPool)}
              </div>
              <div className="text-sm text-gray-600">Reward Pool</div>
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
            {isLoadingContributions && (
              <div className="text-center py-8">
                <div className="animate-pulse">Loading contributions...</div>
              </div>
            )}

            {contributionsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">
                  Error loading contributions: {contributionsError.message}
                </p>
              </div>
            )}

            {!isLoadingContributions && !contributionsError && (
              <div className="space-y-6">
                {/* Tree Structure */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <button
                      onClick={() => setIsTreeExpanded(!isTreeExpanded)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">
                        Table of Contents
                      </h3>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                          isTreeExpanded ? "rotate-180" : ""
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
                  </div>
                  {isTreeExpanded && (
                    <div className="p-4">
                      <ContributionTree
                        nodes={filterTreeByDepth(contributionTree, 5)}
                        onSelectNode={setSelectedNode}
                        selectedNodeId={selectedNode?.contribution.id.toString()}
                        storyContentType={
                          story?.contentType || ContentType.TEXT
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Content Viewer */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Navigation Header */}
                  {selectedNode && (
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Contents
                      </h3>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <ContributionViewer
                      node={selectedNode}
                      storyContentType={story?.contentType || ContentType.TEXT}
                      storyId={id}
                    />

                    {/* Navigation Controls Below Content */}
                    {selectedNode && (
                      <div className="mt-6 space-y-4">
                        {(() => {
                          const { parent, children } =
                            getNavigationOptions(selectedNode);
                          return (
                            <>
                              {/* Back and Next Navigation */}
                              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                {/* Back Button */}
                                {parent ? (
                                  <button
                                    onClick={() => setSelectedNode(parent)}
                                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
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
                                    Back
                                  </button>
                                ) : (
                                  <div></div>
                                )}

                                {/* Next Buttons */}
                                {children.length > 0 && (
                                  <div className="flex items-center space-x-2">
                                    {children.length === 1 ? (
                                      <button
                                        onClick={() =>
                                          setSelectedNode(children[0])
                                        }
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                      >
                                        Continue
                                        <svg
                                          className="w-4 h-4 ml-2"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                          />
                                        </svg>
                                      </button>
                                    ) : (
                                      children
                                        .slice(0, 3)
                                        .map((child: any, index: number) => (
                                          <button
                                            key={child.contribution.id}
                                            onClick={() =>
                                              setSelectedNode(child)
                                            }
                                            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors duration-200"
                                            title={
                                              child.contribution.title ||
                                              "Untitled Contribution"
                                            }
                                          >
                                            {child.contribution.title
                                              ? child.contribution.title.substring(
                                                  0,
                                                  15
                                                ) +
                                                (child.contribution.title
                                                  .length > 15
                                                  ? "..."
                                                  : "")
                                              : `Path ${index + 1}`}
                                          </button>
                                        ))
                                    )}
                                    {children.length > 3 && (
                                      <span className="text-sm text-gray-500">
                                        +{children.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
              <button
                onClick={handleToggleFavorite}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  id && isFavorite(id)
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill={id && isFavorite(id) ? "currentColor" : "none"}
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
                {id && isFavorite(id)
                  ? "Remove from Favorites"
                  : "Add to Favorites"}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                title="Share this story"
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
                {shareButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
