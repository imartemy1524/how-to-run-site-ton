import Lol from "./assets/lol.avif";


export default function Footer() {
    return <div style={{display: 'flex', alignItems: 'center', gap: '10px', background: '#141111'}}>
        <p style={{marginLeft: "10px"}}>

            This is the end of the manual. <br/> If you have any questions, you can contact me by sending
            some
            tons to <a href={'ton://transfer/UQBKsNd8Q0SRLyJlyAGggIMrPAEuUeYFYC8PbXF6d-5zie1r'}>my
            wallet </a> :)
        </p>
        <img src={Lol} height={'100px'} style={{borderRadius: '5px', margin: '5px 5px 5px auto'}}/>
    </div>

}