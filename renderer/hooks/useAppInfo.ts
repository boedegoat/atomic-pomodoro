import { ipcRenderer } from 'electron'
import { useEffect, useState } from 'react'

const useAppInfo = () => {
    const [appInfo, setAppInfo] = useState(null)

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

    return appInfo
}

export default useAppInfo
