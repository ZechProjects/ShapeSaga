import { useState, useEffect } from "react";
import { useContractRead } from "wagmi";
import { readContract } from "@wagmi/core";
import {
  STORY_REGISTRY_ABI,
  CONTRACT_ADDRESSES,
  type StorySettings,
} from "../lib/contracts";

export function useStorySettings(storyId: string | undefined) {
  const [settings, setSettings] = useState<StorySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get story settings from contract
  const {
    data: contractSettings,
    isLoading: isLoadingContract,
    error: contractError,
  } = useContractRead({
    address: CONTRACT_ADDRESSES.STORY_REGISTRY,
    abi: STORY_REGISTRY_ABI,
    functionName: "getStorySettings",
    args: storyId ? [BigInt(storyId)] : undefined,
    enabled: !!storyId && !!CONTRACT_ADDRESSES.STORY_REGISTRY,
    watch: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!storyId) {
        setError("No story ID provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let settingsData: StorySettings;

        if (contractSettings) {
          // Use contract data if available
          settingsData = contractSettings as StorySettings;
        } else if (!CONTRACT_ADDRESSES.STORY_REGISTRY) {
          // If no contract configured, use mock data
          settingsData = createMockStorySettings(BigInt(storyId));
        } else {
          // Try to fetch from contract manually
          try {
            const result = await readContract({
              address: CONTRACT_ADDRESSES.STORY_REGISTRY,
              abi: STORY_REGISTRY_ABI,
              functionName: "getStorySettings",
              args: [BigInt(storyId)],
            });
            settingsData = result as StorySettings;
          } catch (err) {
            console.error("Error fetching story settings from contract:", err);
            // Fallback to mock data
            settingsData = createMockStorySettings(BigInt(storyId));
          }
        }

        setSettings(settingsData);
      } catch (err) {
        console.error("Error fetching story settings:", err);
        setError("Failed to fetch story settings");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isLoadingContract && !contractError) {
      fetchSettings();
    } else if (contractError) {
      // If contract error, still try to show mock data
      if (storyId) {
        setSettings(createMockStorySettings(BigInt(storyId)));
        setIsLoading(false);
      }
    }
  }, [storyId, contractSettings, isLoadingContract, contractError]);

  return {
    settings,
    isLoading: isLoading || isLoadingContract,
    error: error || contractError?.message,
    exists: !!settings,
  };
}

// Helper function to create mock story settings data
function createMockStorySettings(storyId: bigint): StorySettings {
  // For demo purposes, let's vary the settings based on story ID
  const id = Number(storyId);

  return {
    allowBranching: id % 3 !== 0, // Disable branching for every 3rd story
    requireApproval: id % 2 === 0, // Require approval for even-numbered stories
    maxContributions: BigInt(id % 5 === 0 ? 50 : 0), // Limit to 50 for every 5th story, unlimited otherwise
    contributionReward: BigInt(Math.floor(Math.random() * 1000000000000000000)), // 0-1 ETH
  };
}
