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
        <button className="btn-primary">Explore Stories</button>
        <button className="btn-outline">Create Story</button>
      </div>
    </div>
  );
}
