import { useState } from 'react'
import store from '../lib/store'
import { Mode, Time } from './Timer'

const Settings = ({ onEdit, onClose, isStarted }) => {
    const [newTime, setNewTime] = useState<Time>(store.get('TIME') as Time)
    const [newShowProgress, setNewShowProgress] = useState(
        store.get('PROGRESS_IN_TASKBAR') as boolean
    )

    const onTimeEdit = (
        editedMode: Mode,
        timeUnit: 'minute' | 'seconds',
        value: number
    ) => {
        const latestTime = store.get('TIME') as Time
        const newTime = {
            ...latestTime,
            [editedMode]: {
                ...latestTime[editedMode],
                [timeUnit]: value,
            },
        }

        setNewTime(newTime)
        store.set('TIME', newTime)

        onEdit({ timeUnit, editedMode, newTime })
    }

    const onShowProgressEdit = (changedShowProgress: boolean) => {
        setNewShowProgress(changedShowProgress)
        store.set('PROGRESS_IN_TASKBAR', changedShowProgress)
    }

    return (
        <div className='relative max-w-lg mx-auto bg-gray-800 rounded-xl px-8 py-6 space-y-5 text-left shadow-lg'>
            <div className='flex justify-between items-center'>
                <h2 className='text-xl font-bold'>Settings</h2>
                <button
                    onClick={onClose}
                    className='group relative text-lg w-10 h-10 rounded-full flex items-center justify-center leading-none active:scale-90 transition-all'
                >
                    <span className='absolute inset-0 rounded-full bg-gray-900/50 scale-0 group-hover:scale-100 transition-all'></span>
                    <span className='relative'>✖️</span>
                </button>
            </div>
            <div
                style={{
                    opacity: isStarted ? '0.5' : '1',
                }}
                className='space-y-4'
            >
                <div className='flex flex-col space-y-2'>
                    <span className='font-medium'>Focus</span>
                    <div className='flex space-x-4 items-center'>
                        <input
                            type='number'
                            disabled={isStarted}
                            min={0}
                            value={newTime.focus.minute}
                            onChange={(e) =>
                                onTimeEdit(
                                    'focus',
                                    'minute',
                                    Number(e.target.value)
                                )
                            }
                            className='bg-gray-700 w-20 rounded-md px-3 py-1 focus:outline-none'
                        />
                        <span>Minute</span>
                        <input
                            type='number'
                            disabled={isStarted}
                            min={0}
                            value={newTime.focus.seconds}
                            onChange={(e) =>
                                onTimeEdit(
                                    'focus',
                                    'seconds',
                                    Number(e.target.value)
                                )
                            }
                            className='bg-gray-700 w-20 rounded-md px-3 py-1 focus:outline-none'
                        />
                        <span>Seconds</span>
                    </div>
                </div>
                <div className='flex flex-col space-y-2'>
                    <span className='font-medium'>Break</span>
                    <div className='flex space-x-4 items-center'>
                        <input
                            type='number'
                            disabled={isStarted}
                            min={0}
                            value={newTime.break.minute}
                            onChange={(e) =>
                                onTimeEdit(
                                    'break',
                                    'minute',
                                    Number(e.target.value)
                                )
                            }
                            className='bg-gray-700 w-20 rounded-md px-3 py-1 focus:outline-none'
                        />
                        <span>Minute</span>
                        <input
                            type='number'
                            disabled={isStarted}
                            min={0}
                            value={newTime.break.seconds}
                            onChange={(e) =>
                                onTimeEdit(
                                    'break',
                                    'seconds',
                                    Number(e.target.value)
                                )
                            }
                            className='bg-gray-700 w-20 rounded-md px-3 py-1 focus:outline-none'
                        />
                        <span>Seconds</span>
                    </div>
                </div>
                <div className='flex items-center'>
                    <label htmlFor='edit-show-progress'>
                        <input
                            id='edit-show-progress'
                            disabled={isStarted}
                            checked={newShowProgress}
                            onChange={(e) =>
                                onShowProgressEdit(e.target.checked)
                            }
                            type='checkbox'
                            className='w-4 h-4 mr-2'
                        />
                        <span className='font-medium'>
                            Show progress in taskbar
                        </span>
                    </label>
                </div>
            </div>
        </div>
    )
}

export default Settings
