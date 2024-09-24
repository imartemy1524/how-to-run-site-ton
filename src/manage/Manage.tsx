import {useCallback, useEffect, useMemo, useState} from "react";
import {DnsData, useDnsResolver} from "../ton/dns-resolver.ts";
import {useParams} from "react-router-dom";
import {Address, toNano} from "@ton/core";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import {CardActions, CardContent, Link} from "@mui/material";
import Typography from "@mui/material/Typography";
import useTonClient, {useSender} from "../ton/tonclient.ts";
import {SubdomainManager} from "../ton/SubdomainManager.ts";
import {useTonAddress, useTonConnectModal} from "@tonconnect/ui-react";
import DataContent from "./DataContent.tsx";
import FirstScreen from "./FirstScreen.avif";
import Styles from "../main/steps/image.module.scss";

export default function Manage() {
    const {wallet: walletString} = useParams();
    const wallet = useMemo(() => Address.parse(walletString!), [walletString]);
    const [data, setData] = useState<Partial<DnsData> | null>(null);
    const [domain, setDomain] = useState<string>('loading...');
    const [lastFillUp, setLastFillUp] = useState<number>(0);
    const resolver = useDnsResolver();
    const owner = useTonAddress();
    const provider = useTonClient();
    const {open} = useTonConnectModal();
    const sender = useSender();
    useEffect(() => {
        resolver.getAll(wallet).then(e => setData((e??{}) as DnsData))
            .then(() => new Promise(r => setTimeout(r, 1500)))
            .then(() => resolver.getDomain(wallet).then(e => setDomain(e)))
            .then(() => new Promise(r => setTimeout(r, 1500)))
            .then(() => resolver.getLastFillUp(wallet).then(e => setLastFillUp(e)))
    }, [wallet]);
    const createSubdomains = useCallback(async () => {
        if (!owner) {
            return open();
        }
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
                        <DataContent {...data} createSubdomains={createSubdomains} domain={domain}
                                     save={(category, value) =>
                                         resolver.set(sender, wallet, category, value)
                                     }/>
                    }
                    {
                        !data && <Typography variant="body2" color="#fff">
                            Loading...
                        </Typography>
                    }
                </CardContent>
                <CardActions disableSpacing>
                </CardActions>
            </Card>
            <h2>What is it?</h2>
            <p>
                Here are configured some of the DNS queries for your NFT item.
            </p>
            <p>
                You can link your domain to the wallet, to a site in ADNL network, and to TON Storage item.
            </p>
            <h3>Deploying subdomains contract</h3>
            <p>
                To create subdomain you need to deploy a new contract, and link it to the current domain.
            </p>
            <p>
                <b>No worries!</b> The only thing you have to do is click <q>Create subdomains contract</q> button
                above.
            </p>
            <p>
                After your contract for subdomains is deployed, you can create them.
            </p>
            <h3>Creating subdomains</h3>
            <img src={FirstScreen} className={Styles.image}/>
            <p>Click <q>Add subdomain</q> button and add name of your subdomain (for example, <code>test</code>) and
                link it to something</p>
            <p> If you want to link it to your existing site just copy-paste the TON SITE variable in main field</p>
            <h4>Warning!</h4>
            <p>Dots <b>ARE NOT ALLOWED</b> in subdomains.</p>
            <p>
                To create subdomain <code>first.second.mymaindomain.ton</code>, you need recursively create 2 smart contracts.
            </p>
            <p>
                first for <code>second</code> subdomain, then <b>inside</b> <code>second</code> subdomain create <code>first</code> subdomain and link it to needed value (for example, to your site)
            </p>
            <h4>Example</h4>
            <p>
                As an example, you can look to the <Link href={`http://${location.host}/manage/0:90cc6ca5414e28eaa83cb8222f609cf9a7d194ba84f135a2fd50d8e9aab4a9d5`}>configuration of this site</Link>.
                <br/>
                It contains few domains:
                <ul>
                    <li><code>howtorunsite.ton</code> linked to wallet and this site</li>
                    <li><code>testnet.howtorunsite.ton</code> linked to this site</li>
                    <li><code>another.testnet.howtorunsite.ton</code> linked to this site</li>
                </ul>
            </p>
        </div>
    )
}