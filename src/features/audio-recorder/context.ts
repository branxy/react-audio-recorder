import type { TSupportedMIMETypes } from "@/types"
import type { Mime } from "mime"
import { createContext, type Dispatch, type SetStateAction } from "react"

export type TUserAudioSetup = {
  mediaStream: MediaStream
  selectedMIMEType: TSupportedMIMETypes[number]
  selectedExtension: NonNullable<ReturnType<Mime["getExtension"]>>
  setUserAudioSetup: Dispatch<SetStateAction<TUserAudioSetup>>
} | null

export const UserAudioSetupContext = createContext<TUserAudioSetup>(null)
