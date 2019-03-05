import { SDK } from "codechain-sdk";
import { Pay } from "codechain-sdk/lib/core/classes";
import { chooseAccount } from "./util";

export async function airdropCCCTransaction(
    sdk: SDK,
    payer: string,
    excludedAccountList: string[],
    quantity: number
): Promise<Pay> {
    const recipient = await chooseAccount(payer, excludedAccountList);

    console.log(`${recipient} has won the lottery!`);

    return sdk.core.createPayTransaction({
        recipient,
        quantity
    });
}
