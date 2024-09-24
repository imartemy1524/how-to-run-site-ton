import {useTonAddress, useTonConnectModal} from "@tonconnect/ui-react";
import Button from "@mui/material/Button";
import {useEffect, useState} from "react";
import {useTestnet} from "../ton/tonclient.ts";
import OneNftItem from "./OneNftItem.tsx";

export interface INftItem {
    "address": string,
    "index": number,
    "owner": {
        "address": "0:4ab0d77c4344912f2265c801a080832b3c012e51e605602f0f6d717a77ee7389",
        "name": string,
        "is_scam": false,
        "icon": "https://cache.tonapi.io/imgproxy/3CJlLTsL6tDB8jZ8uM_wmDBqqYMb44Hq3agsMTjJm4o/rs:fill:200:200:1/g:no/aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3RvbmtlZXBlci9vcGVudG9uYXBpL21hc3Rlci9wa2cvcmVmZXJlbmNlcy9tZWRpYS9kb21haW5fcGx1Zy5wbmc.webp",
        "is_wallet": true
    },
    "collection": {
        "address": "0:b774d95eb20543f186c06b371ab88ad704f7e256130caf96189368a7d0cb6ccf",
        "name": "TON DNS Domains",
        "description": "*.ton domains"
    },
    "verified": true,
    "metadata": {
        "name": string,
        "buttons": []
    },
    "previews": [
        {
            "resolution": "5x5",
            "url": "https://cache.tonapi.io/imgproxy/0Cv-wQiVODsUZb0DOJs-FibIqz_SHE9SBZk80PzBmRg/rs:fill:5:5:1/g:no/aHR0cHM6Ly9jYWNoZS50b25hcGkuaW8vZG5zL3ByZXZpZXcvaG93dG9ydW5zaXRlLnRvbi5wbmc.webp"
        },
        {
            "resolution": "100x100",
            "url": "https://cache.tonapi.io/imgproxy/5HvJeYelyZ13_LPKAfDWHmmPzn387OAOVduLExvsqMM/rs:fill:100:100:1/g:no/aHR0cHM6Ly9jYWNoZS50b25hcGkuaW8vZG5zL3ByZXZpZXcvaG93dG9ydW5zaXRlLnRvbi5wbmc.webp"
        },
        {
            "resolution": "500x500",
            "url": "https://cache.tonapi.io/imgproxy/dSEXrCdfngDEizt9FdlgvK4sgfKtHEHlPE7Ufl2kqsY/rs:fill:500:500:1/g:no/aHR0cHM6Ly9jYWNoZS50b25hcGkuaW8vZG5zL3ByZXZpZXcvaG93dG9ydW5zaXRlLnRvbi5wbmc.webp"
        },
        {
            "resolution": "1500x1500",
            "url": "https://cache.tonapi.io/imgproxy/ouKwQB2Uvss8u5dfcCV3GwpjnmgNnc_nAC8erhWstHQ/rs:fill:1500:1500:1/g:no/aHR0cHM6Ly9jYWNoZS50b25hcGkuaW8vZG5zL3ByZXZpZXcvaG93dG9ydW5zaXRlLnRvbi5wbmc.webp"
        }
    ],
    "dns": "howtorunsite.ton",
    "approved_by": [
        "getgems"
    ],
    "trust": "whitelist"
}


export default function MyDomains() {
    const address = useTonAddress();
    const {open} = useTonConnectModal();
    const testnet = useTestnet();
    const [domains, setDomains] = useState<INftItem[]>([]);


    useEffect(() => void loadData(), [address]);

    async function loadData() {
        if(!address)return;
        const collection = testnet ? 'kQDjPtM6QusgMgWfl9kMcG-EALslbTITnKcH8VZK1pnH3f3K' : 'EQC3dNlesgVD8YbAazcauIrXBPfiVhMMr5YYk2in0Mtsz0Bz';
        const itemsRaw = await fetch(
            `https://${testnet?'testnet.':''}tonapi.io/v2/accounts/${address}/nfts?collection=${collection}&limit=1000&offset=0&indirect_ownership=false`
        ).then(e => e.json());
        const items = itemsRaw?.nft_items as INftItem[];
        setDomains(items??[]);
    }

    if (!address) {
        return (
            <div style={{margin: "0 10px", textAlign: 'center'}}>
                <h3>Link TON wallet to continue</h3>
                <Button onClick={open} variant={'contained'}>Link</Button>
            </div>
        )
    }
    return (
        <div style={{margin: "0 10px"}}>
            <h1>My domains</h1>
            <p>
                Here you can manage your domains. <br/> You can link your wallet, set up a site, and etc.
            </p>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
                {
                    domains.map(e => <OneNftItem {...e} />)
                }
            </div>
        </div>
    )
}