import { Button } from "@/components/ui/button"
import { CircleStop, Mic, Play, RotateCcw } from "lucide-react"

import { cn, getAudioRecorderStatusBooleans } from "@/lib/utils"
import {
  useAudioRecording,
  type UseAudioRecordingProps,
} from "@/lib/hooks/use-audio-recording"

import { type HTMLAttributes } from "react"

interface AudioRecorderProps
  extends UseAudioRecordingProps,
    Pick<HTMLAttributes<HTMLDivElement>, "className"> {}

type AudioRecorderAPI = ReturnType<typeof useAudioRecording>

export function AudioRecorder({
  autoRecord,
  maxLength,
  onRecordFinish,
  className,
}: AudioRecorderProps) {
  const {
    recorderState,
    recordedFile,
    timeCount,
    audioProgressPercent,
    startRecording,
    stopRecording,
    startPlaying,
    stopPlaying,
    resetRecording,
  } = useAudioRecording({
    autoRecord,
    maxLength,
    onRecordFinish,
  })

  return (
    <div className={cn("w-full max-w-[600px]", className)}>
      <div className="flex w-full items-center gap-2 lg:gap-3">
        <AudioControlButton
          recorderState={recorderState}
          recordedFile={recordedFile}
          startRecording={startRecording}
          stopRecording={stopRecording}
          startPlaying={startPlaying}
          stopPlaying={stopPlaying}
          resetRecording={!autoRecord ? resetRecording : null}
        />
        <ProgressBar audioProgressPercent={audioProgressPercent} />
        <AudioTimer timeCount={timeCount} />
      </div>
      {recorderState.status === "error" && (
        <p className="mx-auto mt-2 text-xs text-red-300">
          {recorderState.message}
        </p>
      )}
    </div>
  )
}

type AudioControlButtonBaseProps = Pick<
  AudioRecorderAPI,
  "recorderState" | "recordedFile"
> & {
  resetRecording: AudioRecorderAPI["resetRecording"] | null
}

const AudioControlButton = ({
  recorderState,
  recordedFile,
  resetRecording,
  startRecording,
  stopRecording,
  startPlaying,
  stopPlaying,
}: AudioControlButtonBaseProps &
  Pick<
    Parameters<typeof RecordOrStopButton>["0"],
    "startRecording" | "stopRecording"
  > &
  Pick<
    Parameters<typeof PlayOrStopButton>["0"],
    "startPlaying" | "stopPlaying"
  >) => {
  if (!recordedFile)
    return (
      <RecordOrStopButton
        recorderState={recorderState}
        startRecording={startRecording}
        stopRecording={stopRecording}
      />
    )

  return (
    <div className="flex items-center gap-1">
      <PlayOrStopButton
        recorderState={recorderState}
        startPlaying={startPlaying}
        stopPlaying={stopPlaying}
      />
      {!!resetRecording && (
        <Button
          variant="ghost"
          onClick={resetRecording}
          disabled={recorderState.status !== "stopped"}
          className="size-12 shrink-0 rounded-full p-0 text-zinc-400 hover:text-white [&_svg]:size-6"
        >
          <RotateCcw />
        </Button>
      )}
    </div>
  )
}

const RecordOrStopButton = ({
  recorderState,
  startRecording,
  stopRecording,
}: Pick<
  AudioRecorderAPI,
  "recorderState" | "startRecording" | "stopRecording"
>) => {
  const { isRecording, isError } = getAudioRecorderStatusBooleans(
    recorderState.status
  )
  const toggleRecordAudio = async () =>
    isRecording ? stopRecording() : startRecording()

  return (
    <Button
      variant="outline"
      onClick={toggleRecordAudio}
      disabled={isError}
      className="size-12 shrink-0 rounded-full p-0 [&_svg]:size-6"
    >
      {isRecording ? (
        <CircleStop strokeWidth={1.5} />
      ) : (
        <Mic strokeWidth={1.5} />
      )}
    </Button>
  )
}

const PlayOrStopButton = ({
  recorderState,
  startPlaying,
  stopPlaying,
}: Pick<
  AudioRecorderAPI,
  "recorderState" | "startPlaying" | "stopPlaying"
>) => {
  const { isPlaying } = getAudioRecorderStatusBooleans(recorderState.status)

  return (
    <Button
      variant="outline"
      onClick={async () => {
        if (isPlaying) {
          stopPlaying()
        } else {
          await startPlaying()
        }
      }}
      className="size-12 shrink-0 rounded-full p-0 [&_svg]:size-6"
    >
      {isPlaying ? (
        <CircleStop strokeWidth={1.5} />
      ) : (
        <Play strokeWidth={1.5} />
      )}
    </Button>
  )
}

const ProgressBar = ({
  audioProgressPercent,
}: Pick<AudioRecorderAPI, "audioProgressPercent">) => {
  return (
    <div className="bg-foreground/15 relative h-2 w-full rounded-full">
      <div
        style={{
          background: `linear-gradient(to right, rgb(239, 68, 68) ${
            audioProgressPercent ?? 0
          }%, transparent 0%)`,
        }}
        className="absolute top-0 left-0 h-2 w-full rounded-full"
      />
    </div>
  )
}

const AudioTimer = ({ timeCount }: Pick<AudioRecorderAPI, "timeCount">) => {
  if (!timeCount) return
  const { minutes, seconds } = timeCount
  return (
    <p className="text-xl">
      {minutes}:{seconds}
    </p>
  )
}
