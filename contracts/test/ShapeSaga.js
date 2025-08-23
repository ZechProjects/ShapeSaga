const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShapeSaga Contracts", function () {
  let storyRegistry, contributionManager, nftMinter, rewardSystem;
  let owner, creator, contributor1, contributor2;

  const sampleMetadataURI = "ipfs://QmSampleStoryHash";
  const sampleContributionURI = "ipfs://QmSampleContributionHash";

  beforeEach(async function () {
    [owner, creator, contributor1, contributor2] = await ethers.getSigners();

    // Deploy StoryRegistry
    const StoryRegistry = await ethers.getContractFactory("StoryRegistry");
    storyRegistry = await StoryRegistry.deploy();
    await storyRegistry.waitForDeployment();

    // Deploy ContributionManager
    const ContributionManager = await ethers.getContractFactory(
      "ContributionManager"
    );
    contributionManager = await ContributionManager.deploy(
      await storyRegistry.getAddress()
    );
    await contributionManager.waitForDeployment();

    // Deploy NFTMinter
    const NFTMinter = await ethers.getContractFactory("NFTMinter");
    nftMinter = await NFTMinter.deploy(
      await storyRegistry.getAddress(),
      await contributionManager.getAddress()
    );
    await nftMinter.waitForDeployment();

    // Deploy RewardSystem
    const RewardSystem = await ethers.getContractFactory("RewardSystem");
    rewardSystem = await RewardSystem.deploy(
      await storyRegistry.getAddress(),
      await contributionManager.getAddress()
    );
    await rewardSystem.waitForDeployment();

    // Set the ContributionManager address in StoryRegistry
    await storyRegistry.setContributionManager(
      await contributionManager.getAddress()
    );

    // Add funding to reward system
    await rewardSystem.addToPlatformRewardPool({
      value: ethers.parseEther("10"),
    });
  });

  describe("StoryRegistry", function () {
    it("Should create a story successfully", async function () {
      const storySettings = {
        allowBranching: true,
        requireApproval: false,
        maxContributions: 100,
        contributionReward: ethers.parseEther("0.001"),
      };

      const tx = await storyRegistry.connect(creator).createStory(
        "Test Story",
        "A test story for our platform",
        0, // TEXT content type
        sampleMetadataURI,
        storySettings,
        { value: ethers.parseEther("0.001") }
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment?.name === "StoryCreated"
      );

      expect(event).to.not.be.undefined;
      expect(await storyRegistry.totalStories()).to.equal(1);
    });

    it("Should not allow empty title", async function () {
      const storySettings = {
        allowBranching: true,
        requireApproval: false,
        maxContributions: 100,
        contributionReward: ethers.parseEther("0.001"),
      };

      await expect(
        storyRegistry
          .connect(creator)
          .createStory("", "A test story", 0, sampleMetadataURI, storySettings)
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("Should allow creator to update metadata", async function () {
      const storySettings = {
        allowBranching: true,
        requireApproval: false,
        maxContributions: 100,
        contributionReward: ethers.parseEther("0.001"),
      };

      await storyRegistry
        .connect(creator)
        .createStory(
          "Test Story",
          "A test story",
          0,
          sampleMetadataURI,
          storySettings
        );

      const newMetadataURI = "ipfs://QmNewStoryHash";
      await storyRegistry
        .connect(creator)
        .updateStoryMetadata(1, newMetadataURI);

      const story = await storyRegistry.getStory(1);
      expect(story.metadataURI).to.equal(newMetadataURI);
    });
  });

  describe("ContributionManager", function () {
    beforeEach(async function () {
      const storySettings = {
        allowBranching: true,
        requireApproval: false,
        maxContributions: 100,
        contributionReward: ethers.parseEther("0.001"),
      };

      await storyRegistry
        .connect(creator)
        .createStory(
          "Test Story",
          "A test story",
          0,
          sampleMetadataURI,
          storySettings
        );
    });

    it("Should submit contribution successfully", async function () {
      const tx = await contributionManager
        .connect(contributor1)
        .submitContribution(
          1, // storyId
          0, // parentContributionId (0 for root)
          sampleContributionURI,
          false, // not a branch
          ""
        );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment?.name === "ContributionSubmitted"
      );

      expect(event).to.not.be.undefined;
      expect(await contributionManager.totalContributions()).to.equal(1);
    });

    it("Should create branch successfully", async function () {
      const tx = await contributionManager
        .connect(contributor1)
        .submitContribution(
          1, // storyId
          0, // parentContributionId
          sampleContributionURI,
          true, // is a branch
          "Alternative Ending"
        );

      const receipt = await tx.wait();
      const branchEvent = receipt.logs.find(
        (log) => log.fragment?.name === "BranchCreated"
      );

      expect(branchEvent).to.not.be.undefined;
    });

    it("Should allow voting on contributions", async function () {
      await contributionManager
        .connect(contributor1)
        .submitContribution(1, 0, sampleContributionURI, false, "");

      await contributionManager
        .connect(contributor2)
        .voteOnContribution(1, true); // upvote

      const contribution = await contributionManager.getContribution(1);
      expect(contribution.upvotes).to.equal(1);
      expect(contribution.downvotes).to.equal(0);
    });
  });

  describe("NFTMinter", function () {
    beforeEach(async function () {
      const storySettings = {
        allowBranching: true,
        requireApproval: false,
        maxContributions: 100,
        contributionReward: ethers.parseEther("0.001"),
      };

      await storyRegistry
        .connect(creator)
        .createStory(
          "Test Story",
          "A test story",
          0,
          sampleMetadataURI,
          storySettings
        );

      await contributionManager
        .connect(contributor1)
        .submitContribution(1, 0, sampleContributionURI, false, "");
    });

    it("Should mint story NFT for creator", async function () {
      const mintingFee = await nftMinter.mintingFee();

      const tx = await nftMinter
        .connect(creator)
        .mintStoryNFT(1, { value: mintingFee });

      expect(await nftMinter.ownerOf(1)).to.equal(creator.address);
      expect(await nftMinter.getStoryNFT(1)).to.equal(1);
    });

    it("Should mint contribution NFT for contributor", async function () {
      const mintingFee = await nftMinter.mintingFee();

      const tx = await nftMinter
        .connect(contributor1)
        .mintContributionNFT(1, { value: mintingFee });

      expect(await nftMinter.ownerOf(1)).to.equal(contributor1.address);
      expect(await nftMinter.getContributionNFT(1)).to.equal(1);
    });

    it("Should not allow non-creator to mint story NFT", async function () {
      const mintingFee = await nftMinter.mintingFee();

      await expect(
        nftMinter.connect(contributor1).mintStoryNFT(1, { value: mintingFee })
      ).to.be.revertedWith("Only story creator can mint");
    });
  });

  describe("RewardSystem", function () {
    beforeEach(async function () {
      const storySettings = {
        allowBranching: true,
        requireApproval: false,
        maxContributions: 100,
        contributionReward: ethers.parseEther("0.001"),
      };

      await storyRegistry
        .connect(creator)
        .createStory(
          "Test Story",
          "A test story",
          0,
          sampleMetadataURI,
          storySettings
        );

      await contributionManager
        .connect(contributor1)
        .submitContribution(1, 0, sampleContributionURI, false, "");

      // Add some upvotes
      await contributionManager
        .connect(contributor2)
        .voteOnContribution(1, true);
    });

    it("Should calculate reward for contribution", async function () {
      const viewCount = 100;

      const tx = await rewardSystem.calculateReward(1, viewCount);
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        (log) => log.fragment?.name === "RewardCalculated"
      );

      expect(event).to.not.be.undefined;

      const claimableAmount = await rewardSystem.getClaimableAmount(
        contributor1.address
      );
      expect(claimableAmount).to.be.gt(0);
    });

    it("Should allow contributor to claim reward", async function () {
      const viewCount = 100;
      await rewardSystem.calculateReward(1, viewCount);

      const balanceBefore = await ethers.provider.getBalance(
        contributor1.address
      );

      const pendingRewards = await rewardSystem.getUserPendingRewards(
        contributor1.address
      );
      await rewardSystem.connect(contributor1).claimReward(pendingRewards[0]);

      const balanceAfter = await ethers.provider.getBalance(
        contributor1.address
      );
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should update contributor stats", async function () {
      const viewCount = 100;
      await rewardSystem.calculateReward(1, viewCount);

      const stats = await rewardSystem.getContributorStats(
        contributor1.address
      );
      expect(stats.totalContributions).to.equal(1);
      expect(stats.totalUpvotes).to.equal(1);
    });
  });

  describe("Integration Tests", function () {
    it("Should complete full story lifecycle", async function () {
      // 1. Create story
      const storySettings = {
        allowBranching: true,
        requireApproval: false,
        maxContributions: 100,
        contributionReward: ethers.parseEther("0.001"),
      };

      await storyRegistry
        .connect(creator)
        .createStory(
          "Epic Adventure",
          "An epic story of adventure",
          0,
          sampleMetadataURI,
          storySettings,
          { value: ethers.parseEther("0.5") }
        );

      // 2. Add contribution
      await contributionManager
        .connect(contributor1)
        .submitContribution(1, 0, sampleContributionURI, false, "");

      // 3. Vote on contribution
      await contributionManager
        .connect(contributor2)
        .voteOnContribution(1, true);

      // 4. Calculate and claim reward
      await rewardSystem.calculateReward(1, 150);
      const pendingRewards = await rewardSystem.getUserPendingRewards(
        contributor1.address
      );
      await rewardSystem.connect(contributor1).claimReward(pendingRewards[0]);

      // 5. Mint NFTs
      const mintingFee = await nftMinter.mintingFee();
      await nftMinter.connect(creator).mintStoryNFT(1, { value: mintingFee });
      await nftMinter
        .connect(contributor1)
        .mintContributionNFT(1, { value: mintingFee });

      // Verify final state
      expect(await storyRegistry.totalStories()).to.equal(1);
      expect(await contributionManager.totalContributions()).to.equal(1);
      expect(await nftMinter.balanceOf(creator.address)).to.equal(1);
      expect(await nftMinter.balanceOf(contributor1.address)).to.equal(1);

      const stats = await rewardSystem.getContributorStats(
        contributor1.address
      );
      expect(stats.totalRewardsEarned).to.be.gt(0);
    });
  });
});
