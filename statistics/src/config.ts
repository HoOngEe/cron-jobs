import { SDK } from "codechain-sdk";

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
