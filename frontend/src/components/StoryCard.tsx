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
        return "🎨";
      case ContentType.VIDEO:
        return "🎬";
      default:
        return "📄";
    }
  };

  const getContentSpecificLabel = (contentType: ContentType, count: number) => {
    switch (contentType) {
      case ContentType.TEXT:
        return count === 1 ? "Chapter" : "Chapters";
      case ContentType.IMAGE:
        return count === 1 ? "Panel" : "Panels";
      case ContentType.VIDEO:
        return count === 1 ? "Scene" : "Scenes";
      default:
        return count === 1 ? "Part" : "Parts";
    }
  };

  const getCardStyles = (contentType: ContentType) => {
    switch (contentType) {
      case ContentType.TEXT:
        return {
          shadow: "bg-gray-200",
          gradient: "bg-gradient-to-br from-stone-50 to-amber-50",
          border: "border-stone-200",
          headerGradient: "bg-gradient-to-r from-stone-100 to-amber-100",
          headerBorder: "border-stone-200",
          accent: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case ContentType.IMAGE:
        return {
          shadow: "bg-purple-200",
          gradient: "bg-gradient-to-br from-purple-50 to-pink-50",
          border: "border-purple-200",
          headerGradient: "bg-gradient-to-r from-purple-100 to-pink-100",
          headerBorder: "border-purple-200",
          accent: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case ContentType.VIDEO:
        return {
          shadow: "bg-red-200",
          gradient: "bg-gradient-to-br from-red-50 to-orange-50",
          border: "border-red-200",
          headerGradient: "bg-gradient-to-r from-red-100 to-orange-100",
          headerBorder: "border-red-200",
          accent: "bg-red-50 text-red-700 border-red-200",
        };
      default:
        return {
          shadow: "bg-gray-200",
          gradient: "bg-gradient-to-br from-stone-50 to-amber-50",
          border: "border-stone-200",
          headerGradient: "bg-gradient-to-r from-stone-100 to-amber-100",
          headerBorder: "border-stone-200",
          accent: "bg-blue-50 text-blue-700 border-blue-200",
        };
    }
  };

  const getActionButtonStyles = (contentType: ContentType) => {
    switch (contentType) {
      case ContentType.TEXT:
        return {
          primary: "bg-blue-600 hover:bg-blue-700",
          secondary:
            "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200",
        };
      case ContentType.IMAGE:
        return {
          primary: "bg-purple-600 hover:bg-purple-700",
          secondary:
            "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200",
        };
      case ContentType.VIDEO:
        return {
          primary: "bg-red-600 hover:bg-red-700",
          secondary: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
        };
      default:
        return {
          primary: "bg-blue-600 hover:bg-blue-700",
          secondary:
            "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200",
        };
    }
  };

  const cardStyles = getCardStyles(story.contentType);
  const buttonStyles = getActionButtonStyles(story.contentType);

  return (
    <div className="relative group">
      {/* Subtle book spine shadow effect */}
      <div
        className={`absolute inset-0 ${cardStyles.shadow} rounded-r-md transform translate-x-0.5 translate-y-0.5`}
      ></div>

      {/* Main book cover */}
      <div
        className={`relative ${cardStyles.gradient} border ${cardStyles.border} rounded-md shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-full`}
      >
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-50 pointer-events-none"></div>

        {/* Header strip */}
        <div
          className={`relative ${cardStyles.headerGradient} p-3 border-b ${cardStyles.headerBorder}`}
        >
          <div className="flex items-center justify-between">
            {/* Active Tag */}
            {story.isActive && (
              <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded border border-green-200">
                Active
              </div>
            )}

            {/* Content Type Badge */}
            <div
              className={`bg-white px-2 py-1 rounded border ${cardStyles.headerBorder} shadow-sm`}
            >
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
            <div
              className={`bg-white/60 p-3 rounded border ${cardStyles.headerBorder}`}
            >
              <p className="text-gray-700 line-clamp-3">{story.description}</p>
            </div>
          </div>

          {/* Story Stats */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className={`${cardStyles.accent} px-3 py-1 rounded`}>
              <span className="flex items-center space-x-1 text-sm">
                <span>📚</span>
                <span>
                  {Number(story.totalContributions)}{" "}
                  {getContentSpecificLabel(
                    story.contentType,
                    Number(story.totalContributions)
                  )}
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
              className={`flex-1 inline-flex items-center justify-center px-4 py-2 ${buttonStyles.primary} text-white font-medium rounded transition-colors duration-200`}
            >
              📖 View
            </Link>

            {story.isActive && (
              <Link
                to={`/story/${story.id}/contribute`}
                className={`inline-flex items-center px-4 py-2 ${buttonStyles.secondary} font-medium rounded border transition-colors duration-200`}
              >
                ✏️ Contribute
              </Link>
            )}
          </div>
        </div>

        {/* Subtle book pages effect */}
        <div
          className={`absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-stone-100 to-stone-200 border-l ${cardStyles.headerBorder}`}
        ></div>

        {/* Creation Date */}
        <div
          className={`${cardStyles.headerGradient} p-2 mt-auto border-t ${cardStyles.headerBorder}`}
        >
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
