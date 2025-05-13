import type { Stages } from "@/demo"
import type { TUserAudioSetup } from "@/features/audio-recorder/context"
import { getSupportedMIMETypes, selectMIMEType } from "@/lib/utils"

import { useEffect, useState } from "react"

export const useSetupAudioRecording = (stage: Stages) => {
  const [userAudioSetup, setUserAudioSetup] = useState<TUserAudioSetup>(null)

  useEffect(() => {
    let ignore = false

    const getLocalStream = async () => {
      if (!navigator?.mediaDevices?.getUserMedia)
        throw new Error(
          "Failed to get access to microphone: getUserMedia is not supported in your browser"
        )

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        return stream
      } catch (error) {
        if (error instanceof Error) {
          throw Error(
            `Failed to get access to microphone at getLocalStream: ${error.message}`,
            { cause: error }
          )
        } else {
          console.error(error)
          throw Error(
            "Failed to get access to microphone at getLocalStream: unexpected error."
          )
        }
      }
    }

    const setupAudio = async () => {
      const supportedMIMETypes = getSupportedMIMETypes()
      const selectedMIMEType = selectMIMEType(supportedMIMETypes)

      const stream = await getLocalStream()
      setUserAudioSetup({
        mediaStream: stream,
        selectedMIMEType,
        setUserAudioSetup,
      })
    }

    if (!ignore && stage === "intro" && !userAudioSetup) {
      setupAudio()
    }

    return () => {
      ignore = true
    }
  }, [stage, userAudioSetup])

  return userAudioSetup
}
