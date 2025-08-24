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

export function useStory(storyId: string | undefined) {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get story data from contract
  const {
    data: contractStory,
    isLoading: isLoadingContract,
    error: contractError,
  } = useContractRead({
    address: CONTRACT_ADDRESSES.STORY_REGISTRY,
    abi: STORY_REGISTRY_ABI,
    functionName: "getStory",
    args: storyId ? [BigInt(storyId)] : undefined,
    enabled: !!storyId && !!CONTRACT_ADDRESSES.STORY_REGISTRY,
    // Removed watch: true to prevent continuous polling
  });

  useEffect(() => {
    const fetchStory = async () => {
      if (!storyId) {
        setError("No story ID provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let storyData: Story;

        if (contractStory) {
          // Use contract data if available
          storyData = contractStory as Story;
        } else if (!CONTRACT_ADDRESSES.STORY_REGISTRY) {
          // If no contract configured, use mock data
          storyData = createMockStory(BigInt(storyId));
        } else {
          // Try to fetch from contract manually
          try {
            const result = await readContract({
              address: CONTRACT_ADDRESSES.STORY_REGISTRY,
              abi: STORY_REGISTRY_ABI,
              functionName: "getStory",
              args: [BigInt(storyId)],
            });
            storyData = result as Story;
          } catch (err) {
            console.error("Error fetching story from contract:", err);
            // Fallback to mock data
            storyData = createMockStory(BigInt(storyId));
          }
        }

        setStory(storyData);
      } catch (err) {
        console.error("Error fetching story:", err);
        setError("Failed to fetch story");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isLoadingContract && !contractError) {
      fetchStory();
    } else if (contractError) {
      // If contract error, still try to show mock data
      if (storyId) {
        setStory(createMockStory(BigInt(storyId)));
        setIsLoading(false);
      }
    }
  }, [storyId, contractStory, isLoadingContract, contractError]);

  return {
    story,
    isLoading: isLoading || isLoadingContract,
    error: error || contractError?.message,
    exists: !!story,
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
    "A fantasy epic about a forgotten realm where magic still flows through ancient ruins and mythical creatures roam free. In the distant land of Eldoria, where crystalline towers once pierced the clouds and dragons soared freely across azure skies, a darkness has fallen. The kingdom that once stood as a beacon of magical innovation and wonder has been lost to time, its secrets buried beneath layers of myth and legend.",
    "In a dystopian future, humans merge with technology to survive, but at what cost to their humanity? As the last vestiges of organic life struggle against an increasingly digital world, Maya Chen discovers that the line between human consciousness and artificial intelligence has become dangerously blurred. Her quest to maintain her humanity while embracing necessary technological enhancement will determine the fate of our species.",
    "The final protector of an ancient order must gather allies to face an otherworldly threat. For a thousand years, the Guardians have watched over the barriers between dimensions, ensuring that the horrors of the void remain sealed away. Now, with the last seal weakening and his fellow Guardians fallen, Kael must forge unlikely alliances to prevent an apocalypse that would consume all realities.",
    "Dive into the depths of unexplored oceans where bioluminescent creatures hold the secrets to life itself. Dr. Sarah Martinez leads an expedition to the deepest trenches of the Pacific, where her team discovers an underwater civilization that has thrived in darkness for millennia. But their advanced biotechnology comes with secrets that could revolutionize human understanding of life and death.",
    "Adventure awaits in the floating cities of the clouds, where pirates sail through the endless sky. Captain Aria Stormwind commands the fastest airship in the floating archipelago, but when she discovers a conspiracy that threatens to bring all the sky cities crashing down, she must choose between her profitable life of piracy and saving the only home she's ever known.",
    "Deep within an enchanted forest, fairy tales come to life and every path leads to magic. When young cartographer Thomas Hartwell enters the Whispering Woods to map its mysteries, he discovers that the forest itself is alive, its paths shifting based on the stories its visitors bring with them. But some tales are darker than others, and not every story has a happy ending.",
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
    createdAt: BigInt(Math.floor(Date.now() / 1000) - Number(storyId) * 86400), // Convert to seconds and stagger dates
    totalContributions: BigInt(Math.floor(Math.random() * 15) + 1),
    isActive: Math.random() > 0.2, // 80% chance of being active
    rewardPool: BigInt(Math.floor(Math.random() * 2000000000000000000)), // 0-2 ETH
  };
}
