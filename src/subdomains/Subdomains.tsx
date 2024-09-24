import {TextField} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {useState} from "react";
import {useDnsResolver} from "../ton/dns-resolver.ts";
import {useNavigate} from "react-router-dom";


export default function Subdomains() {
    const [value, setValue] = useState('');
    const resolver = useDnsResolver();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    async function search() {
        if (loading) return;
        setLoading(true);
        try {
            const address = await resolver.getWalletAddress(value, true);
            navigate(`/manage/${address?.toString()}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{margin: "0 10px"}}>
            <h1>Managing domains</h1>
            <p>
                Here you can manage DNS queries for your .ton domain. <br/> You can link your wallet, set up a site, ans etc.
            </p>
            <Box
                component={'div'}
                sx={{'& > :not(style)': {m: 1, width: 'calc(100% - 16px)'}}}
            >
                <TextField id="outlined-basic" label="Enter your .ton domain here to manage it" variant="outlined"
                           sx={{color: 'white', width: '100%'}} onSubmit={search}
                           onChange={e => setValue(e.target.value)}/>
                <Button variant="contained" onClick={search} disabled={!value || loading}>
                    {loading ? "Loading..." : 'Search'}
                </Button>
            </Box>

        </div>
    );
}