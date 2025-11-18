import { is_development_mode } from "./application.js"

export const log = (component, message) => is_development_mode() 
    ? console.log(`[${component}] ${message}`)
    : null;