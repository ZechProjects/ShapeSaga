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
    default: { name: "Shape Explorer", url: "https://shapescan.xyz" },
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
      url: "https://sepolia.shapescan.xyz",
    },
  },
  testnet: true,
} as const;

// Configure chains - using testnet only for development
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [shapeTestnetConfig],
  [publicProvider()]
);

// WalletConnect project ID - replace with your own
const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
  "e5427b992adba543fdada0fbcf1f52e1";

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId,
        metadata: {
          name: "ShapeSaga",
          description: "Collaborative storytelling platform on Shape Network",
          url:
            typeof window !== "undefined"
              ? window.location.origin
              : "https://localhost:3000",
          icons: ["https://shapesaga.vercel.app/favicon.ico"],
        },
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export { chains, shapeTestnetConfig };
