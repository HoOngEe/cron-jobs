import { U64 } from "codechain-primitives";
import { getConfig } from "./util";

const networkId = getConfig<string>("network_id");
const prefix = `[${networkId} network]`;

export interface CodeChainAlert {
  title: string;
  content: string;
}

export class CodeChainDeath implements CodeChainAlert {
  public title: string;
  public content: string;

  constructor() {
    const suffix = `${new Date().toISOString()}`;
    this.title = `${prefix} CodeChain Death Confirmation ${suffix}`;
    this.content = "CodeChain didn't renew the best block number for 1 hour.";
  }
}

export class ViewTooHigh implements CodeChainAlert {
  public title: string;
  public content: string;

  constructor(blockNumber: number, view: U64) {
    const suffix = `${new Date().toISOString()}`;
    this.title = `${prefix} CodeChain View Too High ${suffix}`;
    this.content = `View of the block(${blockNumber}) in CodeChain is ${view.toString(
      10
    )}! An inspection is needed.`;
  }
}

export class NodeIsSleeping implements CodeChainAlert {
  public title: string;
  public content: string;

  constructor(blockNumber: number, nodeIndices: number[], streak?: number) {
    const suffix = `${new Date().toISOString()}`;
    this.title = `${prefix} CodeChain Node is Sleeping ${suffix}`;
    if (streak !== undefined) {
      this.content = `Consecutive ${streak} blocks from the block(${blockNumber -
        streak}), validating nodes ${nodeIndices} did not precommit.`;
    } else {
      this.content = `For the block(${blockNumber}), validating nodes ${nodeIndices} did not precommit.`;
    }
  }
}

export class NodeRecovered implements CodeChainAlert {
  public title: string;
  public content: string;

  constructor(blockNumber: number, nodeIndex: number, sleepStreak: number) {
    const suffix = `${new Date().toISOString()}`;
    this.title = `${prefix} CodeChain Node has recovered from the problem ${suffix}`;
    this.content = `The node ${nodeIndex} did not precommit from the block ${blockNumber -
      sleepStreak} consecutively. Now the node ${nodeIndex} has been recovered from the problem.`;
  }
}

export class AllNodesAwake implements CodeChainAlert {
  public title: string;
  public content: string;

  constructor(blockNumber: number) {
    const suffix = `${new Date().toISOString()}`;
    this.title = `${prefix} All CodeChain nodes are awake ${suffix}`;
    this.content = `Before the block(${blockNumber}) some nodes did not precommit, but now all nodes are recovered.`;
  }
}

export class GetBlockFailed implements CodeChainAlert {
  public title: string;
  public content: string;

  constructor(blockNumber: number) {
    const suffix = `${new Date().toISOString()}`;
    this.title = `${prefix} CodeChain failed to get a block ${suffix}`;
    this.content = `RPC chain_getBlockByNumber failed with the best block number ${blockNumber}`;
  }
}
