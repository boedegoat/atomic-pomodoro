import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'

const isProd: boolean = process.env.NODE_ENV === 'production'

if (isProd) {
    serve({ directory: 'app' })
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`)
}

;(async () => {
    await app.whenReady()

    const mainWindow = createWindow('main', {
        width: 460,
        height: 460,
        autoHideMenuBar: true,
        webPreferences: {
            backgroundThrottling: false, // fix setInterval throttled when app minimized
        },
    })
    global.mainWindow = mainWindow

    if (isProd) {
        await mainWindow.loadURL('app://./home.html')
    } else {
        const port = process.argv[2]
        await mainWindow.loadURL(`http://localhost:${port}/home`)
    }

    ipcMain.on('show-app', () => {
        mainWindow.show()
    })

    ipcMain.on('request-app-info', (ev) => {
        const data = {
            version: app.getVersion(),
            platform: process.platform,
        }
        ev.sender.send('set-app-info', data)
    })
})()

app.on('window-all-closed', () => {
    app.quit()
})
