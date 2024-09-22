import Styles from "./image.module.scss";

import FifthImage2 from "./Fifth2.avif";

export default function Fifth(){
    return (
        <>
            <h2>Step #5</h2>
            <p>
                Now you need to wait for the auction to end, because now one needs to link the domain to your <q>private
                key</q>.
            </p>
            <p>
                After auction ends, you have 2 options:
            </p>
            <img src={FifthImage2} className={Styles.image} alt={'Screenshot linking the domain'}/>

            <ol>
                <li>

                    Link domain using <code>tonutils-reverse-proxy</code>:
                    <br/>

                    <code>./tonutils-reverse-proxy-linux-amd64 --domain yourdomain.ton</code>
                    <br/>
                    Scan the QR code with your wallet <strong>which owns this domain name</strong>, and approve it
                </li>
                <li>
                    Link domain using <a href={'https://dns.ton.org'} target={'_blank'}>TON DNS website</a>
                    <br/>
                    <p>
                        Go to you domain, click <q>Manage domain</q> button
                    </p>
                    <p>
                        Into the <q>TON Site</q> field, enter your public key, which would be printed by <code>tonutils-reverse proxy</code>
                    </p>
                    <p>
                        <b>Example</b>: <code>..... Server's ADNL address is blablabla.adnl (db1ea0c4a6cf772181f512806636c2fc2bbaeb40b7ea3585060194b8be41ad7e) {"<-"} this is the key in (...) </code>
                    </p>
                </li>
            </ol>
            <p>
                Everytime you change your private key (for example, by losing config file or migrating to new version),
                you need repeat linking domain process again.
            </p>

        </>
    )
}