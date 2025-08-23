import { useState, useEffect } from "react";
import { type ContributionNode } from "../lib/contracts";

interface ContributionWithTitle {
  node: ContributionNode;
  title: string | null;
  isLoading: boolean;
}

export function useContributionTitles(contributions: ContributionNode[]) {
  const [contributionsWithTitles, setContributionsWithTitles] = useState<
    ContributionWithTitle[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchTitles() {
      if (!contributions || contributions.length === 0) {
        setContributionsWithTitles([]);
        return;
      }

      setIsLoading(true);

      // Initialize with loading state
      const initialContributions = contributions.map((node) => ({
        node,
        title: null,
        isLoading: true,
      }));
      setContributionsWithTitles(initialContributions);

      // Fetch titles in parallel
      const promises = contributions.map(async (node) => {
        try {
          const ipfsUrl = node.contribution.metadataURI.startsWith("ipfs://")
            ? `https://ipfs.io/ipfs/${node.contribution.metadataURI.replace(
                "ipfs://",
                ""
              )}`
            : node.contribution.metadataURI;

          const response = await fetch(ipfsUrl);
          if (!response.ok) {
            throw new Error("Failed to fetch metadata");
          }

          const metadata = await response.json();
          return {
            node,
            title:
              metadata.title ||
              `Contribution #${node.contribution.id.toString()}`,
            isLoading: false,
          };
        } catch (error) {
          console.error(
            `Error fetching title for contribution ${node.contribution.id}:`,
            error
          );
          return {
            node,
            title: `Contribution #${node.contribution.id.toString()}`,
            isLoading: false,
          };
        }
      });

      try {
        const results = await Promise.all(promises);
        setContributionsWithTitles(results);
      } catch (error) {
        console.error("Error fetching contribution titles:", error);
        // Fallback to contributions without titles
        setContributionsWithTitles(
          contributions.map((node) => ({
            node,
            title: `Contribution #${node.contribution.id.toString()}`,
            isLoading: false,
          }))
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchTitles();
  }, [contributions]);

  return {
    contributionsWithTitles,
    isLoading,
  };
}
