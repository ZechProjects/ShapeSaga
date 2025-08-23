import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { ChevronDownIcon, WalletIcon, AlertTriangleIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useWalletConnection } from "../hooks/useWalletConnection";

export function ConnectWallet() {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected } = useAccount();
  const { formattedAddress, isOnShapeNetwork, chain } = useWalletConnection();
  const { connect, connectors, isLoading, pendingConnector } = useConnect({
    onSuccess() {
      toast.success("Wallet connected successfully!");
      setIsOpen(false);
    },
    onError(error) {
      toast.error(`Failed to connect: ${error.message}`);
    },
  });
  const { disconnect } = useDisconnect({
    onSuccess() {
      toast.success("Wallet disconnected");
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isOpen]);

  if (isConnected) {
    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            isOnShapeNetwork
              ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
              : "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
          }`}
        >
          <WalletIcon className="w-4 h-4" />
          <span className="font-medium">{formattedAddress}</span>
          {!isOnShapeNetwork && <AlertTriangleIcon className="w-4 h-4" />}
          <ChevronDownIcon className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {!isOnShapeNetwork && (
              <div className="px-4 py-2 text-xs text-yellow-600 bg-yellow-50 border-b border-gray-100">
                ⚠️ Please switch to Shape Network
              </div>
            )}
            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
              Connected to: {chain?.name || "Unknown Network"}
            </div>
            <button
              onClick={() => {
                disconnect();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="btn-primary flex items-center space-x-2"
        disabled={isLoading}
      >
        <WalletIcon className="w-4 h-4" />
        <span>{isLoading ? "Connecting..." : "Connect Wallet"}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
            Choose a wallet to connect
          </div>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={(e) => {
                e.stopPropagation();
                connect({ connector });
              }}
              disabled={!connector.ready || isLoading}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                {connector.name === "WalletConnect" && (
                  <svg className="w-4 h-4" viewBox="0 0 300 185" fill="none">
                    <path
                      d="M61.4385 36.2562C109.464 -9.42 185.536 -9.42 233.562 36.2562L268.898 69.5156C271.229 71.7265 271.229 75.4163 268.898 77.6272L244.616 100.727C243.451 101.833 241.614 101.833 240.449 100.727L211.308 73.1064C175.336 38.6244 119.664 38.6244 83.6917 73.1064L53.0956 100.727C51.9309 101.833 50.0928 101.833 48.9281 100.727L24.6459 77.6272C22.3147 75.4163 22.3147 71.7265 24.6459 69.5156L61.4385 36.2562Z"
                      fill="#3B99FC"
                    />
                    <path
                      d="M280.206 112.045L301.717 132.721C304.049 134.932 304.049 138.622 301.717 140.833L226.034 212.415C223.703 214.626 219.826 214.626 217.495 212.415L152.944 150.579C152.361 150.024 151.442 150.024 150.859 150.579L86.3084 212.415C83.9772 214.626 80.1003 214.626 77.7691 212.415L2.08649 140.833C-0.244825 138.622 -0.244825 134.932 2.08649 132.721L23.5977 112.045C25.9289 109.834 29.8058 109.834 32.137 112.045L96.6878 173.881C97.2708 174.436 98.1899 174.436 98.7729 173.881L163.324 112.045C165.655 109.834 169.532 109.834 171.863 112.045L236.414 173.881C236.997 174.436 237.916 174.436 238.499 173.881L303.05 112.045C305.381 109.834 309.258 109.834 311.589 112.045Z"
                      fill="#3B99FC"
                    />
                  </svg>
                )}
                {connector.name === "MetaMask" && (
                  <svg className="w-4 h-4" viewBox="0 0 212 189" fill="none">
                    <path
                      d="M198.5 1L119.5 58.5L137.5 24.5L198.5 1Z"
                      fill="#E17726"
                      stroke="#E17726"
                      strokeWidth="0.25"
                    />
                    <path
                      d="M12.5 1L91 59L74 24.5L12.5 1Z"
                      fill="#E27625"
                      stroke="#E27625"
                      strokeWidth="0.25"
                    />
                  </svg>
                )}
                {connector.name === "Injected" && (
                  <WalletIcon className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{connector.name}</div>
                {!connector.ready && (
                  <div className="text-xs text-gray-400">Not installed</div>
                )}
                {isLoading && connector.id === pendingConnector?.id && (
                  <div className="text-xs text-blue-500">Connecting...</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
