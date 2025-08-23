import { Link } from "react-router-dom";
import { Story, ContentType } from "../lib/contracts";

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const formatDate = (timestamp: bigint) => {
    // Convert from seconds to milliseconds for JavaScript Date
    // Smart contract timestamps are in seconds, but Date expects milliseconds
    const timestampMs = Number(timestamp) * 1000;
    return new Date(timestampMs).toLocaleDateString();
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
        return "Text";
      case ContentType.IMAGE:
        return "Image";
      case ContentType.VIDEO:
        return "Video";
      default:
        return "Unknown";
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

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        {/* Story Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
              {story.title}
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              By {formatAddress(story.creator)}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded-full flex items-center space-x-1">
              <span>{getContentTypeIcon(story.contentType)}</span>
              <span>{getContentTypeLabel(story.contentType)}</span>
            </span>
          </div>
        </div>

        {/* Story Description */}
        <p className="text-gray-700 mb-4 line-clamp-3">{story.description}</p>

        {/* Story Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span>📚</span>
              <span>{Number(story.totalContributions)} contributions</span>
            </span>
            <span className="flex items-center space-x-1">
              <span>💰</span>
              <span>{formatRewardPool(story.rewardPool)}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs">
              Created {formatDate(story.createdAt)}
            </span>
            {story.isActive && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Link
            to={`/story/${story.id}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Read Story
          </Link>

          <div className="flex items-center space-x-2">
            {story.isActive && (
              <button className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors duration-200">
                Contribute
              </button>
            )}
            <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zM8 13a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
