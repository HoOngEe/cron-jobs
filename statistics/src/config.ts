import { SDK } from "codechain-sdk";
import { getTermMetadata, getPossibleAuthors } from "codechain-stakeholder-sdk";
import { U64 } from "codechain-sdk/lib/core/classes";

export const SERVER: string = (() => {
    const server = process.env.SERVER;
    if (server === undefined) {
        throw Error("server is not configured");
    } else if (["akita", "beagle", "corgi", "mainnet"].indexOf(server) >= 0) {
        return server;
    } else {
        throw Error("Invalid server configuration");
    }
})();

export const BLOCK_VIEW_IDX = 1;

export function decodeViewField(encodedView: number[]): U64 {
    const buffer = Buffer.from(encodedView);
    return U64.fromBytes(buffer);
}

export function networkId(server: string): string {
    switch (server) {
        case "akita":
            return "ac";
        case "beagle":
            return "bc";
        case "corgi":
            return "wc";
        case "mainnet":
            return "cc";
        default:
            throw Error("Invalid server configuration");
    }
}

export const sdk = (() => {
    const rpcUrl = process.env.RPC_URL;
    if (rpcUrl === undefined) {
        throw Error("rpc url is not configured");
    }
    console.log(`sdk ${SERVER} ${process.env.RPC_URL}`);
    return new SDK({
        server: rpcUrl,
        networkId: networkId(SERVER)
    });
})();

// This function is dependent on the network enviroment
// FIXME: parametrize some factors
export const findFullDynamic = async (until: number): Promise<number> => {
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
