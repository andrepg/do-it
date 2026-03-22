import { is_development_mode } from "./application.js"

/**
 * Logs a message to the console exclusively in development mode.
 *
 * @param component The name of the component or module originating the log.
 * @param message The message to be logged.
 */
export const log = (component: string, message: string) => is_development_mode()
    ? console.log(`[${component}] ${message}`)
    : null;