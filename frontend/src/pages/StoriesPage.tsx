import { useState } from "react";
import { useStories } from "../hooks/useStories";
import { StoryCard } from "../components/StoryCard";
import { ContentType } from "../lib/contracts";

export function StoriesPage() {
  const { stories, isLoading, error, totalCount } = useStories();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContentType, setSelectedContentType] = useState<
    ContentType | "all"
  >("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "contributions">(
    "newest"
  );

  // Filter stories based on search term and content type
  const filteredStories = stories
    .filter((story) => {
      const matchesSearch =
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesContentType =
        selectedContentType === "all" ||
        story.contentType === selectedContentType;
      return matchesSearch && matchesContentType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return Number(b.createdAt - a.createdAt);
        case "oldest":
          return Number(a.createdAt - b.createdAt);
        case "contributions":
          return Number(b.totalContributions - a.totalContributions);
        default:
          return 0;
      }
    });

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading stories
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stories</h1>
        <p className="text-gray-600">
          Discover collaborative stories from the ShapeSaga community
        </p>
        <div className="mt-4 text-sm text-gray-500">
          {totalCount} {totalCount === 1 ? "story" : "stories"} available
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search stories..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          {/* Content Type Filter */}
          <select
            value={selectedContentType}
            onChange={(e) =>
              setSelectedContentType(e.target.value as ContentType | "all")
            }
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value={ContentType.TEXT}>📝 Text</option>
            <option value={ContentType.IMAGE}>🖼️ Image</option>
            <option value={ContentType.VIDEO}>🎥 Video</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "newest" | "oldest" | "contributions")
            }
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="contributions">Most Contributions</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading stories...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredStories.length === 0 && (
        <div className="text-center py-12">
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No stories found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedContentType !== "all"
              ? "Try adjusting your search or filters"
              : "Be the first to create a story!"}
          </p>
          {!searchTerm && selectedContentType === "all" && (
            <button
              onClick={() => (window.location.href = "/create")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Create Your First Story
            </button>
          )}
        </div>
      )}

      {/* Stories Grid */}
      {!isLoading && filteredStories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <StoryCard key={story.id.toString()} story={story} />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && filteredStories.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {filteredStories.length} of {stories.length} stories
        </div>
      )}
    </div>
  );
}
