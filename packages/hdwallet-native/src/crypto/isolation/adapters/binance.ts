import { Transaction, BncClient, crypto } from "bnb-javascript-sdk-nobroadcast";
import { Digest, BIP32 } from ".."

type SigningDelegate = Parameters<BncClient["setSigningDelegate"]>[0];

export function signingDelegate(keyPair: BIP32.NodeInterface): SigningDelegate {
    return async (tx: Transaction, signMsg?: any): Promise<Transaction> => {
        const signBytes = tx.getSignBytes(signMsg);
        const signHash = Digest.Algorithms["sha256"](signBytes);
        const pubKey = crypto.getPublicKey(Buffer.from(keyPair.publicKey).toString("hex"));
        tx.addSignature(pubKey, Buffer.from(keyPair.ecdsaSign(signHash)));
        return tx;
    };
}

export default signingDelegate;