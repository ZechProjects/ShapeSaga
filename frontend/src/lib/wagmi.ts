import { createConfig, configureChains } from "wagmi";
import { InjectedConnector } from "@wagmi/connectors/injected";
import { MetaMaskConnector } from "@wagmi/connectors/metaMask";
import { WalletConnectConnector } from "@wagmi/connectors/walletConnect";
import { publicProvider } from "wagmi/providers/public";

// Shape Testnet configuration
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
    public: { http: ["https://sepolia.shape.network"] },
    default: { http: ["https://sepolia.shape.network"] },
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
    new InjectedConnector({
      chains,
      options: {
        name: "Browser Wallet",
        shimDisconnect: true,
      },
    }),
    new MetaMaskConnector({
      chains,
      options: {
        shimDisconnect: true,
      },
    }),
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
        showQrModal: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export { chains, shapeTestnetConfig };
