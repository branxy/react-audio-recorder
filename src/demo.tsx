import { AudioRecorder } from "@/features/audio-recorder/audio-recorder"

import { useSetupAudioRecording } from "@/lib/hooks/use-setup-audio-recording"

import { UserAudioSetupContext } from "@/features/audio-recorder/context"

export const Demo = () => {
  const userAudioSetup = useSetupAudioRecording()

  return (
    <UserAudioSetupContext value={userAudioSetup}>
      <AudioRecorder className="mt-12" />
    </UserAudioSetupContext>
  )
}
