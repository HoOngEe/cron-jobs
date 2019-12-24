import { sdk, networkId, SERVER, findFullDynamic, decodeSeedSigner } from "./config";
import { PlatformAddress } from "codechain-sdk/lib/core/classes";
import { AuthorRecorder } from "./authorRecorder";
import { getValidators } from "codechain-stakeholder-sdk/lib/index";

interface AuthorInfo {
    blockAuthor: string;
    seedAuthor: string;
}

const getAuthorOfBlockNum = async (
    blockNumber: number
): Promise<AuthorInfo> => {
    const block = await sdk.rpc.chain.getBlock(blockNumber);
    if (block === null) {
        throw Error(
            `The block for the corresponding block numer ${blockNumber} does not exist`
        );
    }
    const seedSigner = decodeSeedSigner(block.seal[4]);
    return {
        blockAuthor: block.author.toString(),
        seedAuthor: seedSigner.toString()
    }
};

async function main() {
    const recorder = new AuthorRecorder();
    const recordUntil = await sdk.rpc.chain.getBestBlockNumber();
    const recordFrom = await findFullDynamic(recordUntil);
    for (let i = recordFrom; i <= recordUntil; i++) {
        const author = await getAuthorOfBlockNum(i);
        recorder.recordAuthor(author.blockAuthor);
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
