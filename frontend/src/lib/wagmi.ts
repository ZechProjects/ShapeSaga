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

// Get the current app URL dynamically
const getAppUrl = () => {
  // If we're in the browser, use the actual current URL
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // For SSR/build time, check environment variable
  const envUrl = import.meta.env.VITE_APP_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim();
  }

  // Fallback: try to construct from dev server config
  const isDev = import.meta.env.DEV;
  if (isDev) {
    // In development, try to use the Vite dev server port
    const defaultPort = import.meta.env.VITE_PORT || "3000";
    return `http://localhost:${defaultPort}`;
  }

  // Final fallback
  return "http://localhost:3000";
};

// Create WalletConnect connector with dynamic URL
const createWalletConnectConnector = () => {
  const appUrl = getAppUrl();
  console.log("🔗 WalletConnect App URL:", appUrl);

  return new WalletConnectConnector({
    chains,
    options: {
      projectId,
      metadata: {
        name: "ShapeSaga",
        description: "Collaborative storytelling platform on Shape Network",
        url: appUrl,
        icons: ["https://shapesaga.vercel.app/favicon.ico"],
      },
      showQrModal: true,
    },
  });
};

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
    createWalletConnectConnector(),
  ],
  publicClient,
  webSocketPublicClient,
});

export { chains, shapeTestnetConfig };
