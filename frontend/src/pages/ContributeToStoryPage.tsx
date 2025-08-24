import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useStory } from "../hooks/useStory";
import { useCreateContribution } from "../hooks/useCreateContribution";
import { useContributionTree } from "../hooks/useContributionTree";
import { useContributionTitles } from "../hooks/useContributionTitles";
import { ContentType } from "../lib/contracts";
import { uploadFileToIPFS } from "../lib/ipfs";
import toast from "react-hot-toast";
import { generateImage, generateVideo } from "../lib/ai";

export function ContributeToStoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const parentId = searchParams.get("parent");
  const isBranchFromUrl = searchParams.get("branch") === "true";
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
  const { flattenedContributions, isLoading: contributionsLoading } =
    useContributionTree(id);

  const { contributionsWithTitles, isLoading: titlesLoading } =
    useContributionTitles(flattenedContributions);

  // Form state
  const [contributionType, setContributionType] = useState<
    "continue" | "branch"
  >(isBranchFromUrl ? "branch" : "continue");
  const [parentContributionId, setParentContributionId] = useState<string>(
    parentId || ""
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [branchTitle, setBranchTitle] = useState("");
  const [authorNotes, setAuthorNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle file upload for media content
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (selectedFile.size > maxSize) {
        toast.error(
          `File size ${(selectedFile.size / 1024 / 1024).toFixed(
            2
          )}MB exceeds 100MB limit`
        );
        return;
      }

      // Validate file type based on story content type
      if (story && story.contentType === ContentType.IMAGE) {
        if (!selectedFile.type.startsWith("image/")) {
          toast.error("Please select an image file for this visual story");
          return;
        }
      } else if (story && story.contentType === ContentType.VIDEO) {
        if (!selectedFile.type.startsWith("video/")) {
          toast.error("Please select a video file for this video story");
          return;
        }
      }

      setFile(selectedFile);

      // Create preview URL for images/videos
      if (
        selectedFile.type.startsWith("image/") ||
        selectedFile.type.startsWith("video/")
      ) {
        // Clean up previous preview URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }

        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      }

      // Show file info
      toast.success(
        `File selected: ${selectedFile.name} (${(
          selectedFile.size /
          1024 /
          1024
        ).toFixed(2)}MB)`
      );
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt for the image.");
      return;
    }
    setIsGenerating(true);
    setPreviewUrl("");
    if (file) {
      setFile(null);
    }

    try {
      const imageBlob = await generateImage(prompt);
      const imageFile = new File(
        [imageBlob],
        `${prompt.replace(/\s/g, "_")}.jpg`,
        { type: "image/jpeg" }
      );
      setFile(imageFile);
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt for the video.");
      return;
    }
    setIsGenerating(true);
    setPreviewUrl("");
    if (file) {
      setFile(null);
    }

    try {
      const videoBlob = await generateVideo(prompt);
      const videoFile = new File(
        [videoBlob],
        `${prompt.replace(/\s/g, "_")}.mp4`,
        { type: "video/mp4" }
      );
      setFile(videoFile);
      const url = URL.createObjectURL(videoFile);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to generate video. Please try again.");
    } finally {
      setIsGenerating(false);
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

    // Validate media content for image and video stories
    if (story.contentType === ContentType.IMAGE && !file) {
      toast.error(
        "Please provide an image for this visual story. Generate one using AI or upload an image file."
      );
      return;
    }

    if (story.contentType === ContentType.VIDEO && !file) {
      toast.error("Please upload a video file for this video story.");
      return;
    }

    try {
      let finalContent = content;

      // If file is provided, upload it and include the URL in content
      if (file) {
        const isVideo = file.type.startsWith("video/");
        const isLargeFile = file.size > 10 * 1024 * 1024; // 10MB

        // Show appropriate loading message
        if (isVideo && isLargeFile) {
          toast.loading(
            `Uploading video (${(file.size / 1024 / 1024).toFixed(
              2
            )}MB)... This may take a few minutes.`,
            { duration: 300000 } // 5 minute timeout
          );
        } else if (isVideo) {
          toast.loading("Uploading video...", { duration: 120000 }); // 2 minute timeout
        } else {
          toast.loading("Uploading file...");
        }

        try {
          const fileUrl = await uploadFileToIPFS(file);

          // For media content, include the IPFS URL
          if (story.contentType === ContentType.IMAGE) {
            finalContent = `${content}\n\n![${file.name}](${fileUrl})`;
          } else if (story.contentType === ContentType.VIDEO) {
            // For videos, include both a link and metadata
            finalContent = `${content}\n\n[Video: ${
              file.name
            }](${fileUrl})\n\n*Video Details: ${file.type}, ${(
              file.size /
              1024 /
              1024
            ).toFixed(2)}MB*`;
          } else {
            finalContent = `${content}\n\nAttachment: [${file.name}](${fileUrl})`;
          }

          toast.dismiss();
          toast.success(`${isVideo ? "Video" : "File"} uploaded successfully!`);
        } catch (uploadError) {
          toast.dismiss();
          const errorMessage =
            uploadError instanceof Error
              ? uploadError.message
              : "Upload failed";
          toast.error(`Upload failed: ${errorMessage}`);
          throw uploadError;
        }
      }

      await createContribution({
        storyId: id!,
        parentContributionId,
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

  const formatContributionForSelection = (contributionWithTitle: any) => {
    const { node, title } = contributionWithTitle;
    const formatAddress = (address: string) => {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatDate = (timestamp: bigint) => {
      const timestampMs = Number(timestamp) * 1000;
      return new Date(timestampMs).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    const prefix = "  ".repeat(node.level) + (node.level > 0 ? "└─ " : "");
    const branchLabel = node.contribution.isBranch ? " [Branch]" : "";
    const contributionTitle = title ? ` - "${title}"` : "";

    return `${prefix}#${node.contribution.id.toString()}${branchLabel}${contributionTitle} by ${formatAddress(
      node.contribution.contributor
    )} - ${formatDate(node.contribution.createdAt)}`;
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
              to="/stories"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              ← Back to Stories
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
                to="/stories"
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

          {/* Parent Contribution Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Parent Contribution
            </label>
            <select
              value={parentContributionId}
              onChange={(e) => setParentContributionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={contributionsLoading || titlesLoading}
            >
              <option value="">Start from story beginning (root)</option>
              {contributionsWithTitles.map((contributionWithTitle) => (
                <option
                  key={contributionWithTitle.node.contribution.id.toString()}
                  value={contributionWithTitle.node.contribution.id.toString()}
                >
                  {contributionWithTitle.isLoading
                    ? `Loading... #${contributionWithTitle.node.contribution.id.toString()}`
                    : formatContributionForSelection(contributionWithTitle)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {contributionType === "continue"
                ? "Select which contribution to continue from, or leave empty to start from the beginning"
                : "Select which contribution to branch from, or leave empty to branch from the beginning"}
              {titlesLoading && (
                <span className="block mt-1 text-yellow-600 font-medium">
                  Loading contribution titles...
                </span>
              )}
              {parentContributionId && (
                <span className="block mt-1 text-blue-600 font-medium">
                  Pre-selected: Contribution #{parentContributionId}
                </span>
              )}
            </p>
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

          {/* Image Generation (for Image stories) */}
          {story.contentType === ContentType.IMAGE && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Generate Image from Prompt *
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., a futuristic city skyline at sunset"
                />
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </button>
              </div>
              {!file && (
                <p className="text-sm text-red-600 mb-2">
                  An image is required for visual stories. Generate one using AI
                  or upload your own image below.
                </p>
              )}
              {isGenerating && (
                <div className="text-center p-4">
                  <div className="animate-pulse">Generating your image...</div>
                </div>
              )}
              {previewUrl && (
                <div className="mt-4">
                  <img
                    src={previewUrl}
                    alt="Generated preview"
                    className="mx-auto h-48 w-auto object-cover rounded-md"
                  />
                </div>
              )}

              {/* Manual upload option for images */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Or Upload Your Own Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors duration-200">
                  <div className="space-y-1 text-center">
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
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>
                          {file && file.type.startsWith("image/")
                            ? "Change image"
                            : "Upload an image"}
                        </span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF, WEBP up to 10MB
                      {file && file.type.startsWith("image/") && (
                        <span className="block mt-1 text-green-600 font-medium">
                          ✓ {file.name} selected (
                          {(file.size / 1024 / 1024).toFixed(2)}MB)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File Upload (for Video stories) */}
          {story.contentType === ContentType.VIDEO && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Generate Video from Prompt *
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., a character walking through a mystical forest"
                />
                <button
                  type="button"
                  onClick={handleGenerateVideo}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </button>
              </div>
              {!file && (
                <p className="text-sm text-red-600 mb-2">
                  A video is required for video stories. Generate one using AI
                  or upload your own video below.
                </p>
              )}
              {isGenerating && (
                <div className="text-center p-4">
                  <div className="animate-pulse">
                    Generating your video... This may take a moment.
                  </div>
                </div>
              )}
              {previewUrl && file?.type.startsWith("video/") && (
                <div className="mt-4">
                  <video
                    src={previewUrl}
                    className="mx-auto h-48 w-auto object-cover rounded-md"
                    controls
                    preload="metadata"
                    onError={(e) => {
                      console.error("Video preview error:", e);
                      toast.error(
                        "Cannot preview this video format, but it can still be uploaded"
                      );
                    }}
                  />
                  <div className="text-center mt-2 text-sm text-gray-600">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB,{" "}
                    {file.type})
                  </div>
                </div>
              )}

              {/* Manual upload option for videos */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Or Upload Your Own Video
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors duration-200">
                  <div className="space-y-1 text-center">
                    {previewUrl && file?.type.startsWith("video/") ? (
                      <div className="mb-4">
                        <video
                          src={previewUrl}
                          className="mx-auto h-32 w-auto rounded-md"
                          controls
                          preload="metadata"
                          onError={(e) => {
                            console.error("Video preview error:", e);
                            toast.error(
                              "Cannot preview this video format, but it can still be uploaded"
                            );
                          }}
                        />
                        <div className="text-center mt-2 text-xs text-gray-600">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                        </div>
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
                        htmlFor="video-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>
                          {file && file.type.startsWith("video/")
                            ? "Change video"
                            : "Upload a video"}
                        </span>
                        <input
                          id="video-upload"
                          name="video-upload"
                          type="file"
                          className="sr-only"
                          accept="video/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      MP4, WEBM, MOV, AVI up to 100MB
                      {file && file.type.startsWith("video/") && (
                        <span className="block mt-1 text-green-600 font-medium">
                          ✓ {file.name} selected (
                          {(file.size / 1024 / 1024).toFixed(2)}MB)
                        </span>
                      )}
                    </p>
                  </div>
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
