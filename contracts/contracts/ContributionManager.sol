// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./StoryRegistry.sol";

/**
 * @title ContributionManager
 * @dev Manages story contributions and branching logic
 */
contract ContributionManager is Ownable, ReentrancyGuard, Pausable {
    
    enum ContributionStatus { PENDING, APPROVED, REJECTED }
    
    struct Contribution {
        uint256 id;
        uint256 storyId;
        uint256 parentContributionId; // 0 for root story contributions
        address contributor;
        string metadataURI; // IPFS URI for contribution content
        ContributionStatus status;
        uint256 createdAt;
        uint256 upvotes;
        uint256 downvotes;
        bool isBranch; // true if this creates a new story branch
    }
    
    struct Branch {
        uint256 id;
        uint256 originalStoryId;
        uint256 branchContributionId;
        address creator;
        string title;
        uint256 createdAt;
    }
    
    // State variables
    StoryRegistry public storyRegistry;
    uint256 public nextContributionId = 1;
    uint256 public nextBranchId = 1;
    uint256 public totalContributions;
    
    mapping(uint256 => Contribution) public contributions;
    mapping(uint256 => Branch) public branches;
    mapping(uint256 => uint256[]) public storyContributions; // storyId => contributionIds
    mapping(uint256 => uint256[]) public contributionChildren; // contributionId => childContributionIds
    mapping(address => uint256[]) public userContributions;
    mapping(uint256 => mapping(address => bool)) public hasVoted; // contributionId => user => hasVoted
    mapping(uint256 => mapping(address => bool)) public userVote; // contributionId => user => vote (true=upvote, false=downvote)
    
    // Tree structure metrics
    mapping(uint256 => uint256) public storyRootContributions; // storyId => count of root contributions
    mapping(uint256 => uint256) public storyBranchCount; // storyId => count of branches
    mapping(uint256 => uint256) public storyMaxDepth; // storyId => maximum tree depth
    mapping(uint256 => uint256) public contributionDepth; // contributionId => depth from root
    
    // Events
    event ContributionSubmitted(
        uint256 indexed contributionId,
        uint256 indexed storyId,
        address indexed contributor,
        bool isBranch
    );
    
    event ContributionApproved(uint256 indexed contributionId);
    event ContributionRejected(uint256 indexed contributionId);
    event BranchCreated(uint256 indexed branchId, uint256 indexed originalStoryId, string title);
    event ContributionVoted(uint256 indexed contributionId, address indexed voter, bool isUpvote);
    
    constructor(address _storyRegistry) Ownable(msg.sender) {
        storyRegistry = StoryRegistry(_storyRegistry);
    }
    
    /**
     * @dev Submit a contribution to a story
     * @param _storyId The ID of the story to contribute to
     * @param _parentContributionId The ID of the parent contribution (0 for root)
     * @param _metadataURI IPFS URI containing contribution content
     * @param _isBranch Whether this contribution creates a new branch
     * @param _branchTitle Title for the new branch (if _isBranch is true)
     */
    function submitContribution(
        uint256 _storyId,
        uint256 _parentContributionId,
        string memory _metadataURI,
        bool _isBranch,
        string memory _branchTitle
    ) external nonReentrant whenNotPaused returns (uint256) {
        // Verify story exists and is active
        StoryRegistry.Story memory story = storyRegistry.getStory(_storyId);
        require(story.isActive, "Story is not active");
        
        // Verify parent contribution exists (if specified)
        if (_parentContributionId > 0) {
            require(_parentContributionId < nextContributionId, "Parent contribution does not exist");
            require(contributions[_parentContributionId].storyId == _storyId, "Parent contribution not in same story");
        }
        
        // Check story settings
        StoryRegistry.StorySettings memory settings = storyRegistry.getStorySettings(_storyId);
        if (_isBranch) {
            require(settings.allowBranching, "Branching not allowed for this story");
            require(bytes(_branchTitle).length > 0, "Branch title required");
        }
        
        uint256 contributionId = nextContributionId++;
        
        // Calculate depth
        uint256 depth = 0;
        if (_parentContributionId > 0) {
            depth = contributionDepth[_parentContributionId] + 1;
        }
        
        contributions[contributionId] = Contribution({
            id: contributionId,
            storyId: _storyId,
            parentContributionId: _parentContributionId,
            contributor: msg.sender,
            metadataURI: _metadataURI,
            status: settings.requireApproval ? ContributionStatus.PENDING : ContributionStatus.APPROVED,
            createdAt: block.timestamp,
            upvotes: 0,
            downvotes: 0,
            isBranch: _isBranch
        });
        
        // Store depth and update metrics
        contributionDepth[contributionId] = depth;
        if (depth > storyMaxDepth[_storyId]) {
            storyMaxDepth[_storyId] = depth;
        }
        
        storyContributions[_storyId].push(contributionId);
        userContributions[msg.sender].push(contributionId);
        totalContributions++;
        
        // Update tree-specific metrics
        if (_parentContributionId == 0) {
            storyRootContributions[_storyId]++;
        }
        if (_isBranch) {
            storyBranchCount[_storyId]++;
        }
        
        // Add to parent's children if applicable
        if (_parentContributionId > 0) {
            contributionChildren[_parentContributionId].push(contributionId);
        }
        
        // Create branch if requested
        if (_isBranch) {
            uint256 branchId = nextBranchId++;
            branches[branchId] = Branch({
                id: branchId,
                originalStoryId: _storyId,
                branchContributionId: contributionId,
                creator: msg.sender,
                title: _branchTitle,
                createdAt: block.timestamp
            });
            
            emit BranchCreated(branchId, _storyId, _branchTitle);
        }
        
        emit ContributionSubmitted(contributionId, _storyId, msg.sender, _isBranch);
        
        // Auto-approve if no approval required
        if (!settings.requireApproval) {
            _processApproval(contributionId);
        }
        
        return contributionId;
    }
    
    /**
     * @dev Approve a pending contribution (story creator or owner)
     * @param _contributionId The ID of the contribution to approve
     */
    function approveContribution(uint256 _contributionId) external nonReentrant {
        require(_contributionId < nextContributionId, "Contribution does not exist");
        
        Contribution storage contribution = contributions[_contributionId];
        require(contribution.status == ContributionStatus.PENDING, "Contribution not pending");
        
        StoryRegistry.Story memory story = storyRegistry.getStory(contribution.storyId);
        require(
            story.creator == msg.sender || msg.sender == owner(),
            "Not authorized to approve"
        );
        
        contribution.status = ContributionStatus.APPROVED;
        _processApproval(_contributionId);
        
        emit ContributionApproved(_contributionId);
    }
    
    /**
     * @dev Reject a pending contribution (story creator or owner)
     * @param _contributionId The ID of the contribution to reject
     */
    function rejectContribution(uint256 _contributionId) external nonReentrant {
        require(_contributionId < nextContributionId, "Contribution does not exist");
        
        Contribution storage contribution = contributions[_contributionId];
        require(contribution.status == ContributionStatus.PENDING, "Contribution not pending");
        
        StoryRegistry.Story memory story = storyRegistry.getStory(contribution.storyId);
        require(
            story.creator == msg.sender || msg.sender == owner(),
            "Not authorized to reject"
        );
        
        contribution.status = ContributionStatus.REJECTED;
        
        emit ContributionRejected(_contributionId);
    }
    
    /**
     * @dev Vote on a contribution
     * @param _contributionId The ID of the contribution to vote on
     * @param _isUpvote True for upvote, false for downvote
     */
    function voteOnContribution(uint256 _contributionId, bool _isUpvote) external nonReentrant whenNotPaused {
        require(_contributionId < nextContributionId, "Contribution does not exist");
        require(contributions[_contributionId].status == ContributionStatus.APPROVED, "Contribution not approved");
        require(!hasVoted[_contributionId][msg.sender], "Already voted");
        
        hasVoted[_contributionId][msg.sender] = true;
        userVote[_contributionId][msg.sender] = _isUpvote;
        
        if (_isUpvote) {
            contributions[_contributionId].upvotes++;
        } else {
            contributions[_contributionId].downvotes++;
        }
        
        emit ContributionVoted(_contributionId, msg.sender, _isUpvote);
    }
    
    /**
     * @dev Change vote on a contribution
     * @param _contributionId The ID of the contribution
     * @param _isUpvote True for upvote, false for downvote
     */
    function changeVote(uint256 _contributionId, bool _isUpvote) external nonReentrant whenNotPaused {
        require(_contributionId < nextContributionId, "Contribution does not exist");
        require(hasVoted[_contributionId][msg.sender], "Haven't voted yet");
        require(userVote[_contributionId][msg.sender] != _isUpvote, "Same vote");
        
        // Remove old vote
        if (userVote[_contributionId][msg.sender]) {
            contributions[_contributionId].upvotes--;
        } else {
            contributions[_contributionId].downvotes--;
        }
        
        // Add new vote
        userVote[_contributionId][msg.sender] = _isUpvote;
        if (_isUpvote) {
            contributions[_contributionId].upvotes++;
        } else {
            contributions[_contributionId].downvotes++;
        }
        
        emit ContributionVoted(_contributionId, msg.sender, _isUpvote);
    }
    
    /**
     * @dev Get contribution details
     * @param _contributionId The ID of the contribution
     */
    function getContribution(uint256 _contributionId) external view returns (Contribution memory) {
        require(_contributionId < nextContributionId, "Contribution does not exist");
        return contributions[_contributionId];
    }
    
    /**
     * @dev Get contributions for a story
     * @param _storyId The ID of the story
     */
    function getStoryContributions(uint256 _storyId) external view returns (uint256[] memory) {
        return storyContributions[_storyId];
    }
    
    /**
     * @dev Get child contributions
     * @param _contributionId The ID of the parent contribution
     */
    function getContributionChildren(uint256 _contributionId) external view returns (uint256[] memory) {
        return contributionChildren[_contributionId];
    }
    
    /**
     * @dev Get user contributions
     * @param _user The address of the user
     */
    function getUserContributions(address _user) external view returns (uint256[] memory) {
        return userContributions[_user];
    }
    
    /**
     * @dev Get branch details
     * @param _branchId The ID of the branch
     */
    function getBranch(uint256 _branchId) external view returns (Branch memory) {
        require(_branchId < nextBranchId, "Branch does not exist");
        return branches[_branchId];
    }
    
    /**
     * @dev Get story tree metrics
     * @param _storyId The ID of the story
     */
    function getStoryTreeMetrics(uint256 _storyId) external view returns (
        uint256 totalContributions,
        uint256 rootContributions,
        uint256 branchCount,
        uint256 maxDepth
    ) {
        return (
            storyContributions[_storyId].length,
            storyRootContributions[_storyId],
            storyBranchCount[_storyId],
            storyMaxDepth[_storyId]
        );
    }
    
    /**
     * @dev Get contribution depth
     * @param _contributionId The ID of the contribution
     */
    function getContributionDepth(uint256 _contributionId) external view returns (uint256) {
        require(_contributionId < nextContributionId, "Contribution does not exist");
        return contributionDepth[_contributionId];
    }
    
    /**
     * @dev Internal function to process contribution approval
     * @param _contributionId The ID of the contribution
     */
    function _processApproval(uint256 _contributionId) internal {
        Contribution storage contribution = contributions[_contributionId];
        
        // Add contributor to story registry
        storyRegistry._addContributor(contribution.storyId, contribution.contributor);
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
