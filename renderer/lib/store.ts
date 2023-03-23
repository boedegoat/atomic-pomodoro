import Store from 'electron-store'

const store = new Store({ name: 'window-state-main' })

export const getOrSetDefault = (key: string, defaultValue?: any) => {
    let data = store.get(key)

    if (!data && defaultValue) {
        data = defaultValue
        store.set(key, defaultValue)
    }

    return data
}

export default store
