import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletConnection } from "../hooks/useWalletConnection";
import { useCreateStory } from "../hooks/useCreateStory";
import {
  ContentType,
  type StoryMetadata,
  type StorySettings,
} from "../lib/contracts";
import toast from "react-hot-toast";

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
  rewardPool: string; // ETH amount
  requireApproval: boolean;
}

export function CreateStoryPage() {
  const navigate = useNavigate();
  const { isConnected, isOnShapeNetwork } = useWalletConnection();
  const { createStory, isLoading, isSuccess } = useCreateStory();

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
    rewardPool: "0",
    requireApproval: false,
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

    // Validate wallet connection
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!isOnShapeNetwork) {
      toast.error("Please switch to Shape Network");
      return;
    }

    setIsSubmitting(true);

    try {
      // Map form data to content type
      const contentTypeMap = {
        text: ContentType.TEXT,
        comic: ContentType.IMAGE,
        video: ContentType.VIDEO,
      };

      // Create story metadata for IPFS
      const metadata: StoryMetadata = {
        title: formData.name,
        description: formData.description,
        genre: formData.genre,
        language: formData.language,
        targetAudience: formData.targetAudience,
        worldTheme: formData.worldTheme,
        timeline: formData.timeline,
        estimatedDuration: formData.estimatedDuration,
        collaborationMode: formData.collaborationMode,
        characters: {
          main: formData.mainCharacters,
          secondary: formData.secondaryCharacters,
        },
        structure: {
          maxChapters: formData.maxChapters,
          maxBranchesPerChapter: formData.maxBranchesPerChapter,
        },
        medium: formData.medium,
        createdAt: new Date().toISOString(),
        version: "1.0.0",
      };

      // Create story settings
      const settings: StorySettings = {
        allowBranching: formData.maxBranchesPerChapter !== 1,
        requireApproval: formData.requireApproval,
        maxContributions:
          formData.maxChapters === "unlimited"
            ? 0n
            : BigInt(formData.maxChapters),
        contributionReward: 0n, // Can be set later
      };

      // Create story on blockchain
      await createStory({
        title: formData.name,
        description: formData.description,
        contentType: contentTypeMap[formData.medium],
        metadata,
        settings,
        rewardPool:
          formData.rewardPool !== "0" ? formData.rewardPool : undefined,
      });

      // Reset form on success
      if (isSuccess) {
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
          rewardPool: "0",
          requireApproval: false,
        });

        // Navigate to explore page after successful creation
        setTimeout(() => {
          navigate("/explore");
        }, 2000);
      }
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error("Error creating story. Please try again.");
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

        {/* Wallet Connection Status */}
        {!isConnected && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Wallet Required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Please connect your wallet to create a story on the
                    blockchain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isConnected && !isOnShapeNetwork && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Wrong Network
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Please switch to Shape Network to create your story.</p>
                </div>
              </div>
            </div>
          </div>
        )}

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

              <div>
                <label
                  htmlFor="rewardPool"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Initial Reward Pool (ETH)
                </label>
                <input
                  type="number"
                  id="rewardPool"
                  name="rewardPool"
                  value={formData.rewardPool}
                  onChange={handleInputChange}
                  min="0"
                  step="0.001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Add ETH to reward contributors
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireApproval"
                  name="requireApproval"
                  checked={formData.requireApproval}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      requireApproval: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="requireApproval"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Require approval for contributions
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                If checked, you'll need to approve each contribution before it's
                added to your story
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-2 border border-blue-300 bg-blue-50 rounded-md text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => {
                setFormData({
                  name: "The Chronicles of Aethermoor",
                  medium: "text",
                  mainCharacters: 3,
                  secondaryCharacters: 5,
                  worldTheme: "Steampunk Fantasy with Floating Islands",
                  timeline: "Year 1892 in an Alternative Universe",
                  maxChapters: 15,
                  maxBranchesPerChapter: 3,
                  description:
                    "In a world where steam-powered machines coexist with ancient magic, brave adventurers navigate floating islands connected by sky bridges. When the Great Engine that keeps the world aloft begins to fail, unlikely heroes must unite to save their realm from falling into the endless void below.",
                  genre: "Steampunk Fantasy Adventure",
                  targetAudience: "teen",
                  language: "English",
                  estimatedDuration: "6 months",
                  collaborationMode: "open",
                  rewardPool: "0.1",
                  requireApproval: false,
                });
                toast.success("Form filled with sample data for testing!");
              }}
              disabled={isSubmitting || isLoading}
            >
              🧪 Fill Test Data
            </button>
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
                    rewardPool: "0",
                    requireApproval: false,
                  });
                }
              }}
              disabled={isSubmitting || isLoading}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={
                !isConnected || !isOnShapeNetwork || isSubmitting || isLoading
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Story...
                </span>
              ) : (
                "Create Story"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
