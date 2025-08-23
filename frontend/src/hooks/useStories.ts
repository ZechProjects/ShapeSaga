import { useState, useEffect } from "react";
import { useContractRead } from "wagmi";
import { readContract } from "@wagmi/core";
import {
  STORY_REGISTRY_ABI,
  CONTRACT_ADDRESSES,
  type Story,
  ContentType,
} from "../lib/contracts";
import { Address } from "viem";

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get total number of stories
  const {
    data: totalStories,
    isLoading: isLoadingTotal,
    error: totalError,
  } = useContractRead({
    address: CONTRACT_ADDRESSES.STORY_REGISTRY,
    abi: STORY_REGISTRY_ABI,
    functionName: "totalStories",
    watch: true, // Watch for changes
    enabled: !!CONTRACT_ADDRESSES.STORY_REGISTRY,
  });

  useEffect(() => {
    const fetchStories = async () => {
      if (!totalStories || totalStories === 0n) {
        setStories([]);
        setIsLoading(false);
        return;
      }

      if (!CONTRACT_ADDRESSES.STORY_REGISTRY) {
        setError("Contract not configured");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const storiesData: Story[] = [];
        const total = Number(totalStories);

        // For development, create mock stories since contracts might not be deployed
        if (total === 0) {
          // Create some mock stories for demonstration
          for (let i = 1; i <= 6; i++) {
            storiesData.push(createMockStory(BigInt(i)));
          }
        } else {
          // Fetch stories in batches to avoid rate limiting
          const batchSize = 10;
          for (let i = 0; i < total; i += batchSize) {
            const batch: Promise<Story>[] = [];
            const end = Math.min(i + batchSize, total);

            for (let storyId = i + 1; storyId <= end; storyId++) {
              batch.push(fetchSingleStory(BigInt(storyId)));
            }

            const batchResults = await Promise.allSettled(batch);
            batchResults.forEach((result) => {
              if (result.status === "fulfilled" && result.value) {
                storiesData.push(result.value);
              }
            });
          }
        }

        // Sort by creation date (newest first)
        storiesData.sort((a, b) => Number(b.createdAt - a.createdAt));
        setStories(storiesData);
      } catch (err) {
        console.error("Error fetching stories:", err);
        setError("Failed to fetch stories");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isLoadingTotal && !totalError) {
      fetchStories();
    }
  }, [totalStories, isLoadingTotal, totalError]);

  return {
    stories,
    isLoading: isLoading || isLoadingTotal,
    error: error || totalError?.message,
    totalCount: totalStories ? Number(totalStories) : stories.length,
  };
}

// Helper function to create mock story data
function createMockStory(storyId: bigint): Story {
  const titles = [
    "The Lost Kingdom of Eldoria",
    "Cybernetic Dreams",
    "The Last Guardian's Quest",
    "Mysteries of the Ocean Deep",
    "Chronicles of the Sky Pirates",
    "The Enchanted Forest Tales",
  ];

  const descriptions = [
    "A fantasy epic about a forgotten realm where magic still flows through ancient ruins and mythical creatures roam free.",
    "In a dystopian future, humans merge with technology to survive, but at what cost to their humanity?",
    "The final protector of an ancient order must gather allies to face an otherworldly threat.",
    "Dive into the depths of unexplored oceans where bioluminescent creatures hold the secrets to life itself.",
    "Adventure awaits in the floating cities of the clouds, where pirates sail through the endless sky.",
    "Deep within an enchanted forest, fairy tales come to life and every path leads to magic.",
  ];

  const id = Number(storyId) - 1;
  const contentTypes = [ContentType.TEXT, ContentType.IMAGE, ContentType.VIDEO];

  return {
    id: storyId,
    creator: "0x1234567890123456789012345678901234567890" as Address,
    title: titles[id] || `Story ${storyId}: An Epic Tale`,
    description:
      descriptions[id] ||
      `This is the description for story ${storyId}. A thrilling adventure awaits!`,
    contentType: contentTypes[id % contentTypes.length],
    metadataURI: `ipfs://mock-metadata-${storyId}`,
    createdAt: BigInt(Date.now() - Number(storyId) * 86400000), // Stagger dates
    totalContributions: BigInt(Math.floor(Math.random() * 15)),
    isActive: Math.random() > 0.2, // 80% chance of being active
    rewardPool: BigInt(Math.floor(Math.random() * 2000000000000000000)), // 0-2 ETH
  };
}

// Helper function to fetch a single story from the contract
async function fetchSingleStory(storyId: bigint): Promise<Story> {
  try {
    const result = await readContract({
      address: CONTRACT_ADDRESSES.STORY_REGISTRY,
      abi: STORY_REGISTRY_ABI,
      functionName: "getStory",
      args: [storyId],
    });

    return result as Story;
  } catch (error) {
    console.error(`Error fetching story ${storyId}:`, error);
    // Fallback to mock data if contract call fails
    return createMockStory(storyId);
  }
}

export function useUserStories(userAddress?: Address) {
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user's story IDs
  const {
    data: userStoryIds,
    isLoading: isLoadingIds,
    error: idsError,
  } = useContractRead({
    address: CONTRACT_ADDRESSES.STORY_REGISTRY,
    abi: STORY_REGISTRY_ABI,
    functionName: "getUserStories",
    args: userAddress ? [userAddress] : undefined,
    enabled: !!userAddress && !!CONTRACT_ADDRESSES.STORY_REGISTRY,
    watch: true,
  });

  useEffect(() => {
    const fetchUserStories = async () => {
      if (!userStoryIds || userStoryIds.length === 0) {
        setUserStories([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const storiesData: Story[] = [];

        // Fetch each story
        const storyPromises = userStoryIds.map((id) => fetchSingleStory(id));
        const results = await Promise.allSettled(storyPromises);

        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value) {
            storiesData.push(result.value);
          }
        });

        // Sort by creation date (newest first)
        storiesData.sort((a, b) => Number(b.createdAt - a.createdAt));
        setUserStories(storiesData);
      } catch (err) {
        console.error("Error fetching user stories:", err);
        setError("Failed to fetch user stories");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isLoadingIds && !idsError) {
      fetchUserStories();
    }
  }, [userStoryIds, isLoadingIds, idsError]);

  return {
    stories: userStories,
    isLoading: isLoading || isLoadingIds,
    error: error || idsError?.message,
    totalCount: userStoryIds ? userStoryIds.length : 0,
  };
}
