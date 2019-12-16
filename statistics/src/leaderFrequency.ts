import { sdk, networkId, SERVER } from "./config";
import { PlatformAddress } from "codechain-sdk/lib/core/classes";
import { AuthorRecorder } from "./authorRecorder";
import {
    getValidators,
    getTermMetadata,
    getPossibleAuthors
} from "codechain-stakeholder-sdk";

const getAuthorOfBlockNum = async (
    blockNumber: number
): Promise<PlatformAddress> => {
    const block = await sdk.rpc.chain.getBlock(blockNumber);
    if (block === null) {
        throw Error(
            `The block for the corresponding block numer ${blockNumber} does not exist`
        );
    }
    return block.author;
};

// This function is dependent on the network enviroment
// FIXME: parametrize some factors
const findFullDynamic = async (until: number): Promise<number> => {
    for (let i = 1; i <= until; i++) {
        const termMetaData = await getTermMetadata(sdk, i);
        const possibleAuthors = await getPossibleAuthors(sdk, i);

        if (termMetaData && possibleAuthors) {
            const { currentTermId, ..._rest } = termMetaData;
            const validatorCount = possibleAuthors.length;

            if (validatorCount === 6 && currentTermId !== 0) {
                console.log(`Full dynamic region starts from ${i}`);
                return i;
            }
        }
    }
    throw Error("Full dynamic region starting number was not found");
};

async function main() {
    const recorder = new AuthorRecorder();
    const recordUntil = await sdk.rpc.chain.getBestBlockNumber();
    const recordFrom = await findFullDynamic(recordUntil);
    for (let i = recordFrom; i <= recordUntil; i++) {
        const author = await getAuthorOfBlockNum(i);
        recorder.recordAuthor(author.toString());
    }

    const validators = await getValidators(sdk);
    for (const { delegation, pubkey, ..._rest } of validators) {
        const validator = PlatformAddress.fromPublic(pubkey, {
            networkId: networkId(SERVER)
        }).toString();
        recorder.recordDelegation(validator, delegation.value.toNumber());
    }

    {
        const range = recordUntil - recordFrom + 1;
        const recorderCount = recorder.totalCount();
        if (range !== recorderCount) {
            console.log(
                `Expected counting range is same as recorder's total count but found ${{
                    range: range,
                    recorderCount: recorderCount
                }}`
            );
        }
    }
    console.log(JSON.stringify(recorder));
}

main().catch(err => console.log(err));
