import Navbar from './Navbar';
import '../styles/globals.css';
import Head from "next/head";
import {KeycloakProvider} from "../auth/provider/KeycloakProvider";


function MyApp({Component, pageProps}) {
    return (
        <>
            <Head>
                <title>Keep Note</title>
                <link rel="icon" href="/file.svg"/>
            </Head>
            <KeycloakProvider>
                <Navbar/>
                <Component {...pageProps} />
            </KeycloakProvider>
        </>
    );
}

export default MyApp;
