// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./StoryRegistry.sol";
import "./ContributionManager.sol";

/**
 * @title NFTMinter
 * @dev Mints NFTs for story contributions and stories
 */
contract NFTMinter is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    
    struct NFTMetadata {
        uint256 storyId;
        uint256 contributionId; // 0 for original story NFTs
        address creator;
        uint256 mintedAt;
        string contentType; // "story", "contribution", "branch"
    }
    
    // State variables
    StoryRegistry public storyRegistry;
    ContributionManager public contributionManager;
    uint256 public nextTokenId = 1;
    uint256 public mintingFee = 0.001 ether; // Fee to mint NFT
    
    mapping(uint256 => NFTMetadata) public nftMetadata; // tokenId => metadata
    mapping(uint256 => uint256) public storyToNFT; // storyId => tokenId (for original stories)
    mapping(uint256 => uint256) public contributionToNFT; // contributionId => tokenId
    mapping(address => uint256[]) public userNFTs;
    
    // Events
    event StoryNFTMinted(uint256 indexed tokenId, uint256 indexed storyId, address indexed creator);
    event ContributionNFTMinted(uint256 indexed tokenId, uint256 indexed contributionId, address indexed creator);
    event MintingFeeUpdated(uint256 newFee);
    
    constructor(
        address _storyRegistry,
        address _contributionManager
    ) ERC721("ShapeSaga NFT", "SAGA") Ownable(msg.sender) {
        storyRegistry = StoryRegistry(_storyRegistry);
        contributionManager = ContributionManager(_contributionManager);
    }
    
    /**
     * @dev Mint NFT for a story (original creator only)
     * @param _storyId The ID of the story to mint NFT for
     */
    function mintStoryNFT(uint256 _storyId) external payable nonReentrant returns (uint256) {
        require(msg.value >= mintingFee, "Insufficient minting fee");
        require(storyToNFT[_storyId] == 0, "Story NFT already minted");
        
        StoryRegistry.Story memory story = storyRegistry.getStory(_storyId);
        require(story.creator == msg.sender, "Only story creator can mint");
        require(story.isActive, "Story is not active");
        
        uint256 tokenId = nextTokenId++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, story.metadataURI);
        
        nftMetadata[tokenId] = NFTMetadata({
            storyId: _storyId,
            contributionId: 0,
            creator: msg.sender,
            mintedAt: block.timestamp,
            contentType: "story"
        });
        
        storyToNFT[_storyId] = tokenId;
        userNFTs[msg.sender].push(tokenId);
        
        emit StoryNFTMinted(tokenId, _storyId, msg.sender);
        
        return tokenId;
    }
    
    /**
     * @dev Mint NFT for a contribution (contributor only)
     * @param _contributionId The ID of the contribution to mint NFT for
     */
    function mintContributionNFT(uint256 _contributionId) external payable nonReentrant returns (uint256) {
        require(msg.value >= mintingFee, "Insufficient minting fee");
        require(contributionToNFT[_contributionId] == 0, "Contribution NFT already minted");
        
        ContributionManager.Contribution memory contribution = contributionManager.getContribution(_contributionId);
        require(contribution.contributor == msg.sender, "Only contributor can mint");
        require(contribution.status == ContributionManager.ContributionStatus.APPROVED, "Contribution not approved");
        
        uint256 tokenId = nextTokenId++;
        string memory contentType = contribution.isBranch ? "branch" : "contribution";
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, contribution.metadataURI);
        
        nftMetadata[tokenId] = NFTMetadata({
            storyId: contribution.storyId,
            contributionId: _contributionId,
            creator: msg.sender,
            mintedAt: block.timestamp,
            contentType: contentType
        });
        
        contributionToNFT[_contributionId] = tokenId;
        userNFTs[msg.sender].push(tokenId);
        
        emit ContributionNFTMinted(tokenId, _contributionId, msg.sender);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint NFTs for multiple contributions
     * @param _contributionIds Array of contribution IDs to mint NFTs for
     */
    function batchMintContributionNFTs(uint256[] memory _contributionIds) 
        external 
        payable 
        nonReentrant 
        returns (uint256[] memory) 
    {
        require(msg.value >= mintingFee * _contributionIds.length, "Insufficient minting fee");
        
        uint256[] memory tokenIds = new uint256[](_contributionIds.length);
        
        for (uint256 i = 0; i < _contributionIds.length; i++) {
            uint256 contributionId = _contributionIds[i];
            require(contributionToNFT[contributionId] == 0, "Contribution NFT already minted");
            
            ContributionManager.Contribution memory contribution = contributionManager.getContribution(contributionId);
            require(contribution.contributor == msg.sender, "Only contributor can mint");
            require(contribution.status == ContributionManager.ContributionStatus.APPROVED, "Contribution not approved");
            
            uint256 tokenId = nextTokenId++;
            string memory contentType = contribution.isBranch ? "branch" : "contribution";
            
            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, contribution.metadataURI);
            
            nftMetadata[tokenId] = NFTMetadata({
                storyId: contribution.storyId,
                contributionId: contributionId,
                creator: msg.sender,
                mintedAt: block.timestamp,
                contentType: contentType
            });
            
            contributionToNFT[contributionId] = tokenId;
            userNFTs[msg.sender].push(tokenId);
            tokenIds[i] = tokenId;
            
            emit ContributionNFTMinted(tokenId, contributionId, msg.sender);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Get NFT metadata
     * @param _tokenId The ID of the token
     */
    function getNFTMetadata(uint256 _tokenId) external view returns (NFTMetadata memory) {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        return nftMetadata[_tokenId];
    }
    
    /**
     * @dev Get user's NFTs
     * @param _user The address of the user
     */
    function getUserNFTs(address _user) external view returns (uint256[] memory) {
        return userNFTs[_user];
    }
    
    /**
     * @dev Check if story has NFT
     * @param _storyId The ID of the story
     */
    function getStoryNFT(uint256 _storyId) external view returns (uint256) {
        return storyToNFT[_storyId];
    }
    
    /**
     * @dev Check if contribution has NFT
     * @param _contributionId The ID of the contribution
     */
    function getContributionNFT(uint256 _contributionId) external view returns (uint256) {
        return contributionToNFT[_contributionId];
    }
    
    /**
     * @dev Set minting fee (only owner)
     * @param _fee New minting fee in wei
     */
    function setMintingFee(uint256 _fee) external onlyOwner {
        mintingFee = _fee;
        emit MintingFeeUpdated(_fee);
    }
    
    /**
     * @dev Withdraw collected fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Override required by Solidity for ERC721URIStorage
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override required by Solidity for ERC721URIStorage
     */
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Override _update to track user NFTs
     */
    function _update(address to, uint256 tokenId, address auth) 
        internal 
        override 
        returns (address) 
    {
        address from = _ownerOf(tokenId);
        
        // Remove from previous owner's list
        if (from != address(0) && from != to) {
            uint256[] storage fromNFTs = userNFTs[from];
            for (uint256 i = 0; i < fromNFTs.length; i++) {
                if (fromNFTs[i] == tokenId) {
                    fromNFTs[i] = fromNFTs[fromNFTs.length - 1];
                    fromNFTs.pop();
                    break;
                }
            }
        }
        
        // Add to new owner's list
        if (to != address(0) && from != to) {
            userNFTs[to].push(tokenId);
        }
        
        return super._update(to, tokenId, auth);
    }
}
