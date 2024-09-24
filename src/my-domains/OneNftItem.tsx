import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {INftItem} from "./my-domains.tsx";
import {useTestnet} from "../ton/tonclient.ts";
import {useNavigate} from "react-router-dom";

export default function OneNftItem({dns, previews, address, metadata: {name}}: INftItem) {
    const isTestnet = useTestnet();
    const navigate = useNavigate();
    return (
        <Card sx={{maxWidth: 345, minWidth: "300px", background: '#474747', color: '#fff'}}>
            <CardMedia
                component={'a'} href={`/manage/${address}`} onClick={(e) => {
                e.preventDefault();
                navigate(`/manage/${address}`);
            }}
                sx={{height: 140}}
                image={previews[3]!.url}
                title="green iguana"
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {dns}
                </Typography>
                <Typography variant="body2" sx={{color: '#9f9f9f'}}>
                    Dns NFT item <b>{name?.split('.')?.[0]?.length}</b> symbols length.
                    <br/>
                    Original price
                    was <b>{[0, 0, 0, 0, 100, 50, 40, 30, 20, 10, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1][dns?.length??0]} TON</b>
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" component={'a'} href={`/manage/${address}`} onClick={(e) => {
                    e.preventDefault();
                    navigate(`/manage/${address}`);
                }}>Edit</Button>
                <Button size="small" component={'a'}
                        href={`https://${isTestnet ? 'testnet.' : ''}tonviewer.com/${address}`}>
                    <img src={'https://tonviewer.com/favicon-32x32.png'} width={'14px'}
                         height={'14px'}/> &nbsp; Tonviewer</Button>
            </CardActions>
        </Card>
    );
}
