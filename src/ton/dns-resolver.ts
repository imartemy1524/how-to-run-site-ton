import {Address, ADNLAddress, beginCell, BitString, Cell, Dictionary, Sender, Slice, toNano} from "@ton/core"
import {TonClient} from "@ton/ton";
import {sha256_sync} from '@ton/crypto';
import useTonClient, {useTestnet} from "./tonclient.ts";
import {useMemo} from "react";

export class StorageBagId {
    constructor(public address: bigint) {
    }

    toString() {
        return this.address.toString(16)
    }
}

export enum Category {
    DNS_CATEGORY_WALLET = 'wallet',
    DNS_CATEGORY_STORAGE = 'storage',
    DNS_CATEGORY_SITE = 'site',
    DNS_CATEGORY_NEXT_RESOLVER = 'dns_next_resolver',
}

export class DnsResolver {
    constructor(
        private readonly provider: TonClient,
        private readonly rootContract: Promise<Address>,
    ) {
    }

    public async getWalletAddress(domain: string, resolveOwner: boolean = false): Promise<Address | null> {
        return this.resolve(domain, Category.DNS_CATEGORY_WALLET, await this.rootContract, resolveOwner);
    }

    public async getStorageBagId(domain: string): Promise<StorageBagId | null> {
        return this.resolve(domain, Category.DNS_CATEGORY_STORAGE, await this.rootContract);
    }

    public async getSiteAddress(domain: string): Promise<ADNLAddress | StorageBagId | null> {
        return this.resolve(domain, Category.DNS_CATEGORY_SITE, await this.rootContract);
    }


    private resolve(
        domain: string,
        category: Category.DNS_CATEGORY_WALLET,
        rootContract: Address,
        resolveOwner?: boolean
    ): Promise<Address | null>;
    private resolve(
        domain: string,
        category: Category.DNS_CATEGORY_STORAGE,
        rootContract: Address,
    ): Promise<StorageBagId | null>;
    private resolve(
        domain: string,
        category: Category.DNS_CATEGORY_SITE,
        rootContract: Address,
    ): Promise<ADNLAddress | StorageBagId | null>;
    private resolve(domain: string, category: Category | null, rootContract: Address, resolveOwner: boolean = false) {
        return dnsResolveImpl(this.provider, rootContract, domainToBytes(domain), category, resolveOwner);
    }

    getAll(wallet: Address) {
        return dnsResolveImpl(this.provider, wallet, new Uint8Array(1).fill(0), null, false);
    }

    async getDomain(address: Address) {
        const ans = await this.provider.runMethod(address, 'get_domain', []);
        return ans.stack.readString();
    }

    async getLastFillUp(address: Address) {
        const ans = await this.provider.runMethod(address, 'get_last_fill_up_time', []);
        return ans.stack.readNumber();
    }

    /**
     * Set subdomains smart contract of whom NFT to where
     * @param sender
     * @param whom
     * @param where
     */
    async setSubdomains(sender: Sender, whom: Address, where: Address) {
        const payload = createNextResolverRecord(where);
        const body = createBodyUpdateRecord({
            queryId: 0,
            category: Category.DNS_CATEGORY_NEXT_RESOLVER,
            value: payload
        });
        await sender.send({
            to: whom,
            value: toNano('0.015'),
            body
        })

    }

    async set(sender: Sender, where: Address, category: Category, value: ADNLAddress | StorageBagId | Address | null) {
        let payload: Cell | null = null;
        if (value) switch (category) {
            case Category.DNS_CATEGORY_NEXT_RESOLVER:
                payload = createNextResolverRecord(value as Address);
                break;
            case Category.DNS_CATEGORY_SITE:
                payload = createSetSiteRecord(value as ADNLAddress);
                break;
            case Category.DNS_CATEGORY_STORAGE:
                payload = createStorageRecord(value as StorageBagId);
                break;
            case Category.DNS_CATEGORY_WALLET:
                payload = createWalletResolverRecord(value as Address);
                break;
            default:
                throw new Error('Not implemented');
        }
        const body = createBodyUpdateRecord({
            queryId: 1n,
            category,
            value: payload
        })
        await sender.send({
            to: where,
            value: toNano('0.01'),
            body
        })
    }
}

const createWalletResolverRecord = (wallet: Address) => {
    const cell = beginCell()
        .storeUint(0x9fd3, 16).storeAddress(wallet).storeUint(0, 8).endCell();
    return cell;
}
const createSetSiteRecord = (site: ADNLAddress | StorageBagId) => {
    const cell = beginCell()
        .storeUint(0xad01, 16);
    if (site instanceof ADNLAddress) {
        cell.storeBuffer(site.address);
    } else {
        throw new Error('Not implemented');
    }
    return cell.storeUint(0, 8).endCell()
}
const createStorageRecord = (storage: StorageBagId) => {
    const cell = beginCell()
        .storeUint(0x7473, 16)
        .storeUint(storage.address, 256);
    return cell.storeUint(0, 8).endCell();
}

const createNextResolverRecord = (smartContractAddress: Address) => {
    const cell = beginCell();
    cell.storeUint(0xba93, 16); // https://github.com/ton-blockchain/ton/blob/7e3df93ca2ab336716a230fceb1726d81bac0a06/crypto/block/block.tlb#L819
    cell.storeAddress(smartContractAddress);
    return cell.endCell();
}
const createBodyUpdateRecord = ({queryId, category, value}: {
    queryId?: number | bigint,
    category: Category,
    value?: Cell | null
}) => {
    const body = beginCell()
        .storeUint(0x4eb1f0f9, 32)
        .storeUint(queryId || 0, 64)
        .storeUint(toCategory(category), 256);
    if (value) {
        body.storeRef(value);
    }
    return body.endCell();
}


/**
 * Verify and convert domain
 * @param domain    {string}
 * @return {Uint8Array}
 */
const domainToBytes = (domain: string): Uint8Array => {
    if (!domain || !domain.length) {
        throw new Error('empty domain');
    }
    if (domain === '.') {
        return new Uint8Array([0]);
    }

    domain = domain.toLowerCase();

    for (let i = 0; i < domain.length; i++) {
        if (domain.charCodeAt(i) <= 32) {
            throw new Error('bytes in range 0..32 are not allowed in domain names');
        }
    }

    for (let i = 0; i < domain.length; i++) {
        const s = domain.substring(i, i + 1);
        for (let c = 127; c <= 159; c++) {
            // another control codes range
            if (s === String.fromCharCode(c)) {
                throw new Error('bytes in range 127..159 are not allowed in domain names');
            }
        }
    }

    const arr = domain.split('.');

    arr.forEach((part) => {
        if (!part.length) {
            throw new Error('domain name cannot have an empty component');
        }
    });

    let rawDomain = arr.reverse().join('\0') + '\0';
    if (rawDomain.length < 126) {
        rawDomain = '\0' + rawDomain;
    }

    return new TextEncoder().encode(rawDomain);
};
const parseNextResolverRecord = (cell: Slice) => {
    return parseSmartContractAddressImpl(cell, 0xba, 0x93);
};
/**
 * @private
 * @param cell  {Cell}
 * @param prefix0 {number}
 * @param prefix1 {number}
 * @return {Address|null}
 */
const parseSmartContractAddressImpl = (cell: Slice, prefix0: number, prefix1: number) => {
    if (cell.loadUint(8) !== prefix0 || cell.loadUint(8) !== prefix1)
        throw new Error('Invalid dns record value prefix');
    return cell.loadMaybeAddress();
};

const parseSiteRecord = (cell: Slice) => {
    if (!cell) return null;
    if (cell.preloadUint(8) === 0xad || cell.preloadUintBig(2) / 0x100n === 0x01n) {
        return parseAdnlAddressRecord(cell);
    } else {
        return parseStorageBagIdRecord(cell);
    }
};
const parseAdnlAddressRecord = (cell: Slice) => {
    if (cell.loadUint(8) !== 0xad || cell.loadUint(8) !== 0x01) throw new Error('Invalid dns record value prefix');
    return new ADNLAddress(cell.loadBuffer(32));
};
const parseStorageBagIdRecord = (cell: Slice) => {
    if (cell.loadUint(8) !== 0x74 || cell.loadUint(8) !== 0x73) throw new Error('Invalid dns record value prefix');
    const bytes = cell.loadUintBig(32 * 8); // skip prefix - first 16 bits
    return new StorageBagId(bytes);
};

function toCategory(s: Category | null): bigint {
    return s ? BigInt('0x' + sha256_sync(s).toString('hex')) : 0n;
}

const parseSmartContractAddressRecord = (cell: Slice) => {
    return parseSmartContractAddressImpl(cell, 0x9f, 0xd3);
};

export interface DnsData {
    wallet: Address | null;
    storage: StorageBagId | null;
    site: ADNLAddress | StorageBagId | null;
    dns_next_resolver: Address | null;
}

export function loadAllEntries(cell: Cell | null) {
    const dictionary = cell?.beginParse()?.loadDictDirect(Dictionary.Keys.BigUint(256), Dictionary.Values.Cell());
    if (!dictionary) return null;
    const ans: Partial<DnsData> = {};
    if (dictionary.has(toCategory(Category.DNS_CATEGORY_WALLET))) {
        ans.wallet = parseSmartContractAddressRecord(dictionary.get(toCategory(Category.DNS_CATEGORY_WALLET))!.beginParse());
    }
    if (dictionary.has(toCategory(Category.DNS_CATEGORY_STORAGE))) {
        ans.storage = parseStorageBagIdRecord(dictionary.get(toCategory(Category.DNS_CATEGORY_STORAGE))!.beginParse());
    }
    if (dictionary.has(toCategory(Category.DNS_CATEGORY_SITE))) {
        const cell = dictionary.get(toCategory(Category.DNS_CATEGORY_SITE))!.beginParse();
        if (cell.preloadUint(8) === 0xad || cell.preloadUintBig(2) / 0x100n === 0x01n) {
            ans.site = parseAdnlAddressRecord(cell);
        } else {
            ans.site = parseStorageBagIdRecord(cell);
        }
    }
        if (dictionary.has(toCategory(Category.DNS_CATEGORY_NEXT_RESOLVER))) {
        ans.dns_next_resolver = parseNextResolverRecord(dictionary.get(toCategory(Category.DNS_CATEGORY_NEXT_RESOLVER))!.beginParse());
    }
    console.log('ans', ans);
    return ans;
}

const dnsResolveImpl = async (
    provider: TonClient,
    dnsAddress: Address,
    rawDomainBytes: Uint8Array,
    category: Category | null,
    resolveOwner: boolean,
): Promise<Cell | Address | null | ADNLAddress | StorageBagId | Partial<DnsData>> => {
    await new Promise(r => setTimeout(r, 1300));
    const len = rawDomainBytes.length * 8;

    const domainCell = beginCell();
    domainCell.storeBits(
        new BitString(Buffer.from(rawDomainBytes), 0, rawDomainBytes.byteLength * rawDomainBytes.BYTES_PER_ELEMENT * 8),
    );
    const resultRaw = await provider.runMethod(dnsAddress, 'dnsresolve', [
        {type: 'slice', cell: domainCell.endCell()},
        {type: 'int', value: toCategory(category)},
    ]);
    const resultTuple = resultRaw.stack;
    const [resultLen, cell] = [resultTuple.readBigNumber(), resultTuple.readCellOpt()];
    // if (result[0].type !== 'int') {
    //     throw new Error('Invalid dnsresolve response');
    // }
    if (resultLen % 8n !== 0n) {
        throw new Error('domain split not at a component boundary');
    }
    if (resultLen > len) {
        throw new Error('invalid response ' + resultLen + '/' + len);
    } else if (Number(resultLen) === len) {
        if (category === Category.DNS_CATEGORY_NEXT_RESOLVER) {
            return cell ? parseNextResolverRecord(cell.beginParse()) : null;
        } else if (category === Category.DNS_CATEGORY_WALLET) {
            const ans = cell ? parseSmartContractAddressRecord(cell.beginParse()) : null;
            console.log('ans', ans);
            console.log('resolveOwner', resolveOwner);
            if (resolveOwner) return dnsAddress;
            return ans;
        } else if (category === Category.DNS_CATEGORY_SITE) {
            return cell ? parseSiteRecord(cell.beginParse()) : null;
        } else if (category === Category.DNS_CATEGORY_STORAGE) {
            return cell ? parseStorageBagIdRecord(cell.beginParse()) : null;
        } else if (category === null) {
            return loadAllEntries(cell);
        } else {
            throw new Error('invalid category');
        }
    } else {
        if (!cell) return null;
        const nextAddress = parseNextResolverRecord(cell.beginParse());
        if (!nextAddress) return null;

        return await dnsResolveImpl(
            provider,
            nextAddress,
            rawDomainBytes.slice(Number(resultLen) / 8),
            category,
            resolveOwner,
        );

    }
};


export function useDnsResolver() {
    const client = useTonClient();
    if (!client) {
        throw new Error('TonClient is not available');
    }
    const isTestNet = useTestnet();
    const rootDomainPromist: Promise<Address> = useMemo(() => {
        // if (isTestNet) {
        //     .ton domains resolver
        // return Promise.resolve(Address.parse('kQDjPtM6QusgMgWfl9kMcG-EALslbTITnKcH8VZK1pnH3f3K'));
        // }
        return fetch(`https://${isTestNet ? 'testnet.' : ''}tonapi.io/v2/blockchain/config`)
            .then(e => e.json())
            .then(e => Address.parse(e[4]))
    }, [isTestNet]);
    return new DnsResolver(client, rootDomainPromist);
}