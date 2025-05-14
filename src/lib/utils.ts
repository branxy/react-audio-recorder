import { mimeTypes } from "@/constants"
import type {
  TInnerState,
  UseAudioRecordingProps,
} from "@/lib/hooks/use-audio-recording"
import type { TSupportedMIMETypes } from "@/types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getAudioRecorderStatusBooleans = (
  status: TInnerState["recorderState"]["status"]
) => {
  const isIdle = status === "idle",
    isRecording = status === "recording",
    isPlaying = status === "playing",
    isStopped = status === "stopped",
    isError = status === "error"

  return { isIdle, isRecording, isPlaying, isStopped, isError }
}

export const getRecordingCurrentTime = ({
  recorderState,
  maxLength,
  currentTime,
  asc,
}: Pick<TInnerState, "recorderState" | "currentTime"> &
  Required<Pick<UseAudioRecordingProps, "maxLength">> & {
    asc: boolean
  }): {
  minutes: string
  seconds: string
  milliseconds: string
} | null => {
  // All recorder/player states:
  // idle (recorder mounted): show nothing (not timing)
  // recording: always show descending (max recording time - current time)
  // stopped (after recording or after playback): show total recording time
  // playback: show current time
  const { isIdle, isStopped } = getAudioRecorderStatusBooleans(
    recorderState.status
  )

  if (isIdle) return null

  let minutes, seconds, milliseconds

  if (isStopped) {
    minutes = "00"
    seconds = Math.floor(currentTime)
    milliseconds = "00"
  } else {
    // recording or playback
    if (asc) {
      minutes = Math.floor(currentTime / 60)
      seconds = Math.floor(Math.round(currentTime) % 60)
      milliseconds = currentTime % 1000
    } else {
      minutes = Math.floor((maxLength - Math.round(currentTime)) / 60)
      seconds = Math.floor((maxLength - Math.round(currentTime)) % 60)
      milliseconds = (maxLength - currentTime) % 1000
    }
  }

  return {
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
    milliseconds: milliseconds.toString().padStart(3, "0"),
  }
}

export const getAudioProgressPercent = ({
  currentTime,
  recorderState,
  maxLength,
  recordedFileDuration,
}: Pick<TInnerState, "recorderState" | "currentTime" | "recordedFileDuration"> &
  Required<Pick<UseAudioRecordingProps, "maxLength">>): number => {
  const { isIdle, isRecording } = getAudioRecorderStatusBooleans(
    recorderState.status
  )

  if (isIdle) return 0

  if (isRecording) {
    // State: recording
    return (Math.floor(currentTime) / maxLength) * 100
  }

  // State: idle, playback or stopped
  return (Math.round(currentTime) / Math.round(recordedFileDuration ?? 1)) * 100
}

export const getSupportedMIMEType = () => {
  const supportedMIMETypes: TSupportedMIMETypes = []

  mimeTypes.reduce((supported, type) => {
    if (MediaRecorder.isTypeSupported(type)) {
      supported.push(type)
    }

    return supported
  }, supportedMIMETypes)

  if (!supportedMIMETypes[0])
    throw Error(
      "Failed to select supported MIME type at getSupportedMIMETypes: no supported MIME types found."
    )

  const selectedMIMEType = supportedMIMETypes[0]

  return selectedMIMEType
}
