import { useState } from "react";
import { useContributors } from "../hooks/useContributors";
import { ContributorCard } from "../components/ContributorCard";

export function ContributorsPage() {
  const { contributors, isLoading, error, totalCount } = useContributors();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "activity" | "stories" | "contributions" | "votes" | "newest"
  >("activity");

  // Filter contributors based on search term
  const filteredContributors = contributors
    .filter((contributor) => {
      const matchesSearch = contributor.address
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "activity":
          const aActivity = a.totalStories + a.totalContributions;
          const bActivity = b.totalStories + b.totalContributions;
          return bActivity - aActivity;
        case "stories":
          return b.totalStories - a.totalStories;
        case "contributions":
          return b.totalContributions - a.totalContributions;
        case "votes":
          const aVotes = a.totalUpvotes - a.totalDownvotes;
          const bVotes = b.totalUpvotes - b.totalDownvotes;
          return bVotes - aVotes;
        case "newest":
          if (!a.joinedAt || !b.joinedAt) return 0;
          return (
            new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
          );
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
                Error loading contributors
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error?.message || "Failed to load contributors"}</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contributors</h1>
        <p className="text-gray-600">
          Meet the amazing community members building stories together
        </p>
        <div className="mt-4 text-sm text-gray-500">
          {totalCount} {totalCount === 1 ? "contributor" : "contributors"} in
          the community
        </div>
      </div>

      {/* Stats Overview */}
      {!isLoading && contributors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {contributors.reduce((sum, c) => sum + c.totalStories, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Stories Created</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {contributors.reduce((sum, c) => sum + c.totalContributions, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Contributions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">
              {contributors.reduce((sum, c) => sum + c.totalUpvotes, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Upvotes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-indigo-600">
              {
                contributors.filter(
                  (c) => c.totalStories + c.totalContributions > 1
                ).length
              }
            </div>
            <div className="text-sm text-gray-500">Active Contributors</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
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
              placeholder="Search contributors by address..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Sort Filter */}
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | "activity"
                  | "stories"
                  | "contributions"
                  | "votes"
                  | "newest"
              )
            }
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="activity">Most Active</option>
            <option value="stories">Most Stories</option>
            <option value="contributions">Most Contributions</option>
            <option value="votes">Highest Rated</option>
            <option value="newest">Recently Joined</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading contributors...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredContributors.length === 0 && (
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
                d="M17 20h5m-2.5-5v10m0 0c0 2.5 0 5 2.5 5h7.5s2.5-2.5 2.5-5v-10c0-2.5-2.5-5-5-5h-5c-2.5 0-5 2.5-5 5v10z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No contributors found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? "Try adjusting your search term"
              : "Be the first to contribute to a story!"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => (window.location.href = "/stories")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Explore Stories
            </button>
          )}
        </div>
      )}

      {/* Contributors Grid */}
      {!isLoading && filteredContributors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContributors.map((contributor) => (
            <ContributorCard
              key={contributor.address}
              contributor={contributor}
            />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && filteredContributors.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {filteredContributors.length} of {contributors.length}{" "}
          contributors
        </div>
      )}
    </div>
  );
}
