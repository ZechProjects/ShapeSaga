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
        return "Comic";
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
    <div className="relative group">
      {/* Subtle book spine shadow effect */}
      <div className="absolute inset-0 bg-gray-200 rounded-r-md transform translate-x-0.5 translate-y-0.5"></div>

      {/* Main book cover */}
      <div className="relative bg-gradient-to-br from-stone-50 to-amber-50 border border-stone-200 rounded-md shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-full">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-50 pointer-events-none"></div>

        {/* Header strip */}
        <div className="relative bg-gradient-to-r from-stone-100 to-amber-100 p-3 border-b border-stone-200">
          <div className="flex items-center justify-between">
            {/* Active Tag */}
            {story.isActive && (
              <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded border border-green-200">
                Active
              </div>
            )}

            {/* Content Type Badge */}
            <div className="bg-white px-2 py-1 rounded border border-stone-200 shadow-sm">
              <span className="flex items-center space-x-1 text-sm font-medium text-stone-600">
                <span>{getContentTypeIcon(story.contentType)}</span>
                <span>{getContentTypeLabel(story.contentType)}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col relative">
          {/* Book Title */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 font-serif">
              {story.title}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">By</span>
              <span className="bg-stone-100 text-stone-700 text-sm px-2 py-1 rounded border border-stone-200">
                {formatAddress(story.creator)}
              </span>
            </div>
          </div>

          {/* Story Description */}
          <div className="mb-4">
            <div className="bg-white/60 p-3 rounded border border-stone-200">
              <p className="text-gray-700 line-clamp-3">{story.description}</p>
            </div>
          </div>

          {/* Story Stats */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded border border-blue-200">
              <span className="flex items-center space-x-1 text-sm">
                <span>📚</span>
                <span>
                  {Number(story.totalContributions)}{" "}
                  {Number(story.totalContributions) === 1
                    ? "Chapter"
                    : "Chapters"}
                </span>
              </span>
            </div>
            <div className="bg-green-50 text-green-700 px-3 py-1 rounded border border-green-200">
              <span className="flex items-center space-x-1 text-sm">
                <span>💰</span>
                <span>{formatRewardPool(story.rewardPool)}</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 mt-auto">
            <Link
              to={`/story/${story.id}`}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors duration-200"
            >
              📖 Read Story
            </Link>

            {story.isActive && (
              <Link
                to={`/story/${story.id}/contribute`}
                className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 font-medium rounded border border-amber-200 hover:bg-amber-200 transition-colors duration-200"
              >
                ✏️ Contribute
              </Link>
            )}
          </div>
        </div>

        {/* Subtle book pages effect */}
        <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-stone-100 to-stone-200 border-l border-stone-200"></div>

        {/* Creation Date */}
        <div className="bg-stone-100 p-2 mt-auto border-t border-stone-200">
          <div className="text-center">
            <span className="text-stone-600 text-xs font-medium">
              Created {formatDate(story.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
