import { useState, useEffect } from "react";
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import { parseEther } from "viem";
import {
  STORY_REGISTRY_ABI,
  CONTRACT_ADDRESSES,
  ContentType,
  type StorySettings,
  type StoryMetadata,
} from "../lib/contracts";
import { uploadStoryMetadata } from "../lib/ipfs";
import toast from "react-hot-toast";

interface CreateStoryParams {
  title: string;
  description: string;
  contentType: ContentType;
  metadata: StoryMetadata;
  settings: StorySettings;
  rewardPool?: string; // ETH amount as string
}

export function useCreateStory() {
  const { address, isConnected } = useAccount();
  const [isUploading, setIsUploading] = useState(false);
  const [createdStoryId, setCreatedStoryId] = useState<bigint | null>(null);

  const {
    data,
    write: writeCreateStory,
    isLoading: isWriting,
    error: writeError,
    reset: resetWrite,
  } = useContractWrite({
    address: CONTRACT_ADDRESSES.STORY_REGISTRY,
    abi: STORY_REGISTRY_ABI,
    functionName: "createStory",
  });

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransaction({
    hash: data?.hash,
    timeout: 60000, // 60 second timeout
  });

  const createStory = async (params: CreateStoryParams) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!CONTRACT_ADDRESSES.STORY_REGISTRY) {
      toast.error(
        "Smart contract not configured. Please check environment variables."
      );
      return;
    }

    try {
      // Reset any previous write state
      resetWrite();
      setIsUploading(true);

      console.log("🚀 Starting story creation process...");
      console.log("📄 Story params:", params);

      // Upload metadata to IPFS
      const uploadToast = toast.loading("Uploading story metadata to IPFS...");
      console.log("☁️ Uploading metadata to IPFS...");
      const metadataURI = await uploadStoryMetadata(params.metadata);
      toast.dismiss(uploadToast);
      toast.success("Metadata uploaded to IPFS");
      console.log("✅ IPFS Upload successful, URI:", metadataURI);

      // Prepare contract arguments
      const rewardPoolValue = params.rewardPool
        ? parseEther(params.rewardPool)
        : 0n;

      console.log("💰 Reward pool value:", rewardPoolValue.toString());
      console.log("🔗 Contract address:", CONTRACT_ADDRESSES.STORY_REGISTRY);

      // Call smart contract
      const contractToast = toast.loading("Creating story on blockchain...");
      console.log("⛓️ Calling smart contract...");

      writeCreateStory({
        args: [
          params.title,
          params.description,
          params.contentType,
          metadataURI,
          params.settings,
        ],
        value: rewardPoolValue,
      });

      // Clean up loading toast
      setTimeout(() => {
        toast.dismiss(contractToast);
      }, 5000);
    } catch (error) {
      console.error("❌ Error creating story:", error);
      toast.dismiss();

      if (error instanceof Error) {
        if (error.message.includes("User rejected")) {
          toast.error("Transaction was cancelled");
        } else if (error.message.includes("insufficient funds")) {
          toast.error("Insufficient funds for transaction");
        } else if (error.message.includes("network")) {
          toast.error("Network error. Please check your connection");
        } else {
          toast.error(`Failed to create story: ${error.message}`);
        }
      } else {
        toast.error("Failed to create story. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Show success/error toasts when transaction completes
  useEffect(() => {
    if (isSuccess && receipt) {
      toast.dismiss();
      toast.success("Story created successfully!");

      // Extract story ID from the transaction logs
      if (receipt.logs && receipt.logs.length > 0) {
        try {
          // Find the StoryCreated event log
          const storyCreatedLog = receipt.logs.find(
            (log) =>
              log.topics &&
              log.topics[0] &&
              log.address?.toLowerCase() ===
                CONTRACT_ADDRESSES.STORY_REGISTRY?.toLowerCase()
          );

          if (
            storyCreatedLog &&
            storyCreatedLog.topics &&
            storyCreatedLog.topics[1]
          ) {
            // The first indexed parameter (storyId) is in topics[1]
            const storyId = BigInt(storyCreatedLog.topics[1]);
            setCreatedStoryId(storyId);
          }
        } catch (error) {
          console.error("Error extracting story ID from receipt:", error);
        }
      }
    }
  }, [isSuccess, receipt]);

  useEffect(() => {
    if (writeError || confirmError) {
      toast.dismiss();
      const error = writeError || confirmError;
      console.error("Transaction error:", error);

      if (error?.message?.includes("User rejected")) {
        toast.error("Transaction was cancelled");
      } else if (error?.message?.includes("insufficient funds")) {
        toast.error("Insufficient funds for transaction");
      } else if (error?.message?.includes("network")) {
        toast.error("Network error. Please try again");
      } else {
        toast.error(error?.message || "Transaction failed");
      }
    }
  }, [writeError, confirmError]);

  return {
    createStory,
    isLoading: isUploading || isWriting || isConfirming,
    isSuccess,
    error: writeError || confirmError,
    transactionHash: data?.hash,
    createdStoryId,
  };
}
