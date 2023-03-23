import Head from 'next/head'
import Timer from '../components/Timer'
import NoSSR from '../components/NoSSR'

// TODO: create add long break mode

const Home = () => {
    return (
        <>
            <Head>
                <title>Atomic Pomodoro</title>
            </Head>
            <NoSSR>
                <Timer />
            </NoSSR>
        </>
    )
}

export default Home
