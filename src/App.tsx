import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {Header} from "./Header.tsx";
import Main from "./main/Main.tsx";
import {TonConnectUIProvider} from "@tonconnect/ui-react";
import Subdomains from "./subdomains/Subdomains.tsx";
import Footer from "./Footer.tsx";
import {Alert, createTheme, ThemeProvider} from "@mui/material";
import Manage from "./manage/Manage.tsx";
import {useTestnet} from "./ton/tonclient.ts";
import MyDomains from "./my-domains/my-domains.tsx";

const theme = createTheme({
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiInputBase-input': {
                        color: '#fff',
                    },
                    '& label': {
                        color: '#858585',
                    },
                    '& fieldset': {
                        borderColor: '#858585',
                    },
                    '& input[disabled] + fieldset span': {
                        color: '#fff!important',
                    }
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    '&':{
                        color: '#fff',
                    },
                    '&[disabled]': {
                        color: '#676767!important',
                    }
                }
            },
        },
    },
});
export default function App() {
    const isTestnet = useTestnet();
    return (
        <ThemeProvider theme={theme}>

            <TonConnectUIProvider
                manifestUrl="https://gist.githubusercontent.com/imartemy1524/c27f63997c32dc566557010ee1907302/raw/0056f65f34d2e429dc9ff6e10e678e9957656a8c/manifest.json">
                <Router>
                    <div>
                        <Header/>
                        <br/><br/>
                        <br/>
                        {isTestnet && <Alert icon={''} severity="warning">
                            You're using testnet version. Don't send REAL TON coins here!
                        </Alert>}
                        <Routes>
                            <Route path="/" element={<Main/>}/>
                            <Route path="/subdomains" element={<Subdomains/>}/>
                            <Route path="/manage/:wallet" element={<Manage/>}/>
                            <Route path="/my-domains" element={<MyDomains/>}/>
                        </Routes>
                    </div>
                    <Footer/>
                </Router>
            </TonConnectUIProvider>
        </ThemeProvider>
    )
}

