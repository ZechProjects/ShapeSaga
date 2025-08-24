import { useState, useEffect } from "react";
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import {
  CONTRIBUTION_MANAGER_ABI,
  CONTRACT_ADDRESSES,
  ContentType,
  type ContributionMetadata,
} from "../lib/contracts";
import { uploadContributionMetadata } from "../lib/ipfs";
import toast from "react-hot-toast";

interface CreateContributionParams {
  storyId: string;
  parentContributionId?: string;
  title: string;
  content: string;
  contentType: ContentType;
  description?: string;
  isBranch: boolean;
  branchTitle?: string;
  authorNotes?: string;
}

export function useCreateContribution() {
  const { address, isConnected } = useAccount();
  const [isUploading, setIsUploading] = useState(false);

  const {
    data,
    write: writeCreateContribution,
    isLoading: isWriting,
    error: writeError,
    reset: resetWrite,
  } = useContractWrite({
    address: CONTRACT_ADDRESSES.CONTRIBUTION_MANAGER,
    abi: CONTRIBUTION_MANAGER_ABI,
    functionName: "submitContribution",
  });

  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransaction({
    hash: data?.hash,
    timeout: 60000, // 60 second timeout
  });

  const createContribution = async (params: CreateContributionParams) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!CONTRACT_ADDRESSES.CONTRIBUTION_MANAGER) {
      toast.error(
        "Smart contract not configured. Please check environment variables."
      );
      return;
    }

    try {
      setIsUploading(true);
      resetWrite();

      // Create metadata object
      const metadata: ContributionMetadata = {
        title: params.title,
        content: params.content,
        contentType: params.contentType,
        description: params.description,
        parentId: parseInt(params.parentContributionId || "0"),
        isBranch: params.isBranch,
        branchTitle: params.branchTitle,
        authorNotes: params.authorNotes,
        createdAt: new Date().toISOString(),
        version: "1.0",
      };

      toast.loading("Uploading contribution to IPFS...");

      // Upload metadata to IPFS
      const metadataURI = await uploadContributionMetadata(metadata);

      toast.dismiss();
      toast.loading("Creating contribution...");

      // Submit to blockchain
      writeCreateContribution({
        args: [
          BigInt(params.storyId),
          BigInt(params.parentContributionId || "0"),
          metadataURI,
          params.isBranch,
          params.branchTitle || "",
        ],
      });
    } catch (error: any) {
      console.error("Error creating contribution:", error);
      toast.dismiss();

      if (error?.message) {
        if (error.message.includes("User rejected")) {
          toast.error("Transaction was cancelled");
        } else if (error.message.includes("insufficient funds")) {
          toast.error("Insufficient funds for transaction");
        } else if (error.message.includes("network")) {
          toast.error("Network error. Please check your connection");
        } else {
          toast.error(`Failed to create contribution: ${error.message}`);
        }
      } else {
        toast.error("Failed to create contribution. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Show success/error toasts when transaction completes
  useEffect(() => {
    if (isSuccess) {
      toast.dismiss();
      toast.success("Contribution created successfully!");
    }
  }, [isSuccess]);

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
    createContribution,
    isLoading: isUploading || isWriting || isConfirming,
    isSuccess,
    error: writeError || confirmError,
    transactionHash: data?.hash,
  };
}
