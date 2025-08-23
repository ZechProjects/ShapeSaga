// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./StoryRegistry.sol";
import "./ContributionManager.sol";

/**
 * @title RewardSystem
 * @dev Manages token rewards for story contributors based on engagement metrics
 */
contract RewardSystem is Ownable, ReentrancyGuard, Pausable {
    
    struct RewardMetrics {
        uint256 baseReward;        // Base reward for approved contribution
        uint256 upvoteMultiplier;  // Multiplier per upvote (in basis points)
        uint256 viewMultiplier;    // Multiplier per view (in basis points)
        uint256 qualityBonus;      // Quality bonus for highly rated content
        uint256 timeDecayFactor;   // Time decay factor for older contributions
    }
    
    struct ContributorStats {
        uint256 totalContributions;
        uint256 totalRewardsEarned;
        uint256 totalUpvotes;
        uint256 averageRating;
        uint256 lastContributionTime;
    }
    
    struct PendingReward {
        address contributor;
        uint256 amount;
        uint256 storyId;
        uint256 contributionId;
        uint256 timestamp;
        bool claimed;
    }
    
    // State variables
    StoryRegistry public storyRegistry;
    ContributionManager public contributionManager;
    
    RewardMetrics public rewardMetrics;
    uint256 public totalRewardsDistributed;
    uint256 public platformRewardPool;
    uint256 public nextRewardId = 1;
    
    mapping(address => ContributorStats) public contributorStats;
    mapping(uint256 => PendingReward) public pendingRewards;
    mapping(address => uint256[]) public userPendingRewards;
    mapping(uint256 => uint256) public contributionRewards; // contributionId => total rewards
    mapping(uint256 => bool) public processedContributions;
    
    // Events
    event RewardCalculated(
        uint256 indexed rewardId,
        uint256 indexed contributionId,
        address indexed contributor,
        uint256 amount
    );
    
    event RewardClaimed(
        uint256 indexed rewardId,
        address indexed contributor,
        uint256 amount
    );
    
    event RewardMetricsUpdated(RewardMetrics newMetrics);
    event PlatformRewardPoolIncreased(uint256 amount);
    
    constructor(
        address _storyRegistry,
        address _contributionManager
    ) Ownable(msg.sender) {
        storyRegistry = StoryRegistry(_storyRegistry);
        contributionManager = ContributionManager(_contributionManager);
        
        // Initialize default reward metrics
        rewardMetrics = RewardMetrics({
            baseReward: 0.001 ether,      // 0.001 ETH base reward
            upvoteMultiplier: 100,        // 1% per upvote
            viewMultiplier: 10,           // 0.1% per view
            qualityBonus: 0.005 ether,    // 0.005 ETH quality bonus
            timeDecayFactor: 9500         // 95% factor (5% decay per period)
        });
    }
    
    /**
     * @dev Calculate and queue reward for a contribution
     * @param _contributionId The ID of the contribution
     * @param _viewCount Number of views the contribution received
     */
    function calculateReward(uint256 _contributionId, uint256 _viewCount) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256) 
    {
        require(!processedContributions[_contributionId], "Contribution already processed");
        
        ContributionManager.Contribution memory contribution = contributionManager.getContribution(_contributionId);
        require(contribution.status == ContributionManager.ContributionStatus.APPROVED, "Contribution not approved");
        
        // Calculate base reward
        uint256 reward = rewardMetrics.baseReward;
        
        // Add upvote multiplier
        uint256 upvoteBonus = (reward * contribution.upvotes * rewardMetrics.upvoteMultiplier) / 10000;
        reward += upvoteBonus;
        
        // Add view multiplier
        uint256 viewBonus = (reward * _viewCount * rewardMetrics.viewMultiplier) / 10000;
        reward += viewBonus;
        
        // Calculate quality bonus based on upvote ratio
        uint256 totalVotes = contribution.upvotes + contribution.downvotes;
        if (totalVotes > 10) { // Minimum votes for quality assessment
            uint256 upvoteRatio = (contribution.upvotes * 10000) / totalVotes;
            if (upvoteRatio > 8000) { // 80% upvote ratio
                reward += rewardMetrics.qualityBonus;
            }
        }
        
        // Apply time decay (newer contributions get full reward)
        uint256 timeSinceCreation = block.timestamp - contribution.createdAt;
        uint256 decayPeriods = timeSinceCreation / 1 weeks; // Weekly decay
        for (uint256 i = 0; i < decayPeriods && i < 10; i++) {
            reward = (reward * rewardMetrics.timeDecayFactor) / 10000;
        }
        
        // Check if platform has enough funds or story has reward pool
        StoryRegistry.Story memory story = storyRegistry.getStory(contribution.storyId);
        require(
            platformRewardPool >= reward || story.rewardPool >= reward,
            "Insufficient reward funds"
        );
        
        // Create pending reward
        uint256 rewardId = nextRewardId++;
        pendingRewards[rewardId] = PendingReward({
            contributor: contribution.contributor,
            amount: reward,
            storyId: contribution.storyId,
            contributionId: _contributionId,
            timestamp: block.timestamp,
            claimed: false
        });
        
        userPendingRewards[contribution.contributor].push(rewardId);
        contributionRewards[_contributionId] = reward;
        processedContributions[_contributionId] = true;
        
        // Update contributor stats
        ContributorStats storage stats = contributorStats[contribution.contributor];
        stats.totalContributions++;
        stats.totalUpvotes += contribution.upvotes;
        stats.lastContributionTime = block.timestamp;
        
        // Update average rating
        if (totalVotes > 0) {
            uint256 currentRating = (contribution.upvotes * 100) / totalVotes;
            stats.averageRating = (stats.averageRating + currentRating) / 2;
        }
        
        emit RewardCalculated(rewardId, _contributionId, contribution.contributor, reward);
        
        return rewardId;
    }
    
    /**
     * @dev Claim pending reward
     * @param _rewardId The ID of the reward to claim
     */
    function claimReward(uint256 _rewardId) external nonReentrant whenNotPaused {
        require(_rewardId < nextRewardId, "Reward does not exist");
        
        PendingReward storage reward = pendingRewards[_rewardId];
        require(reward.contributor == msg.sender, "Not your reward");
        require(!reward.claimed, "Reward already claimed");
        require(reward.amount > 0, "No reward amount");
        
        reward.claimed = true;
        
        // Try to pay from story reward pool first, then platform pool
        StoryRegistry.Story memory story = storyRegistry.getStory(reward.storyId);
        bool paidFromStory = false;
        
        if (story.rewardPool >= reward.amount) {
            // Payment from story pool would need to be implemented in StoryRegistry
            // For now, we'll use platform pool
            paidFromStory = false;
        }
        
        if (!paidFromStory) {
            require(platformRewardPool >= reward.amount, "Insufficient platform funds");
            platformRewardPool -= reward.amount;
        }
        
        // Update stats
        contributorStats[msg.sender].totalRewardsEarned += reward.amount;
        totalRewardsDistributed += reward.amount;
        
        // Transfer reward
        (bool success, ) = payable(msg.sender).call{value: reward.amount}("");
        require(success, "Reward transfer failed");
        
        emit RewardClaimed(_rewardId, msg.sender, reward.amount);
    }
    
    /**
     * @dev Batch claim multiple rewards
     * @param _rewardIds Array of reward IDs to claim
     */
    function batchClaimRewards(uint256[] memory _rewardIds) external nonReentrant whenNotPaused {
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < _rewardIds.length; i++) {
            uint256 rewardId = _rewardIds[i];
            require(rewardId < nextRewardId, "Reward does not exist");
            
            PendingReward storage reward = pendingRewards[rewardId];
            require(reward.contributor == msg.sender, "Not your reward");
            require(!reward.claimed, "Reward already claimed");
            
            reward.claimed = true;
            totalAmount += reward.amount;
            
            emit RewardClaimed(rewardId, msg.sender, reward.amount);
        }
        
        require(totalAmount > 0, "No rewards to claim");
        require(platformRewardPool >= totalAmount, "Insufficient platform funds");
        
        platformRewardPool -= totalAmount;
        contributorStats[msg.sender].totalRewardsEarned += totalAmount;
        totalRewardsDistributed += totalAmount;
        
        (bool success, ) = payable(msg.sender).call{value: totalAmount}("");
        require(success, "Reward transfer failed");
    }
    
    /**
     * @dev Add funds to platform reward pool
     */
    function addToPlatformRewardPool() external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        platformRewardPool += msg.value;
        
        emit PlatformRewardPoolIncreased(msg.value);
    }
    
    /**
     * @dev Get user's pending rewards
     * @param _user The address of the user
     */
    function getUserPendingRewards(address _user) external view returns (uint256[] memory) {
        return userPendingRewards[_user];
    }
    
    /**
     * @dev Get contributor statistics
     * @param _contributor The address of the contributor
     */
    function getContributorStats(address _contributor) external view returns (ContributorStats memory) {
        return contributorStats[_contributor];
    }
    
    /**
     * @dev Get pending reward details
     * @param _rewardId The ID of the reward
     */
    function getPendingReward(uint256 _rewardId) external view returns (PendingReward memory) {
        require(_rewardId < nextRewardId, "Reward does not exist");
        return pendingRewards[_rewardId];
    }
    
    /**
     * @dev Get total claimable amount for user
     * @param _user The address of the user
     */
    function getClaimableAmount(address _user) external view returns (uint256) {
        uint256[] memory userRewards = userPendingRewards[_user];
        uint256 totalClaimable = 0;
        
        for (uint256 i = 0; i < userRewards.length; i++) {
            PendingReward memory reward = pendingRewards[userRewards[i]];
            if (!reward.claimed) {
                totalClaimable += reward.amount;
            }
        }
        
        return totalClaimable;
    }
    
    /**
     * @dev Update reward metrics (only owner)
     * @param _newMetrics New reward metrics
     */
    function updateRewardMetrics(RewardMetrics memory _newMetrics) external onlyOwner {
        require(_newMetrics.baseReward > 0, "Base reward must be positive");
        require(_newMetrics.timeDecayFactor <= 10000, "Invalid time decay factor");
        
        rewardMetrics = _newMetrics;
        
        emit RewardMetricsUpdated(_newMetrics);
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
