import { createConfig, configureChains } from "wagmi";
import { InjectedConnector } from "@wagmi/connectors/injected";
import { MetaMaskConnector } from "@wagmi/connectors/metaMask";
import { WalletConnectConnector } from "@wagmi/connectors/walletConnect";
import { publicProvider } from "wagmi/providers/public";

// Shape Network configuration
const shapeMainnet = {
  id: 360,
  name: "Shape",
  network: "shape",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://mainnet-rpc.shape.network"] },
    default: { http: ["https://mainnet-rpc.shape.network"] },
  },
  blockExplorers: {
    default: { name: "Shape Explorer", url: "https://explorer.shape.network" },
  },
} as const;

const shapeTestnetConfig = {
  id: 11011,
  name: "Shape Testnet",
  network: "shape-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://testnet-rpc.shape.network"] },
    default: { http: ["https://testnet-rpc.shape.network"] },
  },
  blockExplorers: {
    default: {
      name: "Shape Testnet Explorer",
      url: "https://testnet-explorer.shape.network",
    },
  },
  testnet: true,
} as const;

// Configure chains - prioritizing testnet for development
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [shapeTestnetConfig, shapeMainnet],
  [publicProvider()]
);

// WalletConnect project ID - replace with your own
const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "your-project-id";

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export { chains, shapeMainnet, shapeTestnetConfig };
