require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "shape-testnet",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    "shape-testnet": {
      url:
        process.env.SHAPE_TESTNET_RPC_URL ||
        "https://testnet-rpc.shape.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11011, // Shape testnet chain ID
    },
    "shape-mainnet": {
      url:
        process.env.SHAPE_MAINNET_RPC_URL ||
        "https://mainnet-rpc.shape.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 360, // Shape mainnet chain ID
    },
  },
  etherscan: {
    apiKey: {
      // Both Shape testnet and mainnet use Blockscout (no API keys required)
      "shape-testnet": "abc", // dummy key for blockscout
      "shape-mainnet": "abc", // dummy key for blockscout
    },
    customChains: [
      {
        network: "shape-testnet",
        chainId: 11011,
        urls: {
          apiURL: "https://sepolia.shapescan.xyz/api",
          browserURL: "https://sepolia.shapescan.xyz",
        },
      },
      {
        network: "shape-mainnet",
        chainId: 360,
        urls: {
          apiURL: "https://shapescan.xyz/api",
          browserURL: "https://shapescan.xyz",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};
