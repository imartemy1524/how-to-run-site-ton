import {SenderArguments, storeStateInit, TonClient} from "@ton/ton";
import {useMemo} from "react";
import {Address, beginCell, Sender, toNano} from "@ton/core";
import {useTonConnectUI} from "@tonconnect/ui-react";
import {Wallet} from "../config.tsx";


export function useTestnet() {
    const isTestnet = useMemo(() => (location.host.includes('testnet.') ||
        location.host.startsWith('localhost')
        // false
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

interface IMessage {
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
}

let messageToSend: IMessage[] = [];

function getFeeMessage(): IMessage[] {
    if (localStorage.getItem('support_me') !== '0') return [{
        address: Address.parse(Wallet).toString(),
        amount: toNano('0.01').toString(),
        stateInit: '',
        payload: ''
    }];
    return [];
}

export function useSender(): Sender {
    const [client] = useTonConnectUI();

    return useMemo(() => ({
        async send(args: SenderArguments): Promise<void> {
            messageToSend.push({
                amount: args.value.toString(),
                payload: args.body?.toBoc()?.toString('base64'),
                stateInit: args.init ? beginCell().storeWritable(storeStateInit(args.init)).endCell().toBoc().toString('base64') : '',
                address: args.to.toString(args.bounce === false ? {bounceable: false} : {bounceable: true})
            });
            await new Promise(r => setTimeout(r, 1500));
            if (messageToSend.length) {
                const messages = [...messageToSend, ...getFeeMessage()];
                messageToSend = [];
                await client.sendTransaction({
                    messages,
                    validUntil: Math.floor((Date.now() + 5 * 60 * 1000) / 1000)
                });
            }

        }
    }), [client]);
}