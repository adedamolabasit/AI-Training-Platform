import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Command } from "commander";

dotenv.config();

type StatusMapping = {
  [key: number]: string;
};

// Contract ABIs
const OBLIGATION_MANAGER_ABI = [
  "function createObligation(string,address,uint256,uint256,uint256)",
  "function obligations(string) view returns (string, address, uint256, uint256, uint256, uint256, uint8)",
  "function updateStatus(string, uint8)",
  "event ObligationCreated(string cid, address provider, uint256 duration, uint256 redundancy, uint256 retrievalSpeed)",
  "event ObligationUpdated(string cid, uint8 status)",
  {
    inputs: [{ internalType: "string", name: "", type: "string" }],
    name: "obligations",
    outputs: [
      { internalType: "string", name: "cid", type: "string" },
      { internalType: "address", name: "provider", type: "address" },
      { internalType: "uint256", name: "startTime", type: "uint256" },
      { internalType: "uint256", name: "duration", type: "uint256" },
      { internalType: "uint256", name: "redundancy", type: "uint256" },
      { internalType: "uint256", name: "retrievalSpeed", type: "uint256" },
      {
        internalType: "enum ObligationManager.Status",
        name: "status",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const ARBITER_ABI = [
  "function verifyFilecoinProof(string, bool, bool)",
  "function updateManager(address)",
  "function obligationManager() view returns (address)",
];

// Contract addresses (replace with your actual deployed addresses)
const DEFAULT_MANAGER_ADDRESS = "0x4CE7FCE932F4F1E7CAE42F6351D83639B5dff23A";
const DEFAULT_ARBITER_ADDRESS = "0xa53eec2fc82ffC91C8417f015B65f3800E9C5b07"; // Add your arbiter address here

// Status enum mapping
const STATUS: StatusMapping = {
  0: "Active",
  1: "Fulfilled",
  2: "Broken",
  3: "Expired",
} as const; // 'as const' makes the object readonly

async function main() {
  const program = new Command();

  // Initialize provider and wallet
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_URL || "https://api.calibration.node.glif.io/rpc/v1"
  );
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  program
    .name("fil-obligation-sdk")
    .description("CLI for interacting with Filecoin Obligation contracts")
    .version("0.1.0");

  // Obligation Manager commands
  const manager = program.command("manager");
  manager
    .command("create <cid> <duration> <redundancy> <retrievalSpeed>")
    .description("Create a new obligation")
    .action(async (cid, duration, redundancy, retrievalSpeed) => {
      const manager = new ethers.Contract(
        DEFAULT_MANAGER_ADDRESS,
        OBLIGATION_MANAGER_ABI,
        wallet
      );

      const tx = await manager.createObligation(
        cid,
        wallet.address,
        duration,
        redundancy,
        retrievalSpeed
      );

      console.log(`Obligation created! TX Hash: ${tx.hash}`);
      await tx.wait();
      console.log("Transaction confirmed");
    });

  manager
    .command("get <cid>")
    .description("Get obligation details")
    .action(async (cid) => {
      try {
        const manager = new ethers.Contract(
          DEFAULT_MANAGER_ADDRESS,
          OBLIGATION_MANAGER_ABI,
          provider
        );

        // Check if obligation exists
        const obligation = await manager.obligations(cid);

        if (!obligation || obligation.startTime.toString() === "0") {
          console.log(`No obligation found for CID: ${cid}`);
          return;
        }

        console.log("Obligation Details:");
        console.log(`CID: ${obligation.cid}`);
        console.log(`Provider: ${obligation.provider}`);
        console.log(
          `Start Time: ${new Date(Number(obligation.startTime) * 1000)}`
        );
        console.log(`Duration: ${obligation.duration} seconds`);
        console.log(`Redundancy: ${obligation.redundancy}`);
        console.log(`Retrieval Speed: ${obligation.retrievalSpeed} ms`);
        console.log(
          `Status: ${STATUS[Number(obligation.status)] || "Unknown"}`
        );
      } catch (error) {
        console.error("Error fetching obligation:");
        if (error instanceof Error) {
          console.error(error.message);
        }
        console.log(
          `Make sure the CID exists and the contract address is correct (${DEFAULT_MANAGER_ADDRESS})`
        );
      }
    });

  // Arbiter commands
  const arbiter = program.command("arbiter");
  arbiter
    .command("verify <cid> <proofValid> <timelyRetrieved>")
    .description("Verify a Filecoin proof and update obligation status")
    .action(async (cid, proofValid, timelyRetrieved) => {
      const arbiter = new ethers.Contract(
        DEFAULT_ARBITER_ADDRESS,
        ARBITER_ABI,
        wallet
      );

      const tx = await arbiter.verifyFilecoinProof(
        cid,
        proofValid === "true",
        timelyRetrieved === "true"
      );

      console.log(`Verification submitted! TX Hash: ${tx.hash}`);
      await tx.wait();
      console.log("Transaction confirmed");
    });

  arbiter
    .command("update-manager <newManager>")
    .description("Update the obligation manager address")
    .action(async (newManager) => {
      const arbiter = new ethers.Contract(
        DEFAULT_ARBITER_ADDRESS,
        ARBITER_ABI,
        wallet
      );

      const tx = await arbiter.updateManager(newManager);
      console.log(`Manager address update submitted! TX Hash: ${tx.hash}`);
      await tx.wait();
      console.log("Transaction confirmed");
    });

  arbiter
    .command("get-manager")
    .description("Get current obligation manager address")
    .action(async () => {
      const arbiter = new ethers.Contract(
        DEFAULT_ARBITER_ADDRESS,
        ARBITER_ABI,
        provider
      );

      const managerAddress = await arbiter.obligationManager();
      console.log(`Current obligation manager: ${managerAddress}`);
    });

  // Event listeners
  const events = program.command("events");
  events
    .command("listen-created")
    .description("Listen for new obligation creation events")
    .action(async () => {
      const manager = new ethers.Contract(
        DEFAULT_MANAGER_ADDRESS,
        OBLIGATION_MANAGER_ABI,
        provider
      );

      console.log("Listening for ObligationCreated events...");
      manager.on(
        "ObligationCreated",
        (cid, provider, duration, redundancy, retrievalSpeed, event) => {
          console.log("\nNew Obligation Created:");
          console.log(`CID: ${cid}`);
          console.log(`Provider: ${provider}`);
          console.log(`Duration: ${duration} seconds`);
          console.log(`Redundancy: ${redundancy}`);
          console.log(`Retrieval Speed: ${retrievalSpeed} ms`);
          console.log(`TX Hash: ${event.transactionHash}`);
        }
      );
    });

  events
    .command("listen-updated")
    .description("Listen for obligation status update events")
    .action(async () => {
      const manager = new ethers.Contract(
        DEFAULT_MANAGER_ADDRESS,
        OBLIGATION_MANAGER_ABI,
        provider
      );

      console.log("Listening for ObligationUpdated events...");
      manager.on("ObligationUpdated", (cid, status, event) => {
        console.log("\nObligation Status Updated:");
        console.log(`CID: ${cid}`);
        console.log(`New Status: ${STATUS[status]}`);
        console.log(`TX Hash: ${event.transactionHash}`);
      });
    });

  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
