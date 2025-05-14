import type { Stages } from "@/demo"
import type { TUserAudioSetup } from "@/features/audio-recorder/context"
import { getLocalStream, getSupportedMIMEType } from "@/lib/utils"

import { useEffect, useState } from "react"

export const useSetupAudioRecording = (stage: Stages) => {
  const [userAudioSetup, setUserAudioSetup] = useState<TUserAudioSetup>(null)

  useEffect(() => {
    let ignore = false

    const setupAudio = async () => {
      const selectedMIMEType = getSupportedMIMEType()

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
