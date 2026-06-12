<template>
  <div class="home-container">
    <div class="home-header">
      <h1>欢迎来到语音绘画！</h1>
      <p>在这里，你可以通过语音输入来创作属于你的艺术作品。</p>
    </div>
    <div class="home-content">
      <div class="button-container">
        <el-button type="primary" size="large" :disabled="speeching" @click="startSpeech">
          开始语音输入
        </el-button>
        <el-button type="danger" size="large" :disabled="!speeching" @click="endSpeech">
          结束语音输入
        </el-button>
        <!-- 清除画布按钮 -->
        <el-button @click="clearCanvas">清除画布</el-button>
      </div>
      <canvas ref="canvasRef" class="painting-result">
        <template v-if="speeching">
          <div class="result-inner">
            <el-icon class="recording-icon" :size="32"><Microphone /></el-icon>
            <p>{{ speechStartText }}</p>
          </div>
        </template>
        <template v-else-if="speechEndText">
          <div class="result-inner">
            <el-icon :size="32" color="#409eff"><Loading /></el-icon>
            <p>{{ speechEndText }}</p>
            <!-- 显示语音识别出的文字 -->
            <p>识别结果：{{ recognizedText }}</p>
          </div>
        </template>
        <template v-else>
          <div class="result-inner">
            <el-icon :size="48" color="#c0c4cc"><PictureFilled /></el-icon>
            <p class="hint-text">点击上方按钮开始你的创作之旅吧！</p>
          </div>
        </template>
      </canvas>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { Microphone, Loading, PictureFilled } from '@element-plus/icons-vue'

const speechStartText = ref('')
const speechEndText = ref('')
// 语音输入状态
const speeching = ref(false)
const recognizedText = ref('') // 识别出的文字
const canvasRef = ref<HTMLCanvasElement | null>(null) // 画布引用
let ctx: CanvasRenderingContext2D | null = null // 画布上下文
let recognition: ReturnType<typeof webkitSpeechRecognition> | null = null // 语音识别实例
//开始语音输入
const startSpeech = () => {
  speeching.value = true
  speechStartText.value = '语音正在输入...'
  speechEndText.value = ''
  // 1. 创建语音识别实例
  recognition = new webkitSpeechRecognition()

  // 2. 配置参数
  recognition.lang = 'zh-CN' // 中文
  recognition.continuous = true // 持续识别
  recognition.interimResults = true // 返回中间结果

  // 3. 监听识别结果
  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let finalText = '' // 最终确认的文字
    let interimText = '' // 正在识别中的文字

    // 遍历所有识别结果
    for (let i = 0; i < event.results.length; i++) {
      const result = event.results[i]
      const transcript = result[0].transcript // 识别出的文字

      if (result.isFinal) {
        // isFinal = true 表示用户说完了，这段文字是确定的
        finalText += transcript
      } else {
        // isFinal = false 表示用户还在说，文字可能还会变
        interimText += transcript
      }
    }

    // 实时显示正在识别的文字
    recognizedText.value = interimText || finalText

    // 如果有最终结果，送去解析绘图
    if (finalText) {
      parseAndDraw(finalText)
    }
  }

  // 4. 错误处理
  recognition.onerror = (event) => {
    console.error('语音识别出错:', event.error)
    if (event.error === 'not-allowed') {
      recognizedText.value = '请允许浏览器使用麦克风'
    }
    speeching.value = false
  }

  // 5. 识别意外结束时自动重启
  recognition.onend = () => {
    if (speeching.value) {
      recognition!.start() // 还在录音状态就重启
    }
  }

  // 6. 开始识别
  recognition.start()
}
// 结束语音输入
const endSpeech = () => {
  speeching.value = false
  speechEndText.value = '语音输入结束，正在绘画中，请等待...'
}
// 清除画布
const clearCanvas = () => {
  speechEndText.value = ''
  recognizedText.value = ''
}
onMounted(() => {
  // 拿到 canvas 元素
  const canvas = canvasRef.value!
  // 获取 2D 绘图上下文
  ctx = canvas.getContext('2d')!
  // // 画白色背景
  // ctx.fillStyle = '#ffffff'
  // ctx.fillRect(0, 0, 600, 400)
})
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.home-header {
  text-align: center;
  margin-bottom: 32px;
}

.home-header h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
}

.home-header p {
  color: #909399;
  font-size: 15px;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.painting-result {
  height: 400px;
  background-color: #fafafa;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.result-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #606266;
  font-size: 15px;
}

.recording-icon {
  color: #f56c6c;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.hint-text {
  color: #c0c4cc;
  font-size: 14px;
}
</style>
