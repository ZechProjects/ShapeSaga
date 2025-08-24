import { useContractRead, useContractReads } from "wagmi";
import {
  CONTRIBUTION_MANAGER_ABI,
  CONTRACT_ADDRESSES,
  type Contribution,
} from "../lib/contracts";

export function useContributions(storyId: string | undefined) {
  // 1. Get contribution IDs for the story
  const { data: contributionIds, isLoading: isLoadingIds } = useContractRead({
    address: CONTRACT_ADDRESSES.CONTRIBUTION_MANAGER,
    abi: CONTRIBUTION_MANAGER_ABI,
    functionName: "getStoryContributions",
    args: storyId ? [BigInt(storyId)] : undefined,
    enabled: !!storyId,
    // Removed watch: true to prevent continuous polling
  });

  // 2. Prepare contracts for fetching individual contributions
  const contributionContracts =
    contributionIds?.map((id) => ({
      address: CONTRACT_ADDRESSES.CONTRIBUTION_MANAGER,
      abi: CONTRIBUTION_MANAGER_ABI,
      functionName: "getContribution",
      args: [id],
    })) || [];

  // 3. Fetch all contributions in parallel
  const {
    data: contributionsData,
    isLoading: isLoadingContributions,
    error,
  } = useContractReads({
    contracts: contributionContracts,
    enabled: !!contributionIds && contributionIds.length > 0,
    // Removed watch: true to prevent continuous polling
  });

  const contributions =
    contributionsData
      ?.filter((c) => c.status === "success" && c.result)
      .map((c) => c.result as Contribution) || [];

  return {
    contributions,
    isLoading: isLoadingIds || isLoadingContributions,
    error,
  };
}
