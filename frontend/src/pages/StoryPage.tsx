import { useParams } from "react-router-dom";

export function StoryPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Story Details</h1>

        <div className="text-gray-600">
          <p className="mb-4">
            Story ID: <span className="font-mono text-blue-600">{id}</span>
          </p>
          <p className="text-lg">
            This page will display the details of the selected story, including:
          </p>
          <ul className="mt-4 ml-6 list-disc space-y-2">
            <li>Story title and description</li>
            <li>Author information</li>
            <li>Chapters and story progress</li>
            <li>Reader interactions and comments</li>
            <li>Contribution opportunities</li>
            <li>Story statistics and ratings</li>
          </ul>
          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <p className="text-blue-800 font-medium">
              🚧 Coming Soon - Story viewing functionality will be implemented
              here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
