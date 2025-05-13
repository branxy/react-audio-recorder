import type { TSupportedMIMETypes } from "@/types"
import { createContext, type Dispatch, type SetStateAction } from "react"

export type TUserAudioSetup = {
  mediaStream: MediaStream
  selectedMIMEType: TSupportedMIMETypes[number]
  setUserAudioSetup: Dispatch<SetStateAction<TUserAudioSetup>>
} | null

export const UserAudioSetupContext = createContext<TUserAudioSetup>(null)
