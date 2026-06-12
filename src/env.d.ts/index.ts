// 声明浏览器语音识别 API 的类型
interface SpeechRecognitionEvent extends Event {
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      [index: number]: { transcript: string }
    }
  }
}

// 声明全局变量，这样 TS 不会报错
declare const webkitSpeechRecognition: {
  new (): {
    lang: string
    continuous: boolean
    interimResults: boolean
    start(): void
    stop(): void
    onresult: ((e: SpeechRecognitionEvent) => void) | null
    onerror: ((e: { error: string }) => void) | null
    onend: (() => void) | null
  }
}