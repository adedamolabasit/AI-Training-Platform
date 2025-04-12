import { useContracts } from "../hooks/useContracts";

export function ConnectWallet() {
  const { signer } = useContracts();

  const handleConnect = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      {signer ? "Connected" : "Connect Wallet"}
    </button>
  );
}
