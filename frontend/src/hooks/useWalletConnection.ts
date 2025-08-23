import { useAccount, useNetwork } from "wagmi";
import { shapeTestnetConfig } from "../lib/wagmi";

export function useWalletConnection() {
  const { address, isConnected, isConnecting } = useAccount();
  const { chain } = useNetwork();

  const isOnShapeNetwork = chain?.id === shapeTestnetConfig.id;
  const isOnTestnet = chain?.id === shapeTestnetConfig.id;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return {
    address,
    isConnected,
    isConnecting,
    chain,
    isOnShapeNetwork,
    isOnTestnet,
    formattedAddress: address ? formatAddress(address) : "",
  };
}
