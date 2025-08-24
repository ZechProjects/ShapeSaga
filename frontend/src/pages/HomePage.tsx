import { Link } from "react-router-dom";
import { useStories } from "../hooks/useStories";
import { StoryCard } from "../components/StoryCard";
import { Story } from "../lib/contracts";
import { useState, useEffect } from "react";

export function HomePage() {
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const { stories, isLoading, error } = useStories(lastRefresh);

  // Auto-refresh every 30 seconds (less aggressive than continuous polling)
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(Date.now());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Manual refresh function
  const handleRefresh = () => {
    setLastRefresh(Date.now());
  };

  // Get latest 3 stories (already sorted by creation date in the hook)
  const latestStories = stories.slice(0, 3);

  // Get top 3 most popular stories (sorted by total contributions)
  const popularStories = [...stories]
    .sort((a, b) => Number(b.totalContributions) - Number(a.totalContributions))
    .slice(0, 3);

  const storyElements = [
    "Once upon a time...",
    "In a land far away...",
    "Chapter One",
    "The End",
    "To be continued...",
    "Meanwhile...",
    "✨ Magic happens ✨",
    "📚 Stories unfold",
    "🌟 Dreams come alive",
    "🔮 Imagination flows",
  ];

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
    <div className="storytelling-bg min-h-screen">
      {/* Magical sparkle overlay */}
      <div className="sparkle-overlay"></div>

      {/* Floating story elements */}
      {storyElements.map((element, index) => (
        <div key={index} className="story-element">
          {element}
        </div>
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Welcome to ShapeSaga
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered collaborative storytelling on Shape Network. Create,
            contribute, and explore interactive stories with the community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/stories" className="btn-primary">
              Explore All Stories
            </Link>
            <Link to="/create" className="btn-outline">
              Create Your Story
            </Link>
            <button
              onClick={handleRefresh}
              className="btn-outline flex items-center justify-center gap-2"
              title="Refresh stories"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
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
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-12 backdrop-blur-sm bg-opacity-80">
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
            <Link to="/stories" className="btn-outline">
              Browse Stories
            </Link>
          </div>
        </div>

        {/* Shape Network Credit Section */}
        <div className="text-center py-12 border-t border-gray-200 bg-white/50 backdrop-blur-sm rounded-lg">
          <div className="max-w-2xl mx-auto">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Powered by Shape Network
            </h4>
            <p className="text-gray-600 mb-4">
              ShapeSaga is built on the innovative Shape Network blockchain,
              enabling secure, decentralized storytelling and community rewards.
            </p>
            <a
              href="https://shape.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Learn more about Shape Network
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
