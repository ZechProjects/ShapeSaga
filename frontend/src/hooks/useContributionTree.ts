import { useMemo } from "react";
import { useContractRead, useContractReads } from "wagmi";
import {
  CONTRIBUTION_MANAGER_ABI,
  CONTRACT_ADDRESSES,
  type Contribution,
  type ContributionNode,
} from "../lib/contracts";

export function useContributionTree(storyId: string | undefined) {
  // 1. Get all contribution IDs for the story
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

  // 4. Build tree structure
  const { rootNodes, allContributions } = useMemo(() => {
    if (!contributionsData) {
      return { rootNodes: [], allContributions: [] };
    }

    const contributions = contributionsData
      .filter((c) => c.status === "success" && c.result)
      .map((c) => c.result as Contribution);

    // Create a map for quick lookup
    const contributionMap = new Map<string, Contribution>();
    contributions.forEach((contrib) => {
      contributionMap.set(contrib.id.toString(), contrib);
    });

    // Build tree nodes
    const nodeMap = new Map<string, ContributionNode>();
    const rootNodes: ContributionNode[] = [];

    // Function to build a node and its subtree
    const buildNode = (
      contribution: Contribution,
      level: number = 0,
      parentPath: string = ""
    ): ContributionNode => {
      const nodeId = contribution.id.toString();
      const path = parentPath ? `${parentPath}.${nodeId}` : nodeId;

      const node: ContributionNode = {
        contribution,
        children: [],
        level,
        path,
      };

      nodeMap.set(nodeId, node);
      return node;
    };

    // First, create all nodes
    contributions.forEach((contribution) => {
      buildNode(contribution);
    });

    // Then, build the tree structure
    contributions.forEach((contribution) => {
      const node = nodeMap.get(contribution.id.toString())!;
      const parentId = contribution.parentContributionId.toString();

      if (parentId === "0") {
        // Root node
        rootNodes.push(node);
      } else {
        // Child node
        const parentNode = nodeMap.get(parentId);
        if (parentNode) {
          node.level = parentNode.level + 1;
          node.path = `${parentNode.path}.${contribution.id.toString()}`;
          parentNode.children.push(node);
        } else {
          // Parent not found, treat as root (this shouldn't happen in normal cases)
          rootNodes.push(node);
        }
      }
    });

    // Sort children by creation time for each node
    const sortNodeChildren = (node: ContributionNode) => {
      node.children.sort(
        (a, b) =>
          Number(a.contribution.createdAt) - Number(b.contribution.createdAt)
      );
      node.children.forEach(sortNodeChildren);
    };

    rootNodes.forEach(sortNodeChildren);

    // Sort root nodes by creation time
    rootNodes.sort(
      (a, b) =>
        Number(a.contribution.createdAt) - Number(b.contribution.createdAt)
    );

    return { rootNodes, allContributions: contributions };
  }, [contributionsData]);

  // Helper function to get all contributions in a flat array (depth-first traversal)
  const getFlattenedContributions = useMemo(() => {
    const flattened: ContributionNode[] = [];

    const traverse = (nodes: ContributionNode[]) => {
      nodes.forEach((node) => {
        flattened.push(node);
        traverse(node.children);
      });
    };

    traverse(rootNodes);
    return flattened;
  }, [rootNodes]);

  // Helper function to find a specific contribution node
  const findContributionNode = (
    contributionId: string
  ): ContributionNode | undefined => {
    const findInTree = (
      nodes: ContributionNode[]
    ): ContributionNode | undefined => {
      for (const node of nodes) {
        if (node.contribution.id.toString() === contributionId) {
          return node;
        }
        const found = findInTree(node.children);
        if (found) return found;
      }
      return undefined;
    };

    return findInTree(rootNodes);
  };

  // Helper function to get possible parent contributions for a new contribution
  const getPossibleParents = (): ContributionNode[] => {
    return getFlattenedContributions;
  };

  return {
    tree: rootNodes,
    allContributions,
    flattenedContributions: getFlattenedContributions,
    isLoading: isLoadingIds || isLoadingContributions,
    error,
    findContributionNode,
    getPossibleParents,
  };
}
