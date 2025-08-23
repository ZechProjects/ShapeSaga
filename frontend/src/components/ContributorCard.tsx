import { Address } from "viem";
import { Link } from "react-router-dom";
import { Contributor } from "../hooks/useContributors";

interface ContributorCardProps {
  contributor: Contributor;
}

export function ContributorCard({ contributor }: ContributorCardProps) {
  const formatAddress = (address: Address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString();
  };

  const totalActivity =
    contributor.totalStories + contributor.totalContributions;
  const netVotes = contributor.totalUpvotes - contributor.totalDownvotes;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Avatar placeholder */}
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {contributor.address.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {formatAddress(contributor.address)}
            </h3>
            <p className="text-sm text-gray-500">
              Joined {formatDate(contributor.joinedAt)}
            </p>
          </div>
        </div>

        {/* Activity score badge */}
        <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {totalActivity} activities
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {contributor.totalStories}
          </div>
          <div className="text-sm text-gray-500">
            {contributor.totalStories === 1 ? "Story" : "Stories"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {contributor.totalContributions}
          </div>
          <div className="text-sm text-gray-500">Contributions</div>
        </div>
      </div>

      {/* Voting stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <svg
              className="w-4 h-4 text-green-500 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {contributor.totalUpvotes}
          </span>
          <span className="flex items-center">
            <svg
              className="w-4 h-4 text-red-500 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 112 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {contributor.totalDownvotes}
          </span>
        </div>
        <div
          className={`font-medium ${
            netVotes >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {netVotes >= 0 ? "+" : ""}
          {netVotes} net votes
        </div>
      </div>

      {/* Recent activity */}
      {contributor.recentContributions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Recent Contributions
          </h4>
          <div className="space-y-1">
            {contributor.recentContributions.slice(0, 3).map((contribution) => (
              <div
                key={contribution.id.toString()}
                className="text-xs text-gray-500 truncate"
              >
                #{contribution.id.toString()} in Story #
                {contribution.storyId.toString()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => navigator.clipboard.writeText(contributor.address)}
            className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-md transition-colors duration-200"
          >
            Copy Address
          </button>
          <Link
            to={`/contributor/${contributor.address}`}
            className="flex-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-md transition-colors duration-200 text-center"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
