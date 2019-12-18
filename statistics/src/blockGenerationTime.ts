import {
    sdk,
    findFullDynamic,
    BLOCK_VIEW_IDX,
    decodeViewField
} from "./config";
import { BlockTimeRecorder } from "./blockTimeRecorder";
import { U64 } from "codechain-sdk/lib/core/classes";

interface GenerationInfo {
    timestamp: number;
    view: U64;
}

const getGenerationInfoOfBlock = async (
    blockNumber: number
): Promise<GenerationInfo> => {
    const block = await sdk.rpc.chain.getBlock(blockNumber);
    if (block === null) {
        throw Error(
            `The block for the corresponding block number ${blockNumber} does not exist`
        );
    }
    const view = decodeViewField(block.seal[BLOCK_VIEW_IDX]);
    return {
        timestamp: block.timestamp,
        view
    };
};

const main = async () => {
    const recorder = new BlockTimeRecorder();
    const recordUntil = await sdk.rpc.chain.getBestBlockNumber();
    const recordFrom = await findFullDynamic(recordUntil);
    for (let i = recordFrom; i <= recordUntil; i++) {
        const { timestamp, view } = await getGenerationInfoOfBlock(i);
        recorder.recordTimestampOfBlock(i, timestamp);
        recorder.accumulateViewIncrease(view);
    }

    const averageTime = recorder.getAverageGenerationTime(
        recordFrom,
        recordUntil
    );
    const viewIncreaseCount = recorder.getViewIncreaseCount();
    const range = recordUntil - recordFrom + 1;
    console.log(`Average block geneartion time is ${averageTime}`);
    console.log(
        `Total view increase cases had been occured ${viewIncreaseCount} times, it occupies ${(viewIncreaseCount /
            range) *
            100}% out of total ${range} blocks`
    );
};

main().catch(err => console.log(err));
