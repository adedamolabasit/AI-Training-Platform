import { ConnectWallet } from "./components/ConnectWallets";
import { CreateObligation } from "./components/CreateObligation";
import { ObligationList } from "./components/ObligationList";



export default function App() {
  return (
    <div className="py-10 max-w-3xl mx-auto px-4">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold text-center">
          Alkahest Filecoin Obligations
        </h1>
        <ConnectWallet />
        <CreateObligation />
        <ObligationList />
      </div>
    </div>
  );
}
