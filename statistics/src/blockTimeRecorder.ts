import { U64 } from "codechain-sdk/lib/core/classes";

export class BlockTimeRecorder {
    private timestamps: Map<number, number>;
    private blockGenerationTimes: Map<number, number>;
    private viewIncreaseCounter: number;

    public constructor() {
        this.timestamps = new Map();
        this.blockGenerationTimes = new Map();
        this.viewIncreaseCounter = 0;
    }

    public accumulateViewIncrease(view: U64) {
        if (view.gt(0)) {
            this.viewIncreaseCounter += 1;
        }
    }

    public getViewIncreaseCount(): number {
        return this.viewIncreaseCounter;
    }

    public recordTimestampOfBlock(blockNumber: number, timestamp: number) {
        this.timestamps.set(blockNumber, timestamp);
    }

    public calculateBlockGenerationTime() {
        for (const [blockNumber, timestamp] of this.timestamps) {
            console.log(`${blockNumber}`);
            const prev = this.timestamps.get(blockNumber - 1);
            if (prev) {
                this.blockGenerationTimes.set(blockNumber, timestamp - prev);
            }
        }
    }

    // This function is expected to be called after the calculateBlockGenerationTime is called
    public getAverageGenerationTime(start: number, end: number): number {
        const startStamp = this.timestamps.get(start)!;
        const endStamp = this.timestamps.get(end)!;

        return (endStamp - startStamp) / (end - start);
    }

    public toJSON() {
        return Array.from(this.blockGenerationTimes.entries());
    }
}
