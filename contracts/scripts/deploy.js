const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    (await deployer.provider.getBalance(deployer.address)).toString()
  );

  // Deploy StoryRegistry
  console.log("\n🚀 Deploying StoryRegistry...");
  const StoryRegistry = await ethers.getContractFactory("StoryRegistry");
  const storyRegistry = await StoryRegistry.deploy();
  await storyRegistry.waitForDeployment();
  const storyRegistryAddress = await storyRegistry.getAddress();
  console.log("✅ StoryRegistry deployed to:", storyRegistryAddress);

  // Deploy ContributionManager
  console.log("\n🚀 Deploying ContributionManager...");
  const ContributionManager = await ethers.getContractFactory(
    "ContributionManager"
  );
  const contributionManager = await ContributionManager.deploy(
    storyRegistryAddress
  );
  await contributionManager.waitForDeployment();
  const contributionManagerAddress = await contributionManager.getAddress();
  console.log(
    "✅ ContributionManager deployed to:",
    contributionManagerAddress
  );

  // Deploy NFTMinter
  console.log("\n🚀 Deploying NFTMinter...");
  const NFTMinter = await ethers.getContractFactory("NFTMinter");
  const nftMinter = await NFTMinter.deploy(
    storyRegistryAddress,
    contributionManagerAddress
  );
  await nftMinter.waitForDeployment();
  const nftMinterAddress = await nftMinter.getAddress();
  console.log("✅ NFTMinter deployed to:", nftMinterAddress);

  // Deploy RewardSystem
  console.log("\n🚀 Deploying RewardSystem...");
  const RewardSystem = await ethers.getContractFactory("RewardSystem");
  const rewardSystem = await RewardSystem.deploy(
    storyRegistryAddress,
    contributionManagerAddress
  );
  await rewardSystem.waitForDeployment();
  const rewardSystemAddress = await rewardSystem.getAddress();
  console.log("✅ RewardSystem deployed to:", rewardSystemAddress);

  // Add initial funding to reward system
  console.log("\n💰 Adding initial funding to RewardSystem...");
  const initialFunding = ethers.parseEther("1.0"); // 1 ETH
  await rewardSystem.addToPlatformRewardPool({ value: initialFunding });
  console.log("✅ Added 1 ETH to platform reward pool");

  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(50));
  console.log(`StoryRegistry:      ${storyRegistryAddress}`);
  console.log(`ContributionManager: ${contributionManagerAddress}`);
  console.log(`NFTMinter:          ${nftMinterAddress}`);
  console.log(`RewardSystem:       ${rewardSystemAddress}`);
  console.log("=".repeat(50));

  // Save deployment info
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    contracts: {
      StoryRegistry: storyRegistryAddress,
      ContributionManager: contributionManagerAddress,
      NFTMinter: nftMinterAddress,
      RewardSystem: rewardSystemAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  const fs = require("fs");
  const path = require("path");

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const networkName = (await ethers.provider.getNetwork()).name || "unknown";
  const fileName = `${networkName}-${Date.now()}.json`;
  const filePath = path.join(deploymentsDir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${filePath}`);

  // Verify contracts on Shape Network explorer (if API key provided)
  if (
    process.env.SHAPE_EXPLORER_API_KEY &&
    process.env.SHAPE_EXPLORER_API_KEY !== "placeholder"
  ) {
    console.log("\n🔍 Verifying contracts...");

    try {
      await hre.run("verify:verify", {
        address: storyRegistryAddress,
        constructorArguments: [],
      });
      console.log("✅ StoryRegistry verified");
    } catch (error) {
      console.log("❌ StoryRegistry verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: contributionManagerAddress,
        constructorArguments: [storyRegistryAddress],
      });
      console.log("✅ ContributionManager verified");
    } catch (error) {
      console.log("❌ ContributionManager verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: nftMinterAddress,
        constructorArguments: [
          storyRegistryAddress,
          contributionManagerAddress,
        ],
      });
      console.log("✅ NFTMinter verified");
    } catch (error) {
      console.log("❌ NFTMinter verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: rewardSystemAddress,
        constructorArguments: [
          storyRegistryAddress,
          contributionManagerAddress,
        ],
      });
      console.log("✅ RewardSystem verified");
    } catch (error) {
      console.log("❌ RewardSystem verification failed:", error.message);
    }
  } else {
    console.log("\n⚠️  Skipping contract verification (no API key provided)");
    console.log("Add SHAPE_EXPLORER_API_KEY to .env to enable verification");
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📖 Next steps:");
  console.log(
    "1. Update your frontend configuration with the deployed contract addresses"
  );
  console.log("2. Test the contracts using the provided test scripts");
  console.log("3. Start building your ShapeSaga frontend!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
