import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Address, isAddress } from "viem";
import { useContributor } from "../hooks/useContributor";
import { StoryCard } from "../components/StoryCard";
import { formatEther } from "viem";

export function ContributorProfilePage() {
  const { address } = useParams<{ address: string }>();
  const [activeTab, setActiveTab] = useState<
    "overview" | "stories" | "contributions" | "activity"
  >("overview");

  // Call hooks before any early returns
  const { contributorProfile, isLoading, error } = useContributor(
    (address && isAddress(address)
      ? address
      : "0x0000000000000000000000000000000000000000") as Address
  );

  // Validate address after hooks
  if (!address || !isAddress(address)) {
    return <Navigate to="/contributors" replace />;
  }

  const formatAddress = (addr: Address) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

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
                Error loading contributor profile
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error?.message || "Failed to load contributor data"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">
            Loading contributor profile...
          </span>
        </div>
      </div>
    );
  }

  if (!contributorProfile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Contributor Not Found
          </h3>
          <p className="text-gray-500 mb-6">
            This address hasn't created any stories or contributions yet.
          </p>
          <Link
            to="/contributors"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Contributors
          </Link>
        </div>
      </div>
    );
  }

  const totalActivity =
    contributorProfile.totalStories + contributorProfile.totalContributions;
  const totalRewardPool = contributorProfile.createdStories.reduce(
    (sum, story) => sum + story.rewardPool,
    0n
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          to="/contributors"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
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
          Back to Contributors
        </Link>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start space-x-4 mb-6 lg:mb-0">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">
                {address.slice(2, 4).toUpperCase()}
              </span>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Contributor Profile
              </h1>
              <div className="flex items-center space-x-2 mb-3">
                <p className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {formatAddress(address as Address)}
                </p>
                <button
                  onClick={() => copyToClipboard(address)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy full address"
                >
                  <svg
                    className="w-4 h-4"
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
                </button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>Joined {formatDate(contributorProfile.joinedAt)}</span>
                <span>•</span>
                <span>
                  Last active{" "}
                  {formatRelativeTime(contributorProfile.lastActivityAt)}
                </span>
                <span>•</span>
                <span className="font-medium">
                  {totalActivity} total activities
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-2 text-right">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {contributorProfile.totalStories}
              </div>
              <div className="text-xs text-blue-700">Stories Created</div>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {contributorProfile.totalContributions}
              </div>
              <div className="text-xs text-green-700">Contributions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Net Votes</p>
              <p
                className={`text-2xl font-semibold ${
                  contributorProfile.netVotes >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {contributorProfile.netVotes >= 0 ? "+" : ""}
                {contributorProfile.netVotes}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <span className="text-green-600 mr-2">
              ↑{contributorProfile.totalUpvotes}
            </span>
            <span className="text-red-600">
              ↓{contributorProfile.totalDownvotes}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Stories Contributed To
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {contributorProfile.contributedStories.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Avg. Votes per Contribution
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {contributorProfile.averageVotesPerContribution.toFixed(1)}
              </p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Reward Pool
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {Number(formatEther(totalRewardPool)).toFixed(4)} ETH
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", label: "Overview", count: null },
              {
                id: "stories",
                label: "Created Stories",
                count: contributorProfile.totalStories,
              },
              {
                id: "contributions",
                label: "Contributions",
                count: contributorProfile.totalContributions,
              },
              { id: "activity", label: "Activity", count: null },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Top Contributed Story */}
          {contributorProfile.topContributedStory && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Most Active Story
              </h3>
              <StoryCard story={contributorProfile.topContributedStory} />
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                ...contributorProfile.allContributions,
                ...contributorProfile.createdStories.map((story) => ({
                  ...story,
                  isStory: true,
                })),
              ]
                .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
                .slice(0, 5)
                .map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 text-sm"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        (item as any).isStory ? "bg-blue-500" : "bg-green-500"
                      }`}
                    ></div>
                    <span className="text-gray-500">
                      {formatRelativeTime(
                        new Date(Number(item.createdAt) * 1000).toISOString()
                      )}
                    </span>
                    <span className="text-gray-900">
                      {(item as any).isStory
                        ? `Created story "${(item as any).title}"`
                        : `Contributed to Story #${(
                            item as any
                          ).storyId.toString()}`}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "stories" && (
        <div>
          {contributorProfile.createdStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contributorProfile.createdStories.map((story) => (
                <StoryCard key={story.id.toString()} story={story} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Stories Created
              </h3>
              <p className="text-gray-500">
                This contributor hasn't created any stories yet.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "contributions" && (
        <div>
          {contributorProfile.allContributions.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  All Contributions
                </h3>
                <div className="space-y-4">
                  {contributorProfile.allContributions.map((contribution) => (
                    <div
                      key={contribution.id.toString()}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              Contribution #{contribution.id.toString()}
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <Link
                              to={`/story/${contribution.storyId.toString()}`}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Story #{contribution.storyId.toString()}
                            </Link>
                            {contribution.isBranch && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Branch
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            {formatDate(
                              new Date(
                                Number(contribution.createdAt) * 1000
                              ).toISOString()
                            )}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center text-green-600">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {contribution.upvotes.toString()}
                          </span>
                          <span className="flex items-center text-red-600">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 112 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {contribution.downvotes.toString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Contributions
              </h3>
              <p className="text-gray-500">
                This contributor hasn't made any contributions yet.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Activity Timeline
          </h3>

          {/* Simple activity chart representation */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Monthly Contributions
              </h4>
              <div className="space-y-2">
                {Object.entries(contributorProfile.contributionsByMonth)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 6)
                  .map(([month, count]) => (
                    <div key={month} className="flex items-center">
                      <div className="w-16 text-sm text-gray-500">{month}</div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (count /
                                  Math.max(
                                    ...Object.values(
                                      contributorProfile.contributionsByMonth
                                    )
                                  )) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-8 text-sm text-gray-700 text-right">
                        {count}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Monthly Stories Created
              </h4>
              <div className="space-y-2">
                {Object.entries(contributorProfile.storiesByMonth)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 6)
                  .map(([month, count]) => (
                    <div key={month} className="flex items-center">
                      <div className="w-16 text-sm text-gray-500">{month}</div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (count /
                                  Math.max(
                                    ...Object.values(
                                      contributorProfile.storiesByMonth
                                    )
                                  )) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-8 text-sm text-gray-700 text-right">
                        {count}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
