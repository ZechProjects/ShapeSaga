import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gradient mb-6">
        Welcome to ShapeSaga
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        AI-powered collaborative storytelling on Shape Network
      </p>
      <div className="space-x-4">
        <Link to="/explore" className="btn-primary">
          Explore Stories
        </Link>
        <Link to="/create" className="btn-outline">
          Create Story
        </Link>
      </div>
    </div>
  );
}
