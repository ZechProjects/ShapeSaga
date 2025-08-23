import React, { useState } from "react";

interface StoryFormData {
  name: string;
  medium: "text" | "comic" | "video";
  mainCharacters: number;
  secondaryCharacters: number;
  worldTheme: string;
  timeline: string;
  maxChapters: number | "unlimited";
  maxBranchesPerChapter: number | "unlimited";
  description: string;
  genre: string;
  targetAudience: "children" | "teen" | "adult" | "all";
  language: string;
  estimatedDuration: string;
  collaborationMode: "open" | "invite-only" | "solo";
}

export function CreateStoryPage() {
  const [formData, setFormData] = useState<StoryFormData>({
    name: "",
    medium: "text",
    mainCharacters: 1,
    secondaryCharacters: 0,
    worldTheme: "",
    timeline: "",
    maxChapters: 5,
    maxBranchesPerChapter: 1,
    description: "",
    genre: "",
    targetAudience: "all",
    language: "English",
    estimatedDuration: "",
    collaborationMode: "open",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        value === "unlimited"
          ? "unlimited"
          : (name === "mainCharacters" ||
              name === "secondaryCharacters" ||
              name === "maxChapters" ||
              name === "maxBranchesPerChapter") &&
            value !== "unlimited"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement actual story creation logic
      console.log("Creating story with data:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("Story created successfully!");

      // Reset form
      setFormData({
        name: "",
        medium: "text",
        mainCharacters: 1,
        secondaryCharacters: 0,
        worldTheme: "",
        timeline: "",
        maxChapters: 5,
        maxBranchesPerChapter: 1,
        description: "",
        genre: "",
        targetAudience: "all",
        language: "English",
        estimatedDuration: "",
        collaborationMode: "open",
      });
    } catch (error) {
      console.error("Error creating story:", error);
      alert("Error creating story. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Create Your Story
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Story Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your story name"
                />
              </div>

              <div>
                <label
                  htmlFor="medium"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Medium Type *
                </label>
                <select
                  id="medium"
                  name="medium"
                  value={formData.medium}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Text</option>
                  <option value="comic">Comic</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="genre"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Genre
                </label>
                <input
                  type="text"
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Fantasy, Sci-Fi, Romance, Horror"
                />
              </div>

              <div>
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Language
                </label>
                <input
                  type="text"
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="English"
                />
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Story Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide a brief description of your story..."
              />
            </div>
          </div>

          {/* Characters */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Characters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="mainCharacters"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Number of Main Characters (1-5) *
                </label>
                <input
                  type="number"
                  id="mainCharacters"
                  name="mainCharacters"
                  value={formData.mainCharacters}
                  onChange={handleInputChange}
                  min="1"
                  max="5"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="secondaryCharacters"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Number of Secondary Characters (0-20)
                </label>
                <input
                  type="number"
                  id="secondaryCharacters"
                  name="secondaryCharacters"
                  value={formData.secondaryCharacters}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* World Building */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              World & Setting
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="worldTheme"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  World Theme/Setting *
                </label>
                <input
                  type="text"
                  id="worldTheme"
                  name="worldTheme"
                  value={formData.worldTheme}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Steampunk, Fantasy, Futuristic, Feudal Samurai"
                />
              </div>

              <div>
                <label
                  htmlFor="timeline"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Timeline/Era
                </label>
                <input
                  type="text"
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Year 1984, Year 2047, Medieval Times"
                />
              </div>
            </div>
          </div>

          {/* Story Structure */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Story Structure
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="maxChapters"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Maximum Chapters (5 to unlimited) *
                </label>
                <select
                  id="maxChapters"
                  name="maxChapters"
                  value={formData.maxChapters}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[5, 10, 15, 20, 25, 30, 50].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="maxBranchesPerChapter"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Maximum Branches per Chapter (1 to unlimited) *
                </label>
                <select
                  id="maxBranchesPerChapter"
                  name="maxBranchesPerChapter"
                  value={formData.maxBranchesPerChapter}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 10, 15, 20].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Additional Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="targetAudience"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Target Audience
                </label>
                <select
                  id="targetAudience"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="children">Children (0-12)</option>
                  <option value="teen">Teen (13-17)</option>
                  <option value="adult">Adult (18+)</option>
                  <option value="all">All Ages</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="collaborationMode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Collaboration Mode
                </label>
                <select
                  id="collaborationMode"
                  name="collaborationMode"
                  value={formData.collaborationMode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="open">Open to All</option>
                  <option value="invite-only">Invite Only</option>
                  <option value="solo">Solo Project</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="estimatedDuration"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Estimated Duration
                </label>
                <input
                  type="text"
                  id="estimatedDuration"
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 3 months, 1 year, ongoing"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => {
                if (confirm("Are you sure you want to clear all fields?")) {
                  setFormData({
                    name: "",
                    medium: "text",
                    mainCharacters: 1,
                    secondaryCharacters: 0,
                    worldTheme: "",
                    timeline: "",
                    maxChapters: 5,
                    maxBranchesPerChapter: 1,
                    description: "",
                    genre: "",
                    targetAudience: "all",
                    language: "English",
                    estimatedDuration: "",
                    collaborationMode: "open",
                  });
                }
              }}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
