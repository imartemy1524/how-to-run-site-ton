import {useCallback, useEffect, useMemo, useState} from "react";
import {DnsData, useDnsResolver} from "../ton/dns-resolver.ts";
import {useParams} from "react-router-dom";
import {Address, toNano} from "@ton/core";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import {CardActions, CardContent} from "@mui/material";
import Typography from "@mui/material/Typography";
import useTonClient, {useSender} from "../ton/tonclient.ts";
import {SubdomainManager} from "../ton/SubdomainManager.ts";
import {useTonAddress} from "@tonconnect/ui-react";
import DataContent from "./DataContent.tsx";

export default function Manage() {
    const {wallet: walletString} = useParams();
    const wallet = useMemo(() => Address.parse(walletString!), [walletString]);
    const [data, setData] = useState<Partial<DnsData> | null>(null);
    const [domain, setDomain] = useState<string>('loading...');
    const [lastFillUp, setLastFillUp] = useState<number>(0);
    const resolver = useDnsResolver();
    const owner = useTonAddress();
    const provider = useTonClient();
    const sender = useSender();
    useEffect(() => {
        resolver.getAll(wallet).then(e => setData(e as DnsData))
            .then(() => new Promise(r => setTimeout(r, 1500)))
            .then(() => resolver.getDomain(wallet).then(e => setDomain(e)))
            .then(() => new Promise(r => setTimeout(r, 1500)))
            .then(() => resolver.getLastFillUp(wallet).then(e => setLastFillUp(e)))
    }, [wallet]);
    const createSubdomains = useCallback(async () => {
        const subdomainContract = provider.open(SubdomainManager.createFromConfig({
            owner: Address.parse(owner)
        }, 0));
        await Promise.all([
            subdomainContract.sendDeploy(sender, toNano('0.03')),
            resolver.setSubdomains(sender, wallet, subdomainContract.address)
        ]);
        for (let i = 0; i < 15; i++) {
            await new Promise(r => setTimeout(r, 10000));
            const d = await resolver.getAll(wallet);
            setData(d as DnsData);
        }

    }, [owner, sender, wallet, provider]);
    return (
        <div style={{margin: '0 10px'}}>
            <Card sx={{maxWidth: '100%', marginTop: '10px', background: '#474747', color: '#fff'}}>
                <CardHeader
                    avatar={
                        <Avatar sx={{bgcolor: '#5e5e5e'}} aria-label="recipe">
                            D
                        </Avatar>
                    }
                    action={
                        <IconButton aria-label="settings"></IconButton>
                    }
                    title={domain ? <><q>{domain}.*</q> domain name</> : 'Loading...'}
                    subheader={lastFillUp ? <span
                        style={{color: '#959595'}}>Last update: {new Date(lastFillUp * 1000).toLocaleDateString()}</span> : ''}
                />
                {/*<CardMedia*/}
                {/*    component="img"*/}
                {/*    height="194"*/}
                {/*    image="/static/images/cards/paella.jpg"*/}
                {/*    alt="Paella dish"*/}
                {/*/>*/}
                <CardContent>
                    {data &&
                        <DataContent {...data} createSubdomains={createSubdomains} domain={domain} save={(category, value)=>
                                resolver.set(sender, wallet, category, value)
                        } />
                    }
                    {
                        !data && <Typography variant="body2" color="#fff">
                            Loading...
                        </Typography>
                    }
                </CardContent>
                <CardActions disableSpacing>
                    bob bub
                </CardActions>
            </Card>
            <p>
                Now I suppose, that you're smart and have done everything, that was described in the previous steps.
                Now it is time for the most interesting part - subdomains.
            </p>
            <p>
                To create a subdomain, you need to <b>deploy a new smart contract</b> (which would resolve them) and <b>link
                it to the domain</b>.
            </p>
            <h3>WTF?</h3>
            <p>
                Yes, welcome to TON. Everything is hard here. But don't worry, I'll guide you through the process.
            </p>
        </div>
    )
}