import { http, createConfig } from "wagmi";
import { shapeTestnet, shapeSepolia } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

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

// WalletConnect project ID - replace with your own
const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "your-project-id";

export const config = createConfig({
  chains: [shapeTestnetConfig, shapeMainnet],
  connectors: [injected(), metaMask(), walletConnect({ projectId })],
  transports: {
    [shapeTestnetConfig.id]: http(),
    [shapeMainnet.id]: http(),
  },
});

export { shapeMainnet, shapeTestnetConfig };
