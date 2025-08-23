import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useStory } from "../hooks/useStory";
import { useCreateContribution } from "../hooks/useCreateContribution";
import { ContentType } from "../lib/contracts";
import { uploadFileToIPFS } from "../lib/ipfs";
import toast from "react-hot-toast";

export function ContributeToStoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    story,
    isLoading: storyLoading,
    error: storyError,
    exists,
  } = useStory(id);
  const {
    createContribution,
    isLoading: contributionLoading,
    isSuccess,
  } = useCreateContribution();

  // Form state
  const [contributionType, setContributionType] = useState<
    "continue" | "branch"
  >("continue");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [branchTitle, setBranchTitle] = useState("");
  const [authorNotes, setAuthorNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Handle file upload for media content
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview URL for images/videos
      if (
        selectedFile.type.startsWith("image/") ||
        selectedFile.type.startsWith("video/")
      ) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      }
    }
  };

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Redirect to story page after successful contribution
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        navigate(`/story/${id}`);
      }, 2000);
    }
  }, [isSuccess, navigate, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!story) {
      toast.error("Story not found");
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (contributionType === "branch" && !branchTitle.trim()) {
      toast.error("Please provide a branch title");
      return;
    }

    try {
      let finalContent = content;

      // If file is provided, upload it and include the URL in content
      if (file) {
        toast.loading("Uploading file...");
        const fileUrl = await uploadFileToIPFS(file);

        // For media content, include the IPFS URL
        if (story.contentType === ContentType.IMAGE) {
          finalContent = `${content}\n\n![${file.name}](${fileUrl})`;
        } else if (story.contentType === ContentType.VIDEO) {
          finalContent = `${content}\n\n[Video: ${file.name}](${fileUrl})`;
        } else {
          finalContent = `${content}\n\nAttachment: [${file.name}](${fileUrl})`;
        }
        toast.dismiss();
      }

      await createContribution({
        storyId: id!,
        title,
        content: finalContent,
        contentType: story.contentType,
        description,
        isBranch: contributionType === "branch",
        branchTitle: contributionType === "branch" ? branchTitle : undefined,
        authorNotes,
      });
    } catch (error) {
      console.error("Error creating contribution:", error);
    }
  };

  const getContentTypeLabel = (contentType: ContentType) => {
    switch (contentType) {
      case ContentType.TEXT:
        return "Text Story";
      case ContentType.IMAGE:
        return "Visual Story";
      case ContentType.VIDEO:
        return "Video Story";
      default:
        return "Unknown Type";
    }
  };

  const getContentPlaceholder = (contentType: ContentType) => {
    switch (contentType) {
      case ContentType.TEXT:
        return "Write your story contribution here. You can continue the narrative, add a new chapter, or take the story in a new direction...";
      case ContentType.IMAGE:
        return "Describe your visual contribution. What happens in this scene? How does it advance the story?";
      case ContentType.VIDEO:
        return "Describe your video contribution. What scenes or events does it show? How does it fit into the story?";
      default:
        return "Write your contribution...";
    }
  };

  const getAcceptedFileTypes = (contentType: ContentType) => {
    switch (contentType) {
      case ContentType.IMAGE:
        return "image/*";
      case ContentType.VIDEO:
        return "video/*";
      default:
        return "*/*";
    }
  };

  if (storyLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (storyError || !exists || !story) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4m0 0V24a6 6 0 0112 0v12m-6-8h4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Story Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {storyError ||
                "The story you're trying to contribute to doesn't exist or has been removed."}
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              ← Back to Explore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!story.isActive) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m3 6v3m0 0v3m0-3h3m-3 0H9m12-9v3m0 0v3m0-3h3m-3 0h-3m3 6v3m0 0v3m0-3h3m-3 0h-3"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Story Inactive
            </h2>
            <p className="text-gray-600 mb-6">
              This story is no longer accepting contributions. It may have
              reached its completion or been paused by the creator.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link
                to={`/story/${id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                View Story
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors duration-200"
              >
                Explore Active Stories
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back to Story */}
      <div className="mb-6">
        <Link
          to={`/story/${id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Story
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Contribute to Story
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="font-medium">{story.title}</span>
            <span>•</span>
            <span>{getContentTypeLabel(story.contentType)}</span>
            <span>•</span>
            <span>{Number(story.totalContributions)} contributions</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* Contribution Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Contribution Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setContributionType("continue")}
                className={`p-4 border rounded-lg text-left transition-colors duration-200 ${
                  contributionType === "continue"
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="font-medium">Continue Story</div>
                <div className="text-sm text-gray-600 mt-1">
                  Add to the main storyline
                </div>
              </button>
              <button
                type="button"
                onClick={() => setContributionType("branch")}
                className={`p-4 border rounded-lg text-left transition-colors duration-200 ${
                  contributionType === "branch"
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="font-medium">Create Branch</div>
                <div className="text-sm text-gray-600 mt-1">
                  Start an alternative storyline
                </div>
              </button>
            </div>
          </div>

          {/* Branch Title (only for branches) */}
          {contributionType === "branch" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Branch Title *
              </label>
              <input
                type="text"
                value={branchTitle}
                onChange={(e) => setBranchTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What makes this branch unique?"
                required={contributionType === "branch"}
              />
            </div>
          )}

          {/* Contribution Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Contribution Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Give your contribution a title"
              required
            />
          </div>

          {/* File Upload (for Image/Video stories) */}
          {(story.contentType === ContentType.IMAGE ||
            story.contentType === ContentType.VIDEO) && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {story.contentType === ContentType.IMAGE
                  ? "Upload Image"
                  : "Upload Video"}
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors duration-200">
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                    <div className="mb-4">
                      {story.contentType === ContentType.IMAGE ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="mx-auto h-32 w-auto object-cover rounded-md"
                        />
                      ) : (
                        <video
                          src={previewUrl}
                          className="mx-auto h-32 w-auto rounded-md"
                          controls
                        />
                      )}
                    </div>
                  ) : (
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>{file ? "Change file" : "Upload a file"}</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept={getAcceptedFileTypes(story.contentType)}
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {story.contentType === ContentType.IMAGE
                      ? "PNG, JPG, GIF up to 10MB"
                      : "MP4, MOV, AVI up to 100MB"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={getContentPlaceholder(story.contentType)}
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Briefly describe your contribution (optional)"
            />
          </div>

          {/* Author Notes */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Author Notes
            </label>
            <textarea
              value={authorNotes}
              onChange={(e) => setAuthorNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any notes for other contributors or readers? (optional)"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="text-sm text-gray-600">
              Your contribution will be submitted to the blockchain and stored
              on IPFS.
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to={`/story/${id}`}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={contributionLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {contributionLoading ? "Submitting..." : "Submit Contribution"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
