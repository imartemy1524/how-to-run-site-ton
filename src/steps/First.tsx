import {Link} from "@mui/material";
export default function First() {
    return (
        <>
            <p>First, you need to buy <Link href={"https://dns.ton.org"} target={'_blank'}>.ton</Link> domain name</p>
            <p>
                Enter wanted domain name and click enter
            </p>

            <p>
                Now you need to place a bid on the domain, click on the <q>Place a bid to start the auction</q> button.
            </p>
            <p>
                <b>TIP: </b> the more symbols in domain the cheaper it will be.
            </p>

            <p>
                Now, when you domain is "on auction", you'll need to wait for 1 hour, so lets go to the next step.
            </p>
        </>
    )
}