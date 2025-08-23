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
      "shape-testnet": process.env.SHAPE_EXPLORER_API_KEY || "placeholder",
      "shape-mainnet": process.env.SHAPE_EXPLORER_API_KEY || "placeholder",
    },
    customChains: [
      {
        network: "shape-testnet",
        chainId: 11011,
        urls: {
          apiURL: "https://testnet-explorer-api.shape.network/api",
          browserURL: "https://testnet-explorer.shape.network",
        },
      },
      {
        network: "shape-mainnet",
        chainId: 360,
        urls: {
          apiURL: "https://explorer-api.shape.network/api",
          browserURL: "https://explorer.shape.network",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};
