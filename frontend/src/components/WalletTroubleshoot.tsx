import { useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
} from "lucide-react";
import { CONTRACT_ADDRESSES } from "../lib/contracts";

export function WalletTroubleshoot() {
  const [isOpen, setIsOpen] = useState(false);
  const { address, isConnected, connector } = useAccount();
  const { chain } = useNetwork();

  const checks = [
    {
      name: "Wallet Connected",
      status: isConnected ? "success" : "error",
      message: isConnected
        ? "Wallet is connected"
        : "Please connect your wallet",
    },
    {
      name: "Network",
      status: chain?.id === 11011 ? "success" : "warning",
      message:
        chain?.id === 11011
          ? "Connected to Shape Testnet"
          : `Connected to ${
              chain?.name || "Unknown"
            } (Please switch to Shape Testnet)`,
    },
    {
      name: "Contract Addresses",
      status: CONTRACT_ADDRESSES.STORY_REGISTRY ? "success" : "error",
      message: CONTRACT_ADDRESSES.STORY_REGISTRY
        ? "Contract addresses configured"
        : "Contract addresses not configured",
    },
    {
      name: "IPFS Configuration",
      status: import.meta.env.VITE_PINATA_JWT ? "success" : "error",
      message: import.meta.env.VITE_PINATA_JWT
        ? "IPFS/Pinata JWT configured"
        : "IPFS/Pinata JWT not configured",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const troubleshootSteps = [
    "1. Make sure you have a compatible wallet installed (MetaMask, Coinbase Wallet, etc.)",
    "2. Connect your wallet using the 'Connect Wallet' button",
    "3. Switch to Shape Testnet in your wallet settings",
    "4. Make sure you have some ETH on Shape Testnet for gas fees",
    "5. If the wallet popup is stuck, try refreshing the page and reconnecting",
    "6. For Coinbase Wallet users: Make sure you're using the latest version",
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Wallet Troubleshoot"
      >
        <AlertTriangleIcon className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Wallet Troubleshoot
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Status Checks */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-800">System Status</h3>
            {checks.map((check, index) => (
              <div key={index} className="flex items-center space-x-3">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="font-medium text-sm">{check.name}</div>
                  <div className="text-xs text-gray-600">{check.message}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Connection Details */}
          {isConnected && (
            <div className="bg-gray-50 p-3 rounded-md mb-6">
              <h4 className="font-medium text-sm mb-2">Connection Details</h4>
              <div className="text-xs space-y-1">
                <div>
                  <strong>Address:</strong> {address}
                </div>
                <div>
                  <strong>Connector:</strong> {connector?.name}
                </div>
                <div>
                  <strong>Chain ID:</strong> {chain?.id}
                </div>
                <div>
                  <strong>Chain Name:</strong> {chain?.name}
                </div>
              </div>
            </div>
          )}

          {/* Troubleshoot Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">
              Troubleshooting Steps
            </h3>
            <ol className="text-sm space-y-2">
              {troubleshootSteps.map((step, index) => (
                <li key={index} className="text-gray-700">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Refresh Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCwIcon className="w-4 h-4" />
              <span>Refresh Page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
