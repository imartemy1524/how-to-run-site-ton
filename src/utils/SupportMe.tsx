import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import {Link, Wallet} from "../config.tsx";
import Styles from "./SupportMe.module.scss";
import {useEffect, useRef} from "react";
import QRCodeStyling from "qr-code-styling";
import TonSumbol from "../assets/ton_symbol.svg";

export default function SupportMe() {
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


    return <Accordion style={{background: '#393939', color: '#fff', marginBottom: "20px"}}>
        <AccordionSummary>Support me for this article</AccordionSummary>
        <AccordionDetails className={Styles.accordion}>
            <div>
                You can support me by sending some TONs to next wallet: <br/>

                <a href={Link}>{Wallet}</a>
                <br/>
                It is linked to <code>howtorunsite.ton</code> domain.
            </div>
            <div id={"canvas"} ref={canvas} className={Styles.canvas}/>
        </AccordionDetails>

    </Accordion>
}