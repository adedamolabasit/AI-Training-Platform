/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IObligationManager,
  IObligationManagerInterface,
} from "../../Arbiter.sol/IObligationManager";

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "cid",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "updateStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IObligationManager__factory {
  static readonly abi = _abi;
  static createInterface(): IObligationManagerInterface {
    return new Interface(_abi) as IObligationManagerInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IObligationManager {
    return new Contract(address, _abi, runner) as unknown as IObligationManager;
  }
}
