import { create } from "@web3-storage/w3up-client";
import { EmailAddress } from "@web3-storage/w3up-client/types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const storachaClient = async (email: EmailAddress) => {
  try {
    const client = await create();
    const account = await client.login(`${email}`);

    const space = await client.createSpace("my-awesome-space", { account });
    return space
  } catch (error) {
    console.error("Storage client error:", error);
    toast.error(`Error: ${error instanceof Error ? error.message : "Something went wrong"}`);
  }
};
