/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_PINATA_API_KEY: string;
  readonly VITE_PINATA_SECRET_KEY: string;
  readonly VITE_SHAPE_RPC_URL: string;
  readonly VITE_SHAPE_TESTNET_RPC_URL: string;
  readonly VITE_CONTRACT_STORY_REGISTRY: string;
  readonly VITE_CONTRACT_CONTRIBUTION_MANAGER: string;
  readonly VITE_CONTRACT_NFT_MINTER: string;
  readonly VITE_CONTRACT_REWARD_SYSTEM: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
