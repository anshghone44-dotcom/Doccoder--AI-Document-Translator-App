export const Logger = {
    info: (message: string, data?: any) => {
        console.log(JSON.stringify({ level: "INFO", timestamp: new Date().toISOString(), message, ...data }))
    },
    error: (message: string, error?: any, data?: any) => {
        console.error(JSON.stringify({
            level: "ERROR",
            timestamp: new Date().toISOString(),
            message,
            error: error?.message || error,
            stack: error?.stack,
            ...data
        }))
    },
    warn: (message: string, data?: any) => {
        console.warn(JSON.stringify({ level: "WARN", timestamp: new Date().toISOString(), message, ...data }))
    }
}
