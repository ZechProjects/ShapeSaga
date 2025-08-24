import { Address } from "viem";

// Contract ABIs - These would normally be generated from your compiled contracts
export const STORY_REGISTRY_ABI = [
  {
    type: "function",
    name: "createStory",
    inputs: [
      { name: "_title", type: "string" },
      { name: "_description", type: "string" },
      { name: "_contentType", type: "uint8" },
      { name: "_metadataURI", type: "string" },
      {
        name: "_settings",
        type: "tuple",
        components: [
          { name: "allowBranching", type: "bool" },
          { name: "requireApproval", type: "bool" },
          { name: "maxContributions", type: "uint256" },
          { name: "contributionReward", type: "uint256" },
        ],
      },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "getStory",
    inputs: [{ name: "_storyId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "contentType", type: "uint8" },
          { name: "metadataURI", type: "string" },
          { name: "createdAt", type: "uint256" },
          { name: "totalContributions", type: "uint256" },
          { name: "isActive", type: "bool" },
          { name: "rewardPool", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserStories",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalStories",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "StoryCreated",
    inputs: [
      { indexed: true, name: "storyId", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "title", type: "string" },
      { indexed: false, name: "contentType", type: "uint8" },
    ],
  },
] as const;

// Contribution Manager ABI
export const CONTRIBUTION_MANAGER_ABI = [
  {
    type: "function",
    name: "submitContribution",
    inputs: [
      { name: "_storyId", type: "uint256" },
      { name: "_parentContributionId", type: "uint256" },
      { name: "_metadataURI", type: "string" },
      { name: "_isBranch", type: "bool" },
      { name: "_branchTitle", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getContribution",
    inputs: [{ name: "_contributionId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "storyId", type: "uint256" },
          { name: "parentContributionId", type: "uint256" },
          { name: "contributor", type: "address" },
          { name: "metadataURI", type: "string" },
          { name: "status", type: "uint8" },
          { name: "createdAt", type: "uint256" },
          { name: "upvotes", type: "uint256" },
          { name: "downvotes", type: "uint256" },
          { name: "isBranch", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getStoryContributions",
    inputs: [{ name: "_storyId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getContributionChildren",
    inputs: [{ name: "_contributionId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getStoryTreeMetrics",
    inputs: [{ name: "_storyId", type: "uint256" }],
    outputs: [
      { name: "totalContributions", type: "uint256" },
      { name: "rootContributions", type: "uint256" },
      { name: "branchCount", type: "uint256" },
      { name: "maxDepth", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getContributionDepth",
    inputs: [{ name: "_contributionId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "voteOnContribution",
    inputs: [
      { name: "_contributionId", type: "uint256" },
      { name: "_isUpvote", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "ContributionSubmitted",
    inputs: [
      { indexed: true, name: "contributionId", type: "uint256" },
      { indexed: true, name: "storyId", type: "uint256" },
      { indexed: true, name: "contributor", type: "address" },
      { indexed: false, name: "isBranch", type: "bool" },
    ],
  },
] as const;

// Content type enum mapping
export enum ContentType {
  TEXT = 0,
  IMAGE = 1,
  VIDEO = 2,
}

// Contribution status enum
export enum ContributionStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

// Contract addresses - these should be set from environment variables
export const CONTRACT_ADDRESSES = {
  STORY_REGISTRY: (import.meta.env.VITE_CONTRACT_STORY_REGISTRY ||
    "") as Address,
  CONTRIBUTION_MANAGER: (import.meta.env.VITE_CONTRACT_CONTRIBUTION_MANAGER ||
    "") as Address,
  NFT_MINTER: (import.meta.env.VITE_CONTRACT_NFT_MINTER || "") as Address,
  REWARD_SYSTEM: (import.meta.env.VITE_CONTRACT_REWARD_SYSTEM || "") as Address,
} as const;

// Story types
export interface Story {
  id: bigint;
  creator: Address;
  title: string;
  description: string;
  contentType: ContentType;
  metadataURI: string;
  createdAt: bigint;
  totalContributions: bigint;
  isActive: boolean;
  rewardPool: bigint;
}

export interface StorySettings {
  allowBranching: boolean;
  requireApproval: boolean;
  maxContributions: bigint;
  contributionReward: bigint;
}

// Story metadata interface for IPFS
export interface StoryMetadata {
  title: string;
  description: string;
  genre: string;
  language: string;
  targetAudience: string;
  worldTheme: string;
  timeline: string;
  estimatedDuration: string;
  collaborationMode: string;
  characters: {
    main: number;
    secondary: number;
  };
  structure: {
    maxChapters: number | "unlimited";
    maxBranchesPerChapter: number | "unlimited";
  };
  medium: "text" | "comic" | "video";
  createdAt: string;
  version: string;
}

// Contribution types
export interface Contribution {
  id: bigint;
  storyId: bigint;
  parentContributionId: bigint;
  contributor: Address;
  metadataURI: string;
  status: ContributionStatus;
  createdAt: bigint;
  upvotes: bigint;
  downvotes: bigint;
  isBranch: boolean;
}

// Tree structure for contributions
export interface ContributionNode {
  contribution: Contribution;
  children: ContributionNode[];
  level: number;
  path: string; // Represents the tree path (e.g., "1.2.1" for nested nodes)
}

// Tree metrics from smart contract
export interface StoryTreeMetrics {
  totalContributions: bigint;
  rootContributions: bigint;
  branchCount: bigint;
  maxDepth: bigint;
}

// Contribution metadata interface for IPFS
export interface ContributionMetadata {
  title: string;
  content: string;
  contentType: ContentType;
  description?: string;
  parentId: number;
  isBranch: boolean;
  branchTitle?: string;
  authorNotes?: string;
  createdAt: string;
  version: string;
}
