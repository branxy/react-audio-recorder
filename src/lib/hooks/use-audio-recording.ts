import {
  getRecordingCurrentTime,
  getAudioProgressPercent,
  getAudioRecorderStatusBooleans,
} from "@/lib/utils"
import { UserAudioSetupContext } from "@/features/audio-recorder/context"

import { useCallback, useContext, useEffect, useRef, useState } from "react"

export interface UseAudioRecordingProps {
  autoRecord?: boolean
  maxLength?: number
  onRecordFinish?: (recordedFile: File) => void
}

export type TInnerState = {
  recorderState: TRecorderState
  recordedFile: File | null
  recordedFileDuration: number | null
  currentTime: number
}

type TRecorderState =
  | {
      status: "idle"
    }
  | {
      status: "recording"
    }
  | {
      status: "playing"
    }
  | {
      status: "stopped"
    }
  | {
      status: "error"
      message: string
    }

const MAX_RECORDING_LENGTH = 10

export const useAudioRecording = ({
  autoRecord,
  maxLength = MAX_RECORDING_LENGTH,
  onRecordFinish,
}: UseAudioRecordingProps) => {
  // Recorder state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const userAudioSetup = useContext(UserAudioSetupContext)

  // Audio state
  const [recordedFile, setRecordedFile] =
    useState<TInnerState["recordedFile"]>(null)
  const [recordedFileDuration, setRecordedFileDuration] =
    useState<TInnerState["recordedFileDuration"]>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  // General state
  const [currentTime, setCurrentTime] = useState<TInnerState["currentTime"]>(0)
  const [recorderState, setRecorderState] = useState<TRecorderState>({
    status: "idle",
  })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const { isIdle, isRecording, isPlaying } = getAudioRecorderStatusBooleans(
    recorderState.status
  )

  // Debug info:
  // useEffect(() => {
  //   console.log({
  //     recorderState,
  //     userAudioSetup,
  //     mediaRecorderRef: mediaRecorderRef.current,
  //     recordedFile,
  //     audioElementRef: audioElementRef.current,
  //     currentTime,
  //     intervalRef: intervalRef.current,
  //   });
  // });

  const startRecording = useCallback(async () => {
    if (!window.MediaRecorder) {
      setRecorderState({
        status: "error",
        message: "Ваш браузер/устройство не поддерживает запись звука",
      })
      return
    }

    if (!userAudioSetup?.mediaStream)
      throw Error(
        `Failed to start recording at startRecording: mediaStream is nullish.`
      )

    mediaRecorderRef.current = new MediaRecorder(userAudioSetup.mediaStream)
    let chunks: Blob[] = []

    mediaRecorderRef.current.ondataavailable = (e) => {
      // Skip empty chunks
      if (!e.data.size) return

      chunks.push(e.data)
    }

    mediaRecorderRef.current.onstop = () => {
      if (!userAudioSetup)
        throw Error(
          "Failed to call mediaRecorderRef.current.onstop: selectedMIMEType is undefined."
        )

      if (!mediaRecorderRef.current)
        throw Error(
          "Failed to stop recording at mediaRecorderRef.current.onstop: mediaRecorderRef is nullish"
        )

      const fileName = `${crypto.randomUUID()}.${
        userAudioSetup.selectedExtension
      }`

      const file = new File(chunks, fileName, {
        type: userAudioSetup.selectedMIMEType,
      })
      chunks = []

      const newAudioURL = URL.createObjectURL(file)
      setRecordedFile(file)

      audioElementRef.current = new Audio(newAudioURL)
      const audio = audioElementRef.current as HTMLAudioElement
      audio.onerror = (e) => console.error(e)

      if (onRecordFinish) onRecordFinish(file)
    }

    mediaRecorderRef.current.onerror = (e) => {
      throw Error(`Error by MediaRecorder: ${e.message}`, { cause: e })
    }

    mediaRecorderRef.current.start()
    setRecorderState({ status: "recording" })
  }, [onRecordFinish, userAudioSetup])

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current)
      throw Error(
        "Failed to stop recording at stopRecording: mediaRecorderRef is nullish."
      )

    mediaRecorderRef.current.stop()

    // Don't move setDuration inside mediaRecorder.onstop() callback
    // because it creates a closure on currentTime with initial value 0. Has to stay in outside scope.
    setRecordedFileDuration(currentTime)
    setRecorderState({ status: "stopped" })
  }, [currentTime])

  // Auto-stop effect
  useEffect(() => {
    const isRecordingTimeLimitReached = !!maxLength && currentTime >= maxLength

    if (isRecording && isRecordingTimeLimitReached) {
      stopRecording()
    }
  }, [currentTime, isRecording, maxLength, stopRecording])

  // Auto-record effect
  useEffect(() => {
    let ignore = false
    if (!ignore && isIdle && autoRecord) startRecording()

    return () => {
      ignore = true
    }
  }, [autoRecord, isIdle, startRecording])

  const stopPlaying = useCallback(() => {
    if (!audioElementRef.current)
      throw new Error(
        "Failed to stop playing: audioElementRef.current is nullish"
      )

    audioElementRef.current.pause()
    audioElementRef.current.currentTime = 0

    setRecorderState({ status: "stopped" })
  }, [])

  const startPlaying = useCallback(async () => {
    if (!audioElementRef.current)
      throw new Error(
        "Failed to start playing: audioElementRef.current is nullish"
      )

    audioElementRef.current.onended = () => {
      stopPlaying()
    }

    await audioElementRef.current.play()
    setCurrentTime(0)
    setRecorderState({ status: "playing" })
  }, [stopPlaying])

  // Interval effect
  useEffect(() => {
    if (!isRecording && !isPlaying) return

    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => setCurrentTime((t) => t + 1), 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, isRecording])

  const resetRecording = useCallback(() => {
    setRecordedFile(null)
    setRecordedFileDuration(null)
    setCurrentTime(0)
    setRecorderState({ status: "idle" })

    if (audioElementRef.current) {
      URL.revokeObjectURL(audioElementRef.current.src)
    }
    audioElementRef.current = null
    mediaRecorderRef.current = null
  }, [])

  const audioProgressPercent = getAudioProgressPercent({
    recorderState,
    currentTime,
    maxLength,
    recordedFileDuration,
  })

  const timeCount = getRecordingCurrentTime({
    asc: !maxLength || isPlaying,
    recorderState,
    maxLength,
    currentTime,
  })

  return {
    recordedFile,
    audioProgressPercent,
    timeCount,
    recorderState,
    startRecording,
    stopRecording,
    startPlaying,
    stopPlaying,
    resetRecording,
  }
}
