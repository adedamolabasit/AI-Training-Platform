import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ObligationManager from "../contractFile/ObligationManager.json";
import Arbiter from "../contractFile/Arbiter.json";

const OBLIGATION_MANAGER_ADDRESS = "0xa53eec2fc82ffC91C8417f015B65f3800E9C5b07"; // Replace with deployed address
const ARBITER_ADDRESS = "0x4CE7FCE932F4F1E7CAE42F6351D83639B5dff23A"; // Replace with deployed address

export function useContracts() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [manager, setManager] = useState<ethers.Contract | null>(null);
  const [arbiter, setArbiter] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);

      newProvider.getSigner().then((newSigner) => {
        setSigner(newSigner);
        setManager(new ethers.Contract(OBLIGATION_MANAGER_ADDRESS, ObligationManager.abi, newSigner));
        setArbiter(new ethers.Contract(ARBITER_ADDRESS, Arbiter.abi, newSigner));
      });
    }
  }, []);

  return { provider, signer, manager, arbiter };
}