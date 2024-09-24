import {
    Address, ADNLAddress,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Dictionary,
    Sender,
    SendMode
} from '@ton/core';
import {DnsData, loadAllEntries, StorageBagId} from "./dns-resolver.ts";

export type SubdomainManagerConfig = {
    owner: Address;
    domains?: Cell;
    seed?: bigint;
};
const code = Cell.fromBoc(Buffer.from('b5ee9c7241020f010001e0000114ff00f4a413f4bcf2c80b01020162020c0202cd0309020120040601e543331d074d721fa4030f003f8415210c705f2e1f521c700945bf2c082e001d31f21821012345678ba9f5b82306465706c6f7965648040f002e0218210537a3491bae302018210537a3492ba8e20d430d020d749d703f8428307f45b30f862f004822864656c657465648038f002e05bf2c08280500dc31d401d020d749d703f84252108307f40f6fa13071fe203002d3ff72fe2030d30001c0019c73fe2030d43040138307f4179730588307f45b30e2206e8e1730f8428307f45b30f862822864656c657465648038f0028e14f842128307f417f862821873617665648028f002e2f0040201200708004920823938701c3ec09c20063232c1540133c588fe8084f2da80a98804b3c072604020bec020001b3b51343e90007e187d010c3e18a00201480a0b00193e10b23e1073c5bd00327b5520001d0824f4c1c0643a0835d244b5c8c0600201200d0e000dbe79b7801fc21400d9bf18610eba490549c016000797023116b8583e0004a813c6b90816f017802eba4f80180906ba4eb81fc214183fa07b7d09810e1004711c1780cf81220f72c47ed937712592b46e81ae1e4903708d5cbcdf3172aaac50e8bff99ef2819d090e000491880f0014183fa07b7d0984bf3af5a6', 'hex'))[0];

export function subdomainManagerConfigToCell(config: SubdomainManagerConfig): Cell {
    return beginCell()
        .storeAddress(config.owner)
        .storeMaybeRef(config.domains)
        .storeUint(config.seed || Math.floor(Math.random() * 1e9), 64)
        .endCell();
}

function convertDomainToBytes(domain: string): Buffer {
    const parts = domain.split('.').reverse();
    const nullTerminatedParts = parts.map((part) => part + '\0');
    const nullTerminatedString = nullTerminatedParts.join('');
    const encoder = new TextEncoder();
    const bytes = encoder.encode(nullTerminatedString);
    return Buffer.from(bytes);
}

function keyToString(key: bigint) {
    const c = beginCell()
        .storeUint(key, 256);
    const slice = c.endCell().beginParse();
    const ans = slice.loadStringTail();

    return ans.split('').filter(e => e != '\0').join('');
}

export class SubdomainManager implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {
    }

    static createFromAddress(address: Address) {
        return new SubdomainManager(address);
    }

    static createFromConfig(config: SubdomainManagerConfig, workchain = 0) {
        const data = subdomainManagerConfigToCell(config);
        const init = {code, data};
        return new SubdomainManager(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x12345678, 32).endCell(),
        });
    }

    async getResolve(provider: ContractProvider, subdomain: string, category: bigint): Promise<[number, Cell]> {
        const bytes = convertDomainToBytes(subdomain);
        const result = (
            await provider.get('dnsresolve', [
                {type: 'slice', cell: beginCell().storeBuffer(bytes).endCell()},
                {type: 'int', value: category},
            ])
        ).stack;
        return [result.readNumber(), result.readCell()];
    }

    async getWallet(provider: ContractProvider, subdomain: string): Promise<Address> {
        const [_, value] = await this.getResolve(
            provider,
            subdomain,
            BigInt('0xe8d44050873dba865aa7c170ab4cce64d90839a34dcfd6cf71d14e0205443b1b')
        );
        return value.beginParse().skip(16).loadAddress();
    }
    async sendDelete(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        domain: string
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x537a3492, 32)
                .storeRef(beginCell().storeStringTail(domain).storeUint(0, 8).endCell())
                .endCell(),
        });
    }
    async getAll(provider: ContractProvider): Promise<Map<string, Partial<DnsData>>> {
        const data = await provider.get('all', []);
        const ans = data.stack.readCellOpt();
        if (!ans) return new Map();
        const dict = ans.beginParse().loadDictDirect(
            Dictionary.Keys.BigUint(256),
            Dictionary.Values.Cell()
        )
        const result = new Map<string, Partial<DnsData>>();
        for (const key of dict.keys()) {
            const string = keyToString(key);
            const value = loadAllEntries(dict.get(key)!);
            result.set(string, value ?? {});
        }
        return result;
    }

    async sendUpdate(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        domain: string,
        recordKey: bigint,
        recordValue?: Cell
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x537a3491, 32)
                .storeRef(beginCell().storeStringTail(domain).storeUint(0, 8).endCell())
                .storeUint(recordKey, 256)
                .storeMaybeRef(recordValue)
                .endCell(),
        });
    }

    async sendSetNextResolver(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        domain: string,
        resolver: Address | null
    ) {
        await this.sendUpdate(
            provider,
            via,
            value,
            domain,
            0x19f02441ee588fdb26ee24b2568dd035c3c9206e11ab979be62e55558a1d17ffn,
            resolver ? beginCell().storeUint(0xba93, 16).storeAddress(resolver).endCell() : undefined
        );
    }

    async sendSetWallet(provider: ContractProvider, via: Sender, value: bigint, domain: string, wallet: Address | null) {
        await this.sendUpdate(
            provider,
            via,
            value,
            domain,
            0xe8d44050873dba865aa7c170ab4cce64d90839a34dcfd6cf71d14e0205443b1bn,
            wallet   ? beginCell().storeUint(0x9fd3, 16).storeAddress(wallet).storeUint(0, 8).endCell() : undefined
        );
    }

    async sendSetSite(provider: ContractProvider, via: Sender, value: bigint, domain: string, adnlAddress: StorageBagId | ADNLAddress | null) {
        if (adnlAddress instanceof StorageBagId) {
            throw new Error('StorageBagId is not supported');
        }
        await this.sendUpdate(
            provider,
            via,
            value,
            domain,
            0xfbae041b02c41ed0fd8a4efb039bc780dd6af4a1f0c420f42561ae705dda43fen,
            adnlAddress !== null ? beginCell().storeUint(0xad01, 16).storeBuffer(adnlAddress.address).storeUint(0, 8).endCell() : undefined
        );
    }

    async sendSetStorage(provider: ContractProvider, via: Sender, value: bigint, domain: string, bagId: StorageBagId|null) {
        await this.sendUpdate(
            provider,
            via,
            value,
            domain,
            0x49a25f9feefaffecad0fcd30c50dc9331cff8b55ece53def6285c09e17e6f5d7n,
            bagId !== null ? beginCell().storeUint(0x7473, 16).storeUint(bagId.address, 256).storeUint(0, 8).endCell() : undefined
        );
    }


}



