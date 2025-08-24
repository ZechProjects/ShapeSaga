import { useMemo } from "react";
import { useStories } from "./useStories";
import { useContractReads } from "wagmi";
import { Address } from "viem";
import {
  CONTRIBUTION_MANAGER_ABI,
  CONTRACT_ADDRESSES,
  type Contribution,
  type Story,
} from "../lib/contracts";

export interface ContributorProfile {
  address: Address;
  totalContributions: number;
  totalStories: number;
  allContributions: Contribution[];
  createdStories: Story[];
  joinedAt?: string;
  totalUpvotes: number;
  totalDownvotes: number;
  netVotes: number;
  lastActivityAt?: string;
  contributedStories: Story[];
  topContributedStory?: Story;
  averageVotesPerContribution: number;
  contributionsByMonth: { [key: string]: number };
  storiesByMonth: { [key: string]: number };
}

export function useContributor(contributorAddress: Address | undefined) {
  const { stories, isLoading: isLoadingStories } = useStories();

  // Get stories created by this contributor
  const createdStories = useMemo(() => {
    if (!contributorAddress || !stories.length) return [];
    return stories.filter(
      (story) =>
        story.creator.toLowerCase() === contributorAddress.toLowerCase()
    );
  }, [stories, contributorAddress]);

  // Get all story IDs to fetch contributions from
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
      enabled: storyIds.length > 0 && !!contributorAddress,
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
    enabled: flatContributionIds.length > 0 && !!contributorAddress,
    // Removed watch: true to prevent continuous polling
  });

  // Process data to create contributor profile
  const contributorProfile = useMemo((): ContributorProfile | null => {
    if (!contributorAddress || !contributionsData || !stories.length)
      return null;

    const allContributions = contributionsData
      .filter((c) => c.status === "success" && c.result)
      .map((c) => c.result as Contribution)
      .filter(
        (contribution) =>
          contribution.contributor.toLowerCase() ===
          contributorAddress.toLowerCase()
      );

    // Get stories this contributor has contributed to
    const contributedStoryIds = new Set(
      allContributions.map((c) => c.storyId.toString())
    );
    const contributedStories = stories.filter((story) =>
      contributedStoryIds.has(story.id.toString())
    );

    // Find the story with the most contributions from this contributor
    const storyContributionCounts = new Map<string, number>();
    allContributions.forEach((contribution) => {
      const storyId = contribution.storyId.toString();
      storyContributionCounts.set(
        storyId,
        (storyContributionCounts.get(storyId) || 0) + 1
      );
    });

    const topContributedStoryId = Array.from(
      storyContributionCounts.entries()
    ).sort(([, a], [, b]) => b - a)[0]?.[0];

    const topContributedStory = topContributedStoryId
      ? stories.find((s) => s.id.toString() === topContributedStoryId)
      : undefined;

    // Calculate statistics
    const totalUpvotes = allContributions.reduce(
      (sum, c) => sum + Number(c.upvotes),
      0
    );
    const totalDownvotes = allContributions.reduce(
      (sum, c) => sum + Number(c.downvotes),
      0
    );
    const netVotes = totalUpvotes - totalDownvotes;

    // Calculate activity by month for contributions
    const contributionsByMonth: { [key: string]: number } = {};
    allContributions.forEach((contribution) => {
      const date = new Date(Number(contribution.createdAt) * 1000);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      contributionsByMonth[monthKey] =
        (contributionsByMonth[monthKey] || 0) + 1;
    });

    // Calculate activity by month for stories
    const storiesByMonth: { [key: string]: number } = {};
    createdStories.forEach((story) => {
      const date = new Date(Number(story.createdAt) * 1000);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      storiesByMonth[monthKey] = (storiesByMonth[monthKey] || 0) + 1;
    });

    // Find join date and last activity
    const allActivities = [
      ...allContributions.map((c) => Number(c.createdAt) * 1000),
      ...createdStories.map((s) => Number(s.createdAt) * 1000),
    ].sort((a, b) => a - b);

    const joinedAt =
      allActivities.length > 0
        ? new Date(allActivities[0]).toISOString()
        : undefined;

    const lastActivityAt =
      allActivities.length > 0
        ? new Date(allActivities[allActivities.length - 1]).toISOString()
        : undefined;

    return {
      address: contributorAddress,
      totalContributions: allContributions.length,
      totalStories: createdStories.length,
      allContributions,
      createdStories,
      joinedAt,
      totalUpvotes,
      totalDownvotes,
      netVotes,
      lastActivityAt,
      contributedStories,
      topContributedStory,
      averageVotesPerContribution:
        allContributions.length > 0
          ? (totalUpvotes + totalDownvotes) / allContributions.length
          : 0,
      contributionsByMonth,
      storiesByMonth,
    };
  }, [contributorAddress, contributionsData, stories, createdStories]);

  const isLoading =
    isLoadingStories || isLoadingContributionIds || isLoadingContributions;

  return {
    contributorProfile,
    isLoading,
    error,
  };
}
