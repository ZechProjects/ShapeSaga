import { Link } from "react-router-dom";

export function ExplorePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Explore ShapeSaga
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover collaborative stories and meet the creative minds behind
          them. Choose what you'd like to explore below.
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Stories Card */}
        <Link
          to="/stories"
          className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-8 border border-gray-200 hover:border-blue-300"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 group-hover:bg-blue-200 transition-colors duration-200">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Stories</h2>
            <p className="text-gray-600 mb-6">
              Browse collaborative stories created by the community. Filter by
              content type, sort by popularity, and dive into amazing
              narratives.
            </p>
            <div className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-200">
              Explore Stories →
            </div>
          </div>
        </Link>

        {/* Contributors Card */}
        <Link
          to="/contributors"
          className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-8 border border-gray-200 hover:border-green-300"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 group-hover:bg-green-200 transition-colors duration-200">
              <svg
                className="w-8 h-8 text-green-600"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Contributors
            </h2>
            <p className="text-gray-600 mb-6">
              Meet the creative minds behind ShapeSaga. Discover top
              contributors, see their activity, and connect with fellow
              storytellers.
            </p>
            <div className="text-green-600 font-medium group-hover:text-green-700 transition-colors duration-200">
              Meet Contributors →
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="mt-12 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Stories</div>
            <div className="text-2xl font-bold text-gray-900">
              Collaborative
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Community</div>
            <div className="text-2xl font-bold text-gray-900">Driven</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Creativity</div>
            <div className="text-2xl font-bold text-gray-900">Unlimited</div>
          </div>
        </div>
      </div>
    </div>
  );
}
