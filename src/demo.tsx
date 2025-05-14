import { AudioRecorder } from "@/features/audio-recorder/audio-recorder"
import { Button } from "@/components/ui/button"

import { useSetupAudioRecording } from "@/lib/hooks/use-setup-audio-recording"

import { UserAudioSetupContext } from "@/features/audio-recorder/context"

import { use, useState, type ReactNode } from "react"

export type Stages = "intro" | "recording" | "results"

export const Demo = () => {
  const [stage, setStage] = useState<Stages>("intro")
  const userAudioSetup = useSetupAudioRecording(stage)

  const ui: Record<Stages, ReactNode> = {
    intro: <Intro setStage={setStage} />,
    recording: <AudioRecordingStage setStage={setStage} />,
    results: <ResultStage setStage={setStage} />,
  }

  return (
    <UserAudioSetupContext value={userAudioSetup}>
      {ui[stage]}
    </UserAudioSetupContext>
  )
}

const Intro = ({
  setStage,
}: {
  setStage: React.Dispatch<React.SetStateAction<Stages>>
}) => {
  const userAudioSetup = use(UserAudioSetupContext)

  return (
    <Button
      onClick={() => setStage("recording")}
      disabled={!userAudioSetup}
      className="mt-12"
    >
      Start test
    </Button>
  )
}

const AudioRecordingStage = ({
  setStage,
}: {
  setStage: React.Dispatch<React.SetStateAction<Stages>>
}) => {
  const userAudioSetup = use(UserAudioSetupContext)
  const [isFinished, setIsFinished] = useState(false)

  if (!userAudioSetup || !userAudioSetup.mediaStream.active)
    return (
      <p className="mt-14 text-red-400 font-bold">
        Failed to connect to microphone.
      </p>
    )

  return (
    <>
      <AudioRecorder
        autoRecord
        onRecordFinish={(file) => {
          setIsFinished(true)
          return URL.createObjectURL(file)
        }}
        className="mt-14"
      />
      {isFinished && (
        <Button
          onClick={() => {
            const { mediaStream } = userAudioSetup
            mediaStream.getTracks().forEach((t) => t.stop())
            setStage("results")
          }}
        >
          See results
        </Button>
      )}
    </>
  )
}

const ResultStage = ({
  setStage,
}: {
  setStage: React.Dispatch<React.SetStateAction<Stages>>
}) => {
  const userAudioSetup = use(UserAudioSetupContext)

  return (
    <>
      <p className="mt-8">You've scored 3/10.</p>
      <Button
        onClick={() => {
          if (!userAudioSetup)
            throw Error("userAudioSetup is nullish at ResultStage onClick.")
          setStage("intro")
          userAudioSetup.setUserAudioSetup(null)
        }}
        className="mt-4"
      >
        Try again
      </Button>
    </>
  )
}
