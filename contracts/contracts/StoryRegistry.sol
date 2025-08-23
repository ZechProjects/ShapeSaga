// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title StoryRegistry
 * @dev Main contract for managing story creation and metadata on Shape Network
 */
contract StoryRegistry is Ownable, ReentrancyGuard, Pausable {
    
    enum ContentType { TEXT, IMAGE, VIDEO }
    
    struct Story {
        uint256 id;
        address creator;
        string title;
        string description;
        ContentType contentType;
        string metadataURI; // IPFS URI for story content
        uint256 createdAt;
        uint256 totalContributions;
        bool isActive;
        uint256 rewardPool; // ETH reward pool for contributors
    }
    
    struct StorySettings {
        bool allowBranching;
        bool requireApproval;
        uint256 maxContributions;
        uint256 contributionReward;
    }
    
    // State variables
    uint256 public nextStoryId = 1;
    uint256 public totalStories;
    uint256 public platformFee = 250; // 2.5% platform fee (basis points)
    
    mapping(uint256 => Story) public stories;
    mapping(uint256 => StorySettings) public storySettings;
    mapping(uint256 => address[]) public storyContributors;
    mapping(address => uint256[]) public userStories;
    
    // Events
    event StoryCreated(
        uint256 indexed storyId,
        address indexed creator,
        string title,
        ContentType contentType
    );
    
    event StoryUpdated(uint256 indexed storyId, string metadataURI);
    event RewardPoolIncreased(uint256 indexed storyId, uint256 amount);
    event StoryDeactivated(uint256 indexed storyId);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new story
     * @param _title The title of the story
     * @param _description Brief description of the story
     * @param _contentType Type of content (TEXT, IMAGE, VIDEO)
     * @param _metadataURI IPFS URI containing story content and metadata
     * @param _settings Story configuration settings
     */
    function createStory(
        string memory _title,
        string memory _description,
        ContentType _contentType,
        string memory _metadataURI,
        StorySettings memory _settings
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_metadataURI).length > 0, "Metadata URI cannot be empty");
        
        uint256 storyId = nextStoryId++;
        
        stories[storyId] = Story({
            id: storyId,
            creator: msg.sender,
            title: _title,
            description: _description,
            contentType: _contentType,
            metadataURI: _metadataURI,
            createdAt: block.timestamp,
            totalContributions: 0,
            isActive: true,
            rewardPool: msg.value
        });
        
        storySettings[storyId] = _settings;
        userStories[msg.sender].push(storyId);
        totalStories++;
        
        emit StoryCreated(storyId, msg.sender, _title, _contentType);
        
        if (msg.value > 0) {
            emit RewardPoolIncreased(storyId, msg.value);
        }
        
        return storyId;
    }
    
    /**
     * @dev Update story metadata URI
     * @param _storyId The ID of the story to update
     * @param _metadataURI New IPFS URI for story content
     */
    function updateStoryMetadata(uint256 _storyId, string memory _metadataURI) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(_storyId < nextStoryId, "Story does not exist");
        require(stories[_storyId].creator == msg.sender, "Only creator can update");
        require(stories[_storyId].isActive, "Story is not active");
        require(bytes(_metadataURI).length > 0, "Metadata URI cannot be empty");
        
        stories[_storyId].metadataURI = _metadataURI;
        
        emit StoryUpdated(_storyId, _metadataURI);
    }
    
    /**
     * @dev Add funds to story reward pool
     * @param _storyId The ID of the story
     */
    function addToRewardPool(uint256 _storyId) external payable nonReentrant whenNotPaused {
        require(_storyId < nextStoryId, "Story does not exist");
        require(stories[_storyId].isActive, "Story is not active");
        require(msg.value > 0, "Must send ETH");
        
        stories[_storyId].rewardPool += msg.value;
        
        emit RewardPoolIncreased(_storyId, msg.value);
    }
    
    /**
     * @dev Deactivate a story (only creator or owner)
     * @param _storyId The ID of the story to deactivate
     */
    function deactivateStory(uint256 _storyId) external nonReentrant {
        require(_storyId < nextStoryId, "Story does not exist");
        require(
            stories[_storyId].creator == msg.sender || msg.sender == owner(),
            "Not authorized"
        );
        require(stories[_storyId].isActive, "Story already inactive");
        
        stories[_storyId].isActive = false;
        
        emit StoryDeactivated(_storyId);
    }
    
    /**
     * @dev Get story details
     * @param _storyId The ID of the story
     */
    function getStory(uint256 _storyId) external view returns (Story memory) {
        require(_storyId < nextStoryId, "Story does not exist");
        return stories[_storyId];
    }
    
    /**
     * @dev Get story settings
     * @param _storyId The ID of the story
     */
    function getStorySettings(uint256 _storyId) external view returns (StorySettings memory) {
        require(_storyId < nextStoryId, "Story does not exist");
        return storySettings[_storyId];
    }
    
    /**
     * @dev Get stories created by a user
     * @param _user The address of the user
     */
    function getUserStories(address _user) external view returns (uint256[] memory) {
        return userStories[_user];
    }
    
    /**
     * @dev Get contributors for a story
     * @param _storyId The ID of the story
     */
    function getStoryContributors(uint256 _storyId) external view returns (address[] memory) {
        require(_storyId < nextStoryId, "Story does not exist");
        return storyContributors[_storyId];
    }
    
    /**
     * @dev Internal function to add contributor (called by ContributionManager)
     * @param _storyId The ID of the story
     * @param _contributor The address of the contributor
     */
    function _addContributor(uint256 _storyId, address _contributor) external {
        // This should only be called by the ContributionManager contract
        // In a full implementation, you'd add access control here
        require(_storyId < nextStoryId, "Story does not exist");
        require(stories[_storyId].isActive, "Story is not active");
        
        storyContributors[_storyId].push(_contributor);
        stories[_storyId].totalContributions++;
    }
    
    /**
     * @dev Set platform fee (only owner)
     * @param _fee Fee in basis points (e.g., 250 = 2.5%)
     */
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee cannot exceed 10%");
        platformFee = _fee;
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
    
    /**
     * @dev Withdraw platform fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
