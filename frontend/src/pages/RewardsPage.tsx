import { useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { formatEther } from "viem";
import { CONTRACT_ADDRESSES } from "../lib/contracts";
import { useWalletConnection } from "../hooks/useWalletConnection";

// Reward System ABI - Add the necessary functions
const REWARD_SYSTEM_ABI = [
  {
    type: "function",
    name: "getContributorStats",
    inputs: [{ name: "_contributor", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "totalContributions", type: "uint256" },
          { name: "totalRewardsEarned", type: "uint256" },
          { name: "totalUpvotes", type: "uint256" },
          { name: "averageRating", type: "uint256" },
          { name: "lastContributionTime", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserPendingRewards",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getClaimableAmount",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPendingReward",
    inputs: [{ name: "_rewardId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "contributor", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "storyId", type: "uint256" },
          { name: "contributionId", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "claimed", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "claimReward",
    inputs: [{ name: "_rewardId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "batchClaimRewards",
    inputs: [{ name: "_rewardIds", type: "uint256[]" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "platformRewardPool",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalRewardsDistributed",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

interface ContributorStats {
  totalContributions: bigint;
  totalRewardsEarned: bigint;
  totalUpvotes: bigint;
  averageRating: bigint;
  lastContributionTime: bigint;
}

interface PendingReward {
  contributor: string;
  amount: bigint;
  storyId: bigint;
  contributionId: bigint;
  timestamp: bigint;
  claimed: boolean;
}

export function RewardsPage() {
  const { address, isConnected } = useAccount();
  const { isOnShapeNetwork } = useWalletConnection();
  const [selectedRewards, setSelectedRewards] = useState<number[]>([]);

  // Get contributor stats
  const { data: contributorStats } = useContractRead({
    address: CONTRACT_ADDRESSES.REWARD_SYSTEM,
    abi: REWARD_SYSTEM_ABI,
    functionName: "getContributorStats",
    args: address ? [address] : undefined,
    enabled: !!address && isOnShapeNetwork,
  });

  // Get pending reward IDs
  const { data: pendingRewardIds } = useContractRead({
    address: CONTRACT_ADDRESSES.REWARD_SYSTEM,
    abi: REWARD_SYSTEM_ABI,
    functionName: "getUserPendingRewards",
    args: address ? [address] : undefined,
    enabled: !!address && isOnShapeNetwork,
  });

  // Get total claimable amount
  const { data: claimableAmount } = useContractRead({
    address: CONTRACT_ADDRESSES.REWARD_SYSTEM,
    abi: REWARD_SYSTEM_ABI,
    functionName: "getClaimableAmount",
    args: address ? [address] : undefined,
    enabled: !!address && isOnShapeNetwork,
  });

  // Get platform statistics
  const { data: platformStats } = useContractReads({
    contracts: [
      {
        address: CONTRACT_ADDRESSES.REWARD_SYSTEM,
        abi: REWARD_SYSTEM_ABI,
        functionName: "platformRewardPool",
      },
      {
        address: CONTRACT_ADDRESSES.REWARD_SYSTEM,
        abi: REWARD_SYSTEM_ABI,
        functionName: "totalRewardsDistributed",
      },
    ],
    enabled: isOnShapeNetwork,
  });

  // Get detailed pending rewards
  const pendingRewardContracts = ((pendingRewardIds as bigint[]) || []).map(
    (id) => ({
      address: CONTRACT_ADDRESSES.REWARD_SYSTEM,
      abi: REWARD_SYSTEM_ABI,
      functionName: "getPendingReward" as const,
      args: [id],
    })
  );

  const { data: pendingRewards } = useContractReads({
    contracts: pendingRewardContracts,
    enabled:
      !!pendingRewardIds && pendingRewardIds.length > 0 && isOnShapeNetwork,
  });

  // Claim individual reward
  const { config: claimConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESSES.REWARD_SYSTEM,
    abi: REWARD_SYSTEM_ABI,
    functionName: "claimReward",
    args:
      selectedRewards.length === 1 ? [BigInt(selectedRewards[0])] : undefined,
    enabled: selectedRewards.length === 1 && isOnShapeNetwork,
  });

  const { write: claimReward, isLoading: isClaiming } =
    useContractWrite(claimConfig);

  // Batch claim rewards
  const { config: batchClaimConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESSES.REWARD_SYSTEM,
    abi: REWARD_SYSTEM_ABI,
    functionName: "batchClaimRewards",
    args:
      selectedRewards.length > 1
        ? [selectedRewards.map((id) => BigInt(id))]
        : undefined,
    enabled: selectedRewards.length > 1 && isOnShapeNetwork,
  });

  const { write: batchClaimRewards, isLoading: isBatchClaiming } =
    useContractWrite(batchClaimConfig);

  const handleClaimSelected = () => {
    if (selectedRewards.length === 1) {
      claimReward?.();
    } else if (selectedRewards.length > 1) {
      batchClaimRewards?.();
    }
  };

  const handleSelectReward = (rewardId: number) => {
    setSelectedRewards((prev) =>
      prev.includes(rewardId)
        ? prev.filter((id) => id !== rewardId)
        : [...prev, rewardId]
    );
  };

  const handleSelectAll = () => {
    if (!pendingRewardIds) return;

    const unclaimedIds = pendingRewardIds
      .map((id, index) => ({ id: Number(id), index }))
      .filter(({ index }) => {
        const reward = pendingRewards?.[index]?.result as PendingReward;
        return reward && !reward.claimed;
      })
      .map(({ id }) => id);

    if (selectedRewards.length === unclaimedIds.length) {
      setSelectedRewards([]);
    } else {
      setSelectedRewards(unclaimedIds);
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const formatTimeAgo = (timestamp: bigint) => {
    const now = Date.now();
    const time = Number(timestamp) * 1000;
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Rewards Dashboard
            </h1>
            <p className="text-gray-600 mb-8">
              Connect your wallet to view your rewards and statistics
            </p>
            <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600">
              Please connect your wallet
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isOnShapeNetwork) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Rewards Dashboard
            </h1>
            <p className="text-gray-600 mb-8">
              Please switch to Shape Network to view your rewards
            </p>
            <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600">
              Wrong Network
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = contributorStats as ContributorStats;
  const [platformRewardPool, totalRewardsDistributed] = platformStats?.map(
    (result) => result.result as bigint
  ) || [0n, 0n];
  const unclaimedRewards =
    pendingRewards?.filter(
      (reward) => !(reward.result as PendingReward)?.claimed
    ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rewards Dashboard
          </h1>
          <p className="text-gray-600">
            Track your contributions and claim your rewards
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Earned
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {stats ? formatEther(stats.totalRewardsEarned) : "0"} ETH
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Available to Claim
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {claimableAmount ? formatEther(claimableAmount) : "0"} ETH
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Contributions
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {stats ? stats.totalContributions.toString() : "0"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Upvotes
            </h3>
            <p className="text-2xl font-bold text-indigo-600">
              {stats ? stats.totalUpvotes.toString() : "0"}
            </p>
          </div>
        </div>

        {/* Platform Statistics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Platform Reward Pool
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {formatEther(platformRewardPool)} ETH
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Total Distributed
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {formatEther(totalRewardsDistributed)} ETH
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Average Rating
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {stats && stats.averageRating > 0n
                  ? `${stats.averageRating.toString()}%`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Rewards */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Pending Rewards
              </h2>
              {unclaimedRewards.length > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={handleSelectAll}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {selectedRewards.length === unclaimedRewards.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  {selectedRewards.length > 0 && (
                    <button
                      onClick={handleClaimSelected}
                      disabled={isClaiming || isBatchClaiming}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {isClaiming || isBatchClaiming
                        ? "Claiming..."
                        : `Claim ${selectedRewards.length} Reward${
                            selectedRewards.length > 1 ? "s" : ""
                          }`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {!pendingRewardIds || pendingRewardIds.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No pending rewards at the moment.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Start contributing to stories to earn rewards!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRewardIds.map((rewardId, index) => {
                  const reward = pendingRewards?.[index]
                    ?.result as PendingReward;
                  if (!reward || reward.claimed) return null;

                  const rewardIdNumber = Number(rewardId);
                  const isSelected = selectedRewards.includes(rewardIdNumber);

                  return (
                    <div
                      key={rewardIdNumber}
                      className={`border rounded-lg p-4 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectReward(rewardIdNumber)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Reward #{rewardIdNumber}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Story #{reward.storyId.toString()} • Contribution
                              #{reward.contributionId.toString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatEther(reward.amount)} ETH
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTimeAgo(reward.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Contributor Profile */}
        {stats && stats.totalContributions > 0n && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Contributor Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Last Contribution
                </h3>
                <p className="text-lg text-gray-900">
                  {stats.lastContributionTime > 0n
                    ? formatDate(stats.lastContributionTime)
                    : "No contributions yet"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Contribution Quality
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Number(stats.averageRating))}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {stats.averageRating > 0n
                      ? `${stats.averageRating.toString()}%`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
