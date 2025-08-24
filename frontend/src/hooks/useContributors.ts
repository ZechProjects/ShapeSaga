import { useMemo } from "react";
import { useStories } from "./useStories";
import { useContractReads } from "wagmi";
import { Address } from "viem";
import {
  CONTRIBUTION_MANAGER_ABI,
  CONTRACT_ADDRESSES,
  type Contribution,
} from "../lib/contracts";

export interface Contributor {
  address: Address;
  totalContributions: number;
  totalStories: number;
  recentContributions: Contribution[];
  joinedAt?: string;
  totalUpvotes: number;
  totalDownvotes: number;
}

export function useContributors() {
  const { stories, isLoading: isLoadingStories } = useStories();

  // Get all story IDs
  const storyIds = useMemo(() => {
    return stories.map((story) => story.id);
  }, [stories]);

  // Prepare contracts to get contributions for all stories
  const contributionContracts = useMemo(() => {
    return storyIds.map((storyId) => ({
      address: CONTRACT_ADDRESSES.CONTRIBUTION_MANAGER,
      abi: CONTRIBUTION_MANAGER_ABI,
      functionName: "getStoryContributions",
      args: [storyId],
    }));
  }, [storyIds]);

  // Fetch all contribution IDs for all stories
  const { data: allContributionIds, isLoading: isLoadingContributionIds } =
    useContractReads({
      contracts: contributionContracts,
      enabled: storyIds.length > 0,
      // Removed watch: true to prevent continuous polling
    });

  // Flatten and get unique contribution IDs
  const flatContributionIds = useMemo(() => {
    if (!allContributionIds) return [];

    const ids: bigint[] = [];
    allContributionIds.forEach((result) => {
      if (result.status === "success" && result.result) {
        ids.push(...(result.result as bigint[]));
      }
    });
    return [...new Set(ids.map((id) => id.toString()))].map((id) => BigInt(id));
  }, [allContributionIds]);

  // Prepare contracts to get individual contribution details
  const individualContributionContracts = useMemo(() => {
    return flatContributionIds.map((id) => ({
      address: CONTRACT_ADDRESSES.CONTRIBUTION_MANAGER,
      abi: CONTRIBUTION_MANAGER_ABI,
      functionName: "getContribution",
      args: [id],
    }));
  }, [flatContributionIds]);

  // Fetch all contribution details
  const {
    data: contributionsData,
    isLoading: isLoadingContributions,
    error,
  } = useContractReads({
    contracts: individualContributionContracts,
    enabled: flatContributionIds.length > 0,
    // Removed watch: true to prevent continuous polling
  });

  // Process contributions to extract contributor data
  const contributors = useMemo(() => {
    if (!contributionsData || !stories.length) return [];

    const contributions = contributionsData
      .filter((c) => c.status === "success" && c.result)
      .map((c) => c.result as Contribution);

    const contributorMap = new Map<string, Contributor>();

    // Add story creators
    stories.forEach((story) => {
      const address = story.creator.toLowerCase();
      if (!contributorMap.has(address)) {
        contributorMap.set(address, {
          address: story.creator,
          totalContributions: 0,
          totalStories: 0,
          recentContributions: [],
          totalUpvotes: 0,
          totalDownvotes: 0,
        });
      }
      const contributor = contributorMap.get(address)!;
      contributor.totalStories += 1;
      if (!contributor.joinedAt) {
        contributor.joinedAt = new Date(
          Number(story.createdAt) * 1000
        ).toISOString();
      }
    });

    // Add contributors from contributions
    contributions.forEach((contribution) => {
      const address = contribution.contributor.toLowerCase();
      if (!contributorMap.has(address)) {
        contributorMap.set(address, {
          address: contribution.contributor,
          totalContributions: 0,
          totalStories: 0,
          recentContributions: [],
          totalUpvotes: 0,
          totalDownvotes: 0,
        });
      }

      const contributor = contributorMap.get(address)!;
      contributor.totalContributions += 1;
      contributor.totalUpvotes += Number(contribution.upvotes);
      contributor.totalDownvotes += Number(contribution.downvotes);

      // Add to recent contributions (keep last 5)
      contributor.recentContributions.push(contribution);
      contributor.recentContributions.sort((a, b) =>
        Number(b.createdAt - a.createdAt)
      );
      if (contributor.recentContributions.length > 5) {
        contributor.recentContributions = contributor.recentContributions.slice(
          0,
          5
        );
      }

      if (!contributor.joinedAt) {
        contributor.joinedAt = new Date(
          Number(contribution.createdAt) * 1000
        ).toISOString();
      }
    });

    return Array.from(contributorMap.values()).sort((a, b) => {
      // Sort by total activity (stories + contributions) descending
      const aActivity = a.totalStories + a.totalContributions;
      const bActivity = b.totalStories + b.totalContributions;
      return bActivity - aActivity;
    });
  }, [contributionsData, stories]);

  const isLoading =
    isLoadingStories || isLoadingContributionIds || isLoadingContributions;

  return {
    contributors,
    isLoading,
    error,
    totalCount: contributors.length,
  };
}
