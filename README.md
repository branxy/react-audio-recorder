# React Audio Recorder

Компонент записи и воспроизведения звука в React.

## Установка

1. Копировать репозиторий

```bash
npx degit branxy/react-audio-recorder myProjectFolderName
```

2. Установить зависимости

```bash
npm i
```

3. Запуск

```bash
npm run dev
```

## Использование

Ветка `main` - базовое демо.  
Ветка `multi-step` - демо переиспользуемого компонента.

Разница только в обработке mediaStream: в базовом демо он подчищается сразу после записи внутри `use-audio-recording.ts` (однократное использование), в `multi-step` он произвольно подчищается снаружи компонента по клику на кнопку "See results".

1. Для старта, добавьте компонент `<AudioRecorder />` и пропишите ему необходимые пропсы:

```tsx
<AudioRecorder
  autoRecord
  maxLength={20}
  onRecordFinish={(file) => console.log(file)}
  className="mt-12"
/>
```

```ts
interface AudioRecorderProps {
  autoRecord?: boolean
  maxLength?: number
  onRecordFinish?: (recordedFile: File) => void
  className?: string
}
```

1. Добавьте хук `useSetupAudioRecording`: если требуется однократная запись звука, можно перенести этот хук внутрь `use-audio-recording` вместо `useContext` и удалить `<UserAudioSetupContext.Provider />`:

```diff
export const useAudioRecording = ({
  autoRecord,
  maxLength = MAX_RECORDING_LENGTH,
  onRecordFinish,
}: UseAudioRecordingProps) => {
  // ...
- const userAudioSetup = useContext(UserAudioSetupContext)
+ const userAudioSetup = useSetupAudioRecording()
}
```

Если `<AudioRecorder />` потребуется больше одного раза на странице, то выберите, где расположить хук и `<UserAudioSetupContext.Provider />`, чтобы контекст был доступен всем компонентам `<AudioRecorder />` на странице.
