export type TMimeToExtensionsMap = Record<string, string>

export const mimeToExtensionMap: TMimeToExtensionsMap = {
  "audio/webm": "webm", // Supported by Chrome, Edge, Firefox
  "audio/ogg": "ogg", // Supported by Firefox, Safari
  "audio/mpeg": "mp3", // Supported widely, including Windows Media Player
  "audio/mp4": "m4a", // Often used for AAC audio (e.g., iOS devices)
  "audio/x-m4a": "m4a", // Another variant for AAC files
  "audio/wav": "wav", // Supported widely, uncompressed
  "audio/x-wav": "wav", // Another variant for WAV files
  "audio/flac": "flac", // Lossless audio format
  "audio/aac": "aac", // Advanced Audio Codec
  "audio/3gpp": "3gp", // Common for mobile devices
  "audio/3gpp2": "3g2", // Variant for mobile
  "audio/x-aiff": "aiff", // Apple AIFF files
  "audio/basic": "au", // Basic audio (used rarely)
  "audio/mid": "midi", // MIDI files
  "audio/x-mid": "midi", // Alternative for MIDI
  "audio/x-midi": "midi", // Alternative for MIDI
  "audio/x-ms-wma": "wma", // Windows Media Audio
  "audio/x-realaudio": "ra", // RealAudio format
  // Video as audio
  "video/webm": "webm", // Video MIME type treated as audio
  "video/mp4": "mp4", // MP4 files (sometimes used for audio)
} as const

export const mimeTypes = Object.keys(mimeToExtensionMap)
