import { Link } from "react-router-dom";
import { useStories } from "../hooks/useStories";
import { StoryCard } from "../components/StoryCard";
import { Story } from "../lib/contracts";

export function HomePage() {
  const { stories, isLoading, error } = useStories();

  // Get latest 3 stories (already sorted by creation date in the hook)
  const latestStories = stories.slice(0, 3);

  // Get top 3 most popular stories (sorted by total contributions)
  const popularStories = [...stories]
    .sort((a, b) => Number(b.totalContributions) - Number(a.totalContributions))
    .slice(0, 3);

  const renderStoriesSection = (
    title: string,
    storiesData: Story[],
    emptyMessage: string
  ) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading stories: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      ) : storiesData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storiesData.map((story) => (
            <StoryCard key={story.id.toString()} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600">
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
          Welcome to ShapeSaga
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          AI-powered collaborative storytelling on Shape Network. Create,
          contribute, and explore interactive stories with the community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/explore" className="btn-primary">
            Explore All Stories
          </Link>
          <Link to="/create" className="btn-outline">
            Create Your Story
          </Link>
        </div>
      </div>

      {/* Latest Stories Section */}
      {renderStoriesSection(
        "✨ Latest Stories",
        latestStories,
        "No stories available yet. Be the first to create one!"
      )}

      {/* Popular Stories Section */}
      {renderStoriesSection(
        "🔥 Most Popular Stories",
        popularStories,
        "No popular stories yet. Start contributing to make stories popular!"
      )}

      {/* Call to Action Section */}
      <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Start Your Adventure?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join our community of storytellers and help shape the future of
          collaborative narratives. Every contribution matters and can earn
          rewards!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/create" className="btn-primary">
            Create a Story
          </Link>
          <Link to="/explore" className="btn-outline">
            Browse Stories
          </Link>
        </div>
      </div>
    </div>
  );
}
