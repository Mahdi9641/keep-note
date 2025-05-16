import Navbar from './Navbar';
import '../styles/globals.css';
import Head from "next/head";
import {KeycloakProvider} from "../auth/provider/KeycloakProvider";


function MyApp({Component, pageProps}) {
    return (
        <>
            <KeycloakProvider>
            <Head>
                <title>Keep Note</title>
                <link rel="icon" href="/keep_2020q4_48dp.png"/>
            </Head>
                <Navbar/>
                <Component {...pageProps} />
            </KeycloakProvider>
        </>
    );
}

export default MyApp;
