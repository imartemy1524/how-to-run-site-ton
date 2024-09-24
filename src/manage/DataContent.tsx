import Typography from "@mui/material/Typography";
import {TextField} from "@mui/material";
import {Address, ADNLAddress, beginCell} from "@ton/core";
import Button from "@mui/material/Button";
import NextDnsResolver from "./NextDnsResolver.tsx";
import {Category, DnsData, StorageBagId} from "../ton/dns-resolver.ts";
import {useCallback, useEffect, useMemo, useState} from "react";

interface Data {
    createSubdomains?: () => unknown;
    domain: string;
    save?: (category: Category, value: ADNLAddress | StorageBagId | Address | null) => Promise<unknown>;
    showCreateBtn?: boolean;
    showSaveBtn?: boolean
}

export default function DataContent(
    {
        createSubdomains,
        domain,
        showCreateBtn = true,
        showSaveBtn = true,
        save,
        ...data
    }: Partial<DnsData> & Data) {
    const SaveNextResolver = useCallback(async (value: unknown) => save?.(Category.DNS_CATEGORY_NEXT_RESOLVER, value as Address), [save]);
    const SaveStorage = useCallback(async (value: unknown) => save?.(Category.DNS_CATEGORY_STORAGE, value ? new StorageBagId(value as bigint) : null), [save]);
    const SaveSite = useCallback(async (value: unknown) => save?.(Category.DNS_CATEGORY_SITE, value ? new ADNLAddress(
        beginCell().storeUint(value! as bigint, 256).endCell().beginParse().loadBuffer(32)
    ) : null), [save])
    const SaveWallet = useCallback(async (value: unknown) => save?.(Category.DNS_CATEGORY_WALLET, value as Address), [save]);
    return <Typography variant="body2" color="#fff" component={'div'} style={{marginLeft: "50px"}}>
        <InputWithSave id={domain + "_wallet"} defaultValue={data.wallet ?? ''} label={'Linked wallet'}
                       key={data.wallet?.toString()}
                       isAddress={true}
                       triggerOnSave={showSaveBtn}
                       onChange={SaveWallet}/>
        <br/>
        <InputWithSave id={domain + "_site"}
                       key={data.site?.toString()}
                       defaultValue={data.site instanceof ADNLAddress ? data.site.address.toString('hex') : data.site?.toString()}
                       label={'TON site'}
                       triggerOnSave={showSaveBtn}
                       onChange={SaveSite}
        />
        <br/>
        <InputWithSave id={domain + "_storage"}
                       triggerOnSave={showSaveBtn}
                       key={data.storage?.toString()}
                       defaultValue={data.storage?.toString() ?? ""}
                       label={'TON Storage'}
                       onChange={SaveStorage}
        />
        <br/>
        {
            !!data.dns_next_resolver && <>
                <InputWithSave defaultValue={data.dns_next_resolver.toString()} label={'Subdomains'} id={domain + '_subdomains'}
                               isAddress={true}
                               triggerOnSave={showSaveBtn}
                               key={data.dns_next_resolver.toString()}
                               onChange={SaveNextResolver}
                />
            </>
        }
        <br/>
        <br/>
        {!!showCreateBtn && !!createSubdomains &&

            <div style={{textAlign: 'center'}}>
                <Button variant={'contained'}
                        onClick={createSubdomains}>{data.dns_next_resolver ? 'Reset' : 'Create'} subdomains
                    contract</Button>
                <br/><br/>
            </div>
        }
        {
            !!data.dns_next_resolver && <NextDnsResolver address={data.dns_next_resolver!} parent={domain}/>
        }
    </Typography>

}


export function InputWithSave({defaultValue, label, id, onChange, isAddress, triggerOnSave, isText}: {
    defaultValue: unknown,
    label: string,
    id: string,
    isText?: boolean,
    isAddress?: boolean,
    triggerOnSave?: boolean,
    onChange?: (value: bigint | Address | null | string) => Promise<unknown>
}) {
    const [v, setV] = useState(defaultValue);
    const valueIT = useMemo(() => {
        if (isText) return v;
        if (!v) return null;
        if (isAddress) {
            try {
                return Address.parse(v as string);
            } catch (e) {
                return null;
            }
        }
        return BigInt('0x' + (v));
    }, [v]) as bigint | Address | null | string;
    useEffect(() => {
        if(!triggerOnSave) onChange?.(valueIT);
    }, [valueIT]);
    return <div style={{display: 'flex', position: 'relative'}}>
        <TextField
            id={id}
            label={label}
            onChange={useCallback((e: { target: { value: string } }) => {
                setV(e.target.value);
            }, [triggerOnSave, onChange, valueIT])}
            defaultValue={defaultValue?.toString() ?? ""}
            variant="outlined"
            sx={{color: 'white', width: '100%'}}
        />
        {triggerOnSave &&
            <Button style={{position: 'absolute', right: '10px', top: '10px'}}
                    onClick={() => (onChange?.(valueIT))}
                    variant={'contained'}
                    disabled={v === defaultValue}
            >Save</Button>
        }
    </div>
}