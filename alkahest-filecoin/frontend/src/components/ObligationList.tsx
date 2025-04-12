import { useEffect, useState } from "react";
import { useContracts } from "../hooks/useContracts";
import { ethers } from "ethers";

interface Obligation {
  cid: string;
  status: number; // 0=Active, 1=Fulfilled, 2=Broken
}

export function ObligationList() {
  const { manager } = useContracts();
  const [obligations, setObligations] = useState<Obligation[]>([]);

  useEffect(() => {
    if (manager) {
      // Mock: Replace with real event listener
      manager.queryFilter("ObligationCreated").then((events) => {
        // Cast events to EventLog, since we know they are event logs
        const obligationEvents = events as ethers.EventLog[];
  
        setObligations(obligationEvents.map((e) => ({
          cid: e.args?.cid, // Use optional chaining in case `args` is undefined
          status: 0
        })));
      });
    }
  }, [manager]);

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">CID</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {obligations.map((o) => (
            <tr key={o.cid}>
              <td className="px-4 py-2 text-sm text-gray-800">{o.cid}</td>
              <td className="px-4 py-2 text-sm text-gray-800">
                {["Active", "Fulfilled", "Broken"][o.status]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
