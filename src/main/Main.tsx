import Styles from "./steps/image.module.scss";
import FirstImage from "./steps/First.avif";
import First from "./steps/First.tsx";
import Second from "./steps/Secon.tsx";
import Third from "./steps/Third.tsx";
import FifthImage from "./steps/Fifth.avif";
import Fourth from "./steps/Fourth.tsx";
import Fifth from "./steps/Fifth.tsx";
import Six from "./steps/Six.tsx";
import SupportMe from "../utils/SupportMe.tsx";
import {Link} from "@mui/material";
import {useNavigate} from "react-router-dom";

export default function Main() {
    const navigate = useNavigate();
    return (
        <div style={{margin: "0 10px"}}>
            <h1 className={Styles.h1}>How to run .ton site</h1>
            <p>This is the manual, how to run your own <strong>.ton</strong> site on TON.</p>
            <SupportMe/>
            <img src={FirstImage} className={Styles.image} alt={'screenshot'} style={{float: 'right'}}/>
            <h2>Step #1</h2>
            <First/>

            <Second/>
            <Third/>

            <img src={FifthImage} className={Styles.image} alt={'Screenshot linking the domain'}/>
            <Fourth/>
            <Fifth/>
            <Six/>

            <h2>Subdomains</h2>
            <p>Not tired yet? Then lets create subdomain!</p>
            <p>
                To do this, navigate to <Link href={'/subdomains'} onClick={e => {
                e.preventDefault();
                navigate('/subdomains');
            }}>Manage DNS</Link> domain tab, enter your domain name and click <q>Search</q>
            </p>
        </div>
    )
}