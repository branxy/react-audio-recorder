export type TMimeToExtensionsMap = Record<string, string>

export const mimeToExtensionMap: TMimeToExtensionsMap = {
  "audio/webm": "webm", // Supported by Chrome, Edge, Firefox
  "audio/ogg": "ogg", // Supported by Firefox, Safari
  "audio/mpeg": "mp3", // Supported widely, including Windows Media Player
  "audio/mp4": "m4a", // Often used for AAC audio (e.g., iOS devices)
} as const

export const mimeTypes = Object.keys(mimeToExtensionMap)
