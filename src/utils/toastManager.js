/*
    toastManager utility Module

    Implements a toast manager to track and manage toast notifications
    -Tracks active toasts by message and type
    -Handles duplicate toasts by counting occurrences
    -Allows for toast ID management
    -Provides methods to add, update, and remove toasts

*/

//Map to store active toasts by message and type
const activeToasts = new Map();

//Add timeout to determine when to reset counters
const RESET_TIMEOUT = 4000;

//Track toast by message and type (checking if duplicated to prevent spam)
export const trackToast = (message, type) => {
    const key = `${message}_${type}`;
    const currentTime = Date.now();

    if (activeToasts.has(key)) {
        //Update existing toast count
        const current = activeToasts.get(key);

        //Check if reset )timeout passed or not basicalluy)
        const timeSinceLastShow = currentTime - current.timestamp;

        if (timeSinceLastShow > RESET_TIMEOUT) {
            //Reset counter and timestamp
            const updated = {
                ...current,
                count: 1,
                timestamp: currentTime
            };
            activeToasts.set(key, updated);
            return updated;
        }
        else {
            //Increment
            const updated = {
                ...current,
                count: current.count + 1,
                timestamp: currentTime
            };
            activeToasts.set(key, updated);
            return updated;
        }
    }
    else {
        //Create new toast entry
        const newToast = {
            message,
            type,
            count: 1,
            timestamp: currentTime,
            id: null
        };
        activeToasts.set(key, newToast);
        return newToast;
    }
};

//Update toast ID in tracking map
export const setToastId = (message, type, id) => {
    const key = `${message}_${type}`;
    if (activeToasts.has(key)) {
        const current = activeToasts.get(key);
        activeToasts.set(key, { ...current, id });
    }
};

//Remove toast when expires
export const removeToast = (message, type) => {
    const key = `${message}_${type}`;
    activeToasts.delete(key);
};

//Get toast from tracking map
export const getToast = (message, type) => {
    const key = `${message}_${type}`;
    return activeToasts.get(key);
};