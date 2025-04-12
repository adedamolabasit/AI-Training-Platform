import { useState } from "react";
import { useContracts } from "../hooks/useContracts";

export function CreateObligation() {
  const [cid, setCid] = useState("");
  const [duration, setDuration] = useState("365");
  const { manager } = useContracts();

console.log(manager,"ppwe")

  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder="CID (QmXYZ...)"
        value={cid}
        onChange={(e) => setCid(e.target.value)}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="Duration (days)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={async () => {
          if (manager) {
            await manager.createObligation(cid, '0x088190EE1Bd2108B91b29d3c9a7B3127db73AEcc', duration, 3, 500); // redundancy=3, speed=500ms
          }
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Create Obligation
      </button>
    </div>
  );
}
