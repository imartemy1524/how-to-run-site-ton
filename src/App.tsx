// import Button from '@mui/material/Button';

import Styles from "./steps/image.module.scss";
import First from "./steps/First.tsx";
import Second from "./steps/Secon.tsx";
import Third from "./steps/Third.tsx";
import FirstImage from "./steps/First.avif";
import Fourth from "./steps/Fourth.tsx";
import Fifth from "./steps/Fifth.tsx";
import QRCodeStyling from "qr-code-styling"
import FifthImage from "./steps/Fifth.avif";
import Six from "./steps/Six.tsx";
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Lol from "./assets/lol.avif";
import {useEffect, useRef} from "react";
const Wallet = 'UQBKsNd8Q0SRLyJlyAGggIMrPAEuUeYFYC8PbXF6d-5zie1r';
const Link = `ton://transfer/${Wallet}`;
import TonSumbol from "./assets/ton_symbol.svg";
export default function App() {
    const canvas = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const qrCode = new QRCodeStyling({
            width: 300,
            height: 300,
            type: "svg",
            data: Link,
            image: TonSumbol,
            dotsOptions: {
                color: "#0098EA",
                type: "rounded"
            },
            backgroundOptions: {
                color: "transparent",
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 0,
                hideBackgroundDots: false

            },
            cornersSquareOptions: {
                type: 'extra-rounded'
            }
        });
        canvas.current!.innerHTML = '';
        qrCode.append(canvas.current!);


    }, []);

    return (
        <>
            <div style={{margin: "0 10px"}}>
                <h1 className={Styles.h1}>How to run .ton site</h1>
                <p>This is the manual, how to run your own <strong>.ton</strong> site on TON.</p>

                <Accordion style={{background: '#393939', color: '#fff', marginBottom: "20px"}}>
                    <AccordionSummary>Support me for this article</AccordionSummary>
                    <AccordionDetails style={{display: 'flex'}}>
                        <div>
                        You can support me by sending some TONs to next wallet: <br/>

                        <a href={Link}>{Wallet}</a>
                        <br/>
                        It is linked to <code>howtorunsite.ton</code> domain.
                        </div>
                        <div id={"canvas"} ref={canvas} className={Styles.canvas} />
                    </AccordionDetails>

                </Accordion>
                <img src={FirstImage} className={Styles.image} alt={'screenshot'} style={{float: 'right'}}/>
                <h2>Step #1</h2>
                <First/>

                <Second/>
                <Third/>

                <img src={FifthImage} className={Styles.image} alt={'Screenshot linking the domain'}/>
                <Fourth/>
                <Fifth/>
                <Six/>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', background: '#141111'}}>
                <p style={{marginLeft: "10px"}}>

                    This is the end of the manual. <br/> If you have any questions, you can contact me by sending some
                    tons to <a href={'ton://transfer/UQBKsNd8Q0SRLyJlyAGggIMrPAEuUeYFYC8PbXF6d-5zie1r'}>my
                    wallet </a> :)
                </p>
                <img src={Lol} height={'100px'} style={{borderRadius: '5px', margin: '5px 5px 5px auto'}}/>
            </div>
        </>
    )
}

