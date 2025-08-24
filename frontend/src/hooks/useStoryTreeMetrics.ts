import { useContractRead } from "wagmi";
import {
  CONTRIBUTION_MANAGER_ABI,
  CONTRACT_ADDRESSES,
  type StoryTreeMetrics,
} from "../lib/contracts";

export function useStoryTreeMetrics(storyId: string | undefined) {
  const { data, isLoading, error } = useContractRead({
    address: CONTRACT_ADDRESSES.CONTRIBUTION_MANAGER,
    abi: CONTRIBUTION_MANAGER_ABI,
    functionName: "getStoryTreeMetrics",
    args: storyId ? [BigInt(storyId)] : undefined,
    enabled: !!storyId,
    // Removed watch: true to prevent continuous polling
  });

  const metrics: StoryTreeMetrics | null = data
    ? {
        totalContributions: data[0],
        rootContributions: data[1],
        branchCount: data[2],
        maxDepth: data[3],
      }
    : null;

  return {
    metrics,
    isLoading,
    error,
  };
}
