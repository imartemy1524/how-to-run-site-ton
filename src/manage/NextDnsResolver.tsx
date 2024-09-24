import {Address, ADNLAddress, toNano} from "@ton/core";
import {Category, DnsData, StorageBagId} from "../ton/dns-resolver.ts";
import {Fragment, useCallback, useEffect, useMemo, useState} from "react";
import useTonClient, {useSender} from "../ton/tonclient.ts";
import {SubdomainManager} from "../ton/SubdomainManager.ts";
import Button from "@mui/material/Button";
import DataContent, {InputWithSave} from "./DataContent.tsx";
import {TextField} from "@mui/material";
import {useTonAddress} from "@tonconnect/ui-react";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Accordion from "@mui/material/Accordion";

type AddDomainName = Partial<DnsData>;

export default function NextDnsResolver({address, parent}: { address: Address, parent: string }) {
    const provider = useTonClient();
    const contract = useMemo(() => provider.open(
        SubdomainManager.createFromAddress(address)
    ), [provider, address.toString(), parent]);
    const [loadedDomains, setLoadedDomains] = useState<Map<string, Partial<DnsData> | null>>(new Map());
    const [addingDomains, setAddingDomains] = useState<AddDomainName[]>([]);
    const sender = useSender();
    const owner = useTonAddress();
    useEffect(() => void loadData(), [parent]);

    async function loadData() {
        setLoadedDomains(new Map());
        await new Promise(r => setTimeout(r, 4500));
        setLoadedDomains(await contract.getAll());
    }

    const deleteDomain = useCallback(async (name: string) => {
        await contract.sendDelete(sender, toNano('0.015'), name);
        setLoadedDomains(d => {
            const m = new Map(d);
            m.delete(name);
            return m;
        });
    }, []);

    async function addDomain(i: number, name: string) {
        const el = Object.fromEntries(
            Object.entries(addingDomains[i]).filter(([_, v]) => !!v)
        ) as AddDomainName;
        const promises = [];
        if (el.wallet) {
            promises.push(contract.sendSetWallet(sender, toNano('0.013'), name, el.wallet));
        }
        if (el.site) {
            promises.push(contract.sendSetSite(sender, toNano('0.013'), name, el.site));
        }
        if (el.storage) {
            promises.push(contract.sendSetStorage(sender, toNano('0.013'), name, el.storage));
        }
        if (el.dns_next_resolver) {
            console.warn('This shouldn\'t happened...')
            promises.push(contract.sendSetNextResolver(sender, toNano('0.013'), name, el.dns_next_resolver));
        }
        if (!promises.length) {
            alert("You need to fill at least one field");
            return;
        }
        await Promise.all(promises);
        setAddingDomains(d => d.filter((_, j) => j !== i));
        setLoadedDomains(d => new Map(d).set(name, el));
    }

    async function updateValue(domain: string, category: Category, val: ADNLAddress | StorageBagId | Address | null) {
        switch (category) {
            case Category.DNS_CATEGORY_NEXT_RESOLVER:
                await contract.sendSetNextResolver(sender, toNano('0.015'), domain, val as Address);
                break;
            case Category.DNS_CATEGORY_SITE:
                await contract.sendSetSite(sender, toNano('0.015'), domain, val as ADNLAddress);
                break;
            case Category.DNS_CATEGORY_STORAGE:
                await contract.sendSetStorage(sender, toNano('0.015'), domain, val as StorageBagId);
                break;
            case Category.DNS_CATEGORY_WALLET:
                await contract.sendSetWallet(sender, toNano('0.015'), domain, val as Address);
                break;
            default:
                console.error('Unknown category: ' + category);
        }
        setLoadedDomains(d => new Map(d).set(domain, {...d.get(domain), [category]: val}));
    }

    async function createSubdomain(domain: string) {
        const subdomainContract = provider.open(SubdomainManager.createFromConfig({
            owner: Address.parse(owner)
        }, 0));
        //update 2 at once
        await Promise.all([
            subdomainContract.sendDeploy(sender, toNano('0.03')),
            updateValue(domain, Category.DNS_CATEGORY_NEXT_RESOLVER, subdomainContract.address),
        ]);
        setLoadedDomains(d => new Map(d).set(domain, {...d.get(domain), dns_next_resolver: subdomainContract.address}));

    }

    return (
        <div>
            <Accordion style={{background: '#393939', color: '#fff', marginBottom: "20px"}}>
                <AccordionSummary>
                    <h3>Subdomains ({parent}.*)</h3>
                </AccordionSummary>
                <AccordionDetails>
                    <div style={{textAlign: 'center'}}>
                        <Button variant={'outlined'}
                                onClick={useCallback(() => setAddingDomains(d => [...d, {}]), [])}
                        >Add subdomain</Button>
                    </div>
                    <br/>
                    {
                        Array.from(loadedDomains.entries()).map(([domain, value], index) => <Fragment key={domain}>
                            <div style={{position: 'relative'}}>
                                <TextField label={`Subdomain (${domain}.${parent}.*)`} variant="outlined"
                                           sx={{color: 'white', width: '100%'}}
                                           value={domain}
                                           disabled={true}
                                />
                                <Button variant={'outlined'} style={{position: 'absolute', right: "10px", top: "10px"}}
                                        color={'error'}
                                        onClick={() => deleteDomain(domain)}
                                >Delete</Button>
                            </div>
                            <br/>
                            <br/>
                            <DataContent save={async (category, val) => updateValue(domain, category, val)}
                                         domain={domain + '.' + parent} {...value}
                                         createSubdomains={() => createSubdomain(domain)} showCreateBtn={true}
                                         showSaveBtn={true}/>

                                    {(index !== loadedDomains.size - 1 || !!addingDomains.length) && <hr/>}
                        </Fragment>)
                    }
                    {addingDomains.map((_, i) => <div key={i}>
                        <InputWithSave
                            label={`Subdomain (for "bob" would be "bob.${parent}.*")`}
                            defaultValue={''}
                            onChange={(v) => addDomain(i, v as string)}
                            triggerOnSave={true}
                            id={'subdomain-' + i}
                            isText={true}
                        />
                        <br/>
                        <br/>
                        <DataContent save={async (category, value) => {
                            setAddingDomains(d => d.map((v, j) => i === j ? {...v, [category]: value} : v));
                        }} domain={i + '.' + parent} dns_next_resolver={null} site={null} storage={null}
                                     wallet={null} showCreateBtn={false} showSaveBtn={false}/>
                        {i !== addingDomains.length - 1 && <hr/>}
                    </div>)}

                </AccordionDetails>
            </Accordion>


        </div>
    )
}