import { useEffect, useState } from 'react'
import { ipcRenderer } from 'electron'
import store, { getOrSetDefault } from '../lib/store'
import Settings from './Settings'

export type ModeTime = {
    minute: number
    seconds: number
}

export type Time = {
    focus: ModeTime
    break: ModeTime
}

export type Mode = 'focus' | 'break'

const DEFAULT_TIME: Time = {
    focus: {
        minute: 25,
        seconds: 0,
    },
    break: {
        minute: 5,
        seconds: 0,
    },
}

const constructMs = ({ minute, seconds }: ModeTime) => {
    return minute * 60 * 1000 + seconds * 1000
}

export const INITIAL_TIME = getOrSetDefault('TIME', DEFAULT_TIME) as Time
const INITIAL_MODE: Mode = 'focus'
let interval: NodeJS.Timer

const Timer = () => {
    const [isStarted, setIsStarted] = useState(false)
    const [state, setState] = useState<'running' | 'paused'>(null)
    const [mode, setMode] = useState<Mode>(INITIAL_MODE)
    const [ms, setMs] = useState(constructMs(INITIAL_TIME[INITIAL_MODE]))
    const [notif, setNotif] = useState<Notification>(null)
    const [openSettings, setOpenSettings] = useState(false)
    const [appInfo, setAppInfo] = useState(null)

    const displayTime = new Date(ms).toTimeString().slice(3, 8)

    useEffect(() => {
        ipcRenderer.send('request-app-info')

        const onSetAppInfo = (ev, data) => {
            setAppInfo(data)
        }
        ipcRenderer.on('set-app-info', onSetAppInfo)

        return () => {
            ipcRenderer.off('set-app-info', onSetAppInfo)
        }
    }, [])

    const onFinish = () => {
        setIsStarted(false)
        setState(null)

        ipcRenderer.send('show-app')

        const alarm = new Audio('/audio/alarm.mp3')
        alarm.play()

        const latestTime = store.get('TIME') as Time
        let newNotif: Notification

        if (mode === 'focus') {
            setMode('break')
            setMs(constructMs(latestTime.break))
            newNotif = new Notification('Focus session finished', {
                body: "Let's take a break",
            })
        }
        if (mode === 'break') {
            setMode('focus')
            setMs(constructMs(latestTime.focus))
            newNotif = new Notification('Break finished', {
                body: "Let's start focusing",
            })
        }
        newNotif.onclick = () => {
            ipcRenderer.send('show-app')
        }
        setNotif(newNotif)
    }

    const runTimer = () => {
        setState('running')
        setMs((m) => m - 1000)
        interval = setInterval(() => {
            setMs((prevMs) => {
                const newMs = prevMs - 1000
                if (newMs === 0) {
                    clearInterval(interval)
                    onFinish()
                }
                return newMs
            })
        }, 1000)
    }

    const onStart = () => {
        setIsStarted(true)
        notif?.close()
        setNotif(null)
        runTimer()
    }

    const onResume = () => {
        runTimer()
    }

    const onPause = () => {
        clearInterval(interval)
        setState('paused')
    }

    const onRestart = () => {
        setIsStarted(false)
        setState(null)
        clearInterval(interval)
        const latestTime = store.get('TIME') as Time
        setMs(constructMs(latestTime[mode]))
    }

    const onChangeMode = (selectedMode: Mode) => {
        setMode(selectedMode)
        const latestTime = store.get('TIME') as Time
        setMs(constructMs(latestTime[selectedMode]))
    }

    const onEdit = ({ editedMode, newTime }) => {
        if (mode === editedMode) {
            setMs(constructMs(newTime[mode]))
        }
    }

    const onOpenSettings = () => {
        setOpenSettings(true)
    }

    const onCloseSettings = () => {
        setOpenSettings(false)
    }

    return (
        <div className='flex flex-col h-screen items-center justify-center'>
            <h2 className='text-[6rem] mb-0.5 -my-10'>{displayTime}</h2>
            <span className='font-medium text-sm mb-10'>
                {mode === 'focus' ? '✍️ Focus' : '🏖️ Break'}
            </span>
            <div className='flex justify-center space-x-4'>
                {!isStarted ? (
                    <>
                        <button onClick={onStart} className='btn-blue'>
                            Start {mode === 'focus' ? 'Focusing' : 'Break'}
                        </button>
                        <button
                            onClick={() =>
                                onChangeMode(
                                    mode === 'focus' ? 'break' : 'focus'
                                )
                            }
                        >
                            or start {mode === 'focus' ? 'break' : 'focusing'}
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={state === 'running' ? onPause : onResume}
                            className='btn-blue'
                        >
                            {state === 'running' ? 'Pause' : 'Resume'}
                        </button>
                        <button onClick={onRestart}>Restart</button>
                    </>
                )}
            </div>
            <div className='absolute bottom-4 w-full px-4 text-sm flex justify-between'>
                <button onClick={onOpenSettings}>⚙️</button>
                <span className='opacity-20'>
                    v{appInfo?.version} © {new Date().getFullYear()} Bhremada
                    Fevreano
                </span>
            </div>
            <div
                style={{
                    opacity: openSettings ? '1' : '0',
                    pointerEvents: openSettings ? 'auto' : 'none',
                }}
                className='fixed inset-0 transition-all flex items-center justify-center'
            >
                <div
                    onClick={onCloseSettings}
                    className='fixed w-full h-full bg-gray-900/40 duration-500 backdrop-blur-sm'
                ></div>
                <Settings
                    isStarted={isStarted}
                    onEdit={onEdit}
                    onClose={onCloseSettings}
                />
            </div>
        </div>
    )
}

export default Timer
