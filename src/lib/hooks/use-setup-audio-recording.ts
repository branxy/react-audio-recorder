import type { Stages } from "@/demo"
import type { TUserAudioSetup } from "@/features/audio-recorder/context"
import { getLocalStream, getSupportedMIMEType } from "@/lib/utils"

import mime from "mime/lite"

import { useEffect, useState } from "react"

export const useSetupAudioRecording = (stage: Stages) => {
  const [userAudioSetup, setUserAudioSetup] = useState<TUserAudioSetup>(null)

  useEffect(() => {
    let ignore = false

    const setupAudio = async () => {
      const selectedMIMEType = getSupportedMIMEType()

      const selectedExtension = mime.getExtension(selectedMIMEType)

      if (!selectedExtension)
        throw Error(
          "Failed to select a file extension at setupAudio: extension not found.",
          { cause: selectedExtension }
        )

      const mediaStream = await getLocalStream()
      setUserAudioSetup({
        mediaStream,
        selectedMIMEType,
        selectedExtension,
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
