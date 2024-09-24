import {SenderArguments, storeStateInit, TonClient} from "@ton/ton";
import {useMemo} from "react";
import {beginCell, Sender} from "@ton/core";
import {useTonConnectUI} from "@tonconnect/ui-react";


export function useTestnet() {
    const isTestnet = useMemo(() => (location.host.startsWith('testnet.') ||
       // location.host.startsWith('localhost')
        false
    ), []);
    return isTestnet;
}

export default function useTonClient(): TonClient {
    const isTestnet = useTestnet();
    const client = new TonClient(
        {
            endpoint:
                isTestnet ? 'https://testnet.toncenter.com/api/v2/jsonRPC' :
                    'https://toncenter.com/api/v2/jsonRPC',

        },
    );
    return client;
}
let messageToSend: {
    /**
     * Receiver's address.
     */
    address: string;
    /**
     * Amount to send in nanoTon.
     */
    amount: string;
    /**
     * Contract specific data to add to the transaction.
     */
    stateInit?: string;
    /**
     * Contract specific data to add to the transaction.
     */
    payload?: string;
}[] = [];

export function useSender(): Sender {
    const [client] = useTonConnectUI();

    return useMemo(() => ({
        async send(args: SenderArguments): Promise<void> {
            messageToSend.push({
                amount: args.value.toString(),
                payload: args.body?.toBoc().toString('base64'),
                stateInit: args.init ? beginCell().storeWritable(storeStateInit(args.init)).endCell().toBoc().toString('base64') : '',
                address: args.to.toString()
            });
            await new Promise(r => setTimeout(r, 1500));
            if (messageToSend.length) {
                const messages = messageToSend;
                messageToSend = [];
                await client.sendTransaction({
                    messages  ,
                    validUntil: Math.floor((Date.now() + 5 * 60 * 1000) / 1000)
                });
            }

        }
    }), [client]);
}