import {Link} from "@mui/material";


export default function Third() {
    return (
        <>
            <h2>Step #3</h2>
            <p>
                Now you need to install <Link href={'https://github.com/tonutils/reverse-proxy'} target={'_blank'}>tonutils
                reverse proxy</Link>,
                which would proxy your site to the TON open network.
            </p>
            <p>
                To do this, you need to run following commands in the terminal (linux): <br/>
                <code>wget
                    https://github.com/ton-utils/reverse-proxy/releases/latest/download/tonutils-reverse-proxy-linux-amd64</code>
                <br/>
                <code>chmod +x tonutils-reverse-proxy-linux-amd64</code>
                <br/>
            </p>

        </>
    )
}