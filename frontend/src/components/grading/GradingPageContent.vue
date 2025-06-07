<template>
  <div class="page-content">
    <div class="content-grid">
      <!-- 第一行：评分区域 7:3 -->
      <div class="scoring-area">
        <div class="area-card">
          <scoring-section
            :llm-score="currentLLMScore"
            :max-score="maxScore"
            @score-change="handleScoreChange"
          />
        </div>
      </div>

      <div class="action-area">
        <div class="area-card">
          <action-section
            @start-grading="handleStartGrading"
            @batch-grading="handleBatchGrading"
          />
        </div>
      </div>

      <!-- 第二行：预览、参考答案、反馈 4:3:3 -->
      <div class="preview-area">
        <div class="area-card">
          <highlight-toolbar
            :has-selected-text="hasSelectedText"
            @highlight-mode-change="handleHighlightModeChange"
            @mark-answer="handleMarkAnswer"
            @erase-marks="handleEraseMarks"
            @clear-all="handleClearAll"
          />
          <paper-preview
            :highlight-mode="highlightMode"
            :student-answer="props.studentAnswer"
            :highlight-data="props.highlightData"
            @text-selected="handleTextSelected"
            @mark-answer="handleMarkAnswer"
            @highlight-clicked="handleHighlightClicked"
          >
            <template #preview>
              <slot name="preview" />
            </template>
          </paper-preview>
        </div>
      </div>

      <div class="reference-area">
        <div class="area-card">
          <div class="reference-header">
            <h3>Reference Answer</h3>
          </div>
          <reference-answer :reference-answer="props.referenceAnswer" />
        </div>
      </div>

      <div class="feedback-area">
        <div class="area-card">
          <div class="feedback-header">
            <h3>Score Reason</h3>
          </div>
          <feedback-panel
            :selected-highlight="selectedHighlight"
            @modify-reason="handleModifyReason"
            @save-reason="handleSaveReason"
            @submit-reason="handleSubmitReason"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import ActionSection from './ActionSection.vue'
import FeedbackPanel from './FeedbackPanel.vue'
import HighlightToolbar from './HighlightToolbar.vue'
import PaperPreview from './PaperPreview.vue'
import ReferenceAnswer from './ReferenceAnswer.vue'
import ScoringSection from './ScoringSection.vue'

// 高亮数据类型定义
interface HighlightItem {
  'Student answer': string
  'Scoring point': number
  reason: string
}

interface HighlightData {
  student_id: number
  question_id: number
  answer: {
    correct: HighlightItem[]
    wrong: HighlightItem[]
    unclear: HighlightItem[]
    redundant: HighlightItem[]
  }
  total_score: number
}

interface SelectedHighlight {
  text: string
  type: 'correct' | 'wrong' | 'unclear' | 'redundant'
  reason: string
  scoringPoint: number
}

interface Props {
  paperInfo: {
    studentId?: number
  }
  llmScore?: number
  maxScore?: number
  studentAnswer?: string
  highlightData?: HighlightData | null
  referenceAnswer?: string
}

const props = withDefaults(defineProps<Props>(), {
  llmScore: 0,
  maxScore: 100,
  studentAnswer: '',
  highlightData: null,
  referenceAnswer: ''
})

const emits = defineEmits<{
  (e: 'startGrading'): void
  (e: 'markAnswer', data: { text: string, type: 'correct' | 'wrong' | 'unclear' | 'redundant' }): void
  (e: 'scoreChange', data: { teacherScore: number, llmScore: number }): void
  (e: 'eraseMarks'): void
  (e: 'clearAll'): void
}>()

// 计算当前LLM分数 - 优先使用高亮数据中的分数
const currentLLMScore = computed(() => {
  return props.highlightData?.total_score || props.llmScore || 0
})

// 状态
const highlightMode = ref(false)
const hasSelectedText = ref(false)
const selectedHighlight = ref<{
  text: string
  type: 'correct' | 'wrong' | 'unclear' | 'redundant'
  reason?: string
  aiReason?: string
} | null>(null)

// 事件处理
const handleHighlightModeChange = (mode: boolean) => {
  highlightMode.value = mode
}

const handleTextSelected = (data: { text: string, hasSelection: boolean }) => {
  hasSelectedText.value = data.hasSelection
}

// 处理高亮点击事件 - 转换类型名称
const handleHighlightClicked = (data: SelectedHighlight) => {
  // 转换类型映射以适配FeedbackPanel
  const typeMapping = {
    'unclear': 'unclear' as const,
    'redundant': 'redundant' as const,
    'correct': 'correct' as const,
    'wrong': 'wrong' as const
  }

  selectedHighlight.value = {
    text: data.text,
    type: typeMapping[data.type],
    aiReason: data.reason
  }
  
  ElMessage.info(`查看高亮内容：${data.text.substring(0, 30)}...`)
}

const handleMarkAnswer = (data: { text: string, type: 'correct' | 'wrong' | 'unclear' | 'redundant' } | string) => {
  let markData: { text: string, type: 'correct' | 'wrong' | 'unclear' | 'redundant' }
  
  if (typeof data === 'string') {
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim() || ''
    markData = { text: selectedText, type: data as 'correct' | 'wrong' | 'unclear' | 'redundant' }
  } else {
    markData = data
  }

  const aiReasons = {
    correct: `该答案准确回答了问题的核心要点，逻辑清晰，表达规范。`,
    wrong: '该答案存在明显的概念错误或逻辑漏洞，与标准答案不符。',
    unclear: '该答案的表述不够清晰明确，可能存在歧义或不完整的地方。',
    redundant: '该部分内容与题目要求不符或存在不必要的重复。'
  }

  selectedHighlight.value = {
    text: markData.text,
    type: markData.type,
    aiReason: aiReasons[markData.type]
  }

  emits('markAnswer', markData)
}

const handleStartGrading = () => {
  emits('startGrading')
}

const handleBatchGrading = () => {
  ElMessage.success('开始批量评分')
}

const handleScoreChange = (data: { teacherScore: number, llmScore: number }) => {
  emits('scoreChange', data)
}

const handleModifyReason = (data: any) => {
  ElMessage.info('可在文本框中编辑理由')
}

const handleSaveReason = (data: any) => {
  ElMessage.success('理由已保存到本地')
}

const handleSubmitReason = (data: any) => {
  ElMessage.success('理由已提交，将重新请求AI评分')
}

const handleEraseMarks = () => {
  emits('eraseMarks')
  ElMessage.info('已清除选中文本的标记')
}

const handleClearAll = () => {
  emits('clearAll')
  ElMessage.warning('已清除所有标记')
}
</script>

<style scoped>
.page-content {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E5E5;
  overflow: hidden;
  background: #FFFFFF;
}

/* 网格布局 */
.content-grid {
  display: grid;
  grid-template-areas: 
    "scoring scoring scoring scoring scoring scoring scoring action action action"
    "preview preview preview preview reference reference reference feedback feedback feedback";
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: 80px 1fr;
  gap: 16px;
  height: 85vh;
  padding: 16px;
}

/* 网格区域分配 */
.scoring-area { grid-area: scoring; }
.action-area { grid-area: action; }
.preview-area { grid-area: preview; }
.reference-area { grid-area: reference; }
.feedback-area { grid-area: feedback; }

/* 卡片样式 */
.area-card {
  background: #F5F5F5;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  transition: all 0.2s ease;
}

.area-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 预览和参考答案区域特殊样式 */
.preview-area .area-card,
.reference-area .area-card {
  background: #FFFFFF;
}

/* 确保内容区域可以滚动 */
.preview-area,
.reference-area,
.feedback-area {
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.preview-area .area-card,
.reference-area .area-card,
.feedback-area .area-card {
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 子组件样式重置 */
.scoring-area :deep(.scoring-section),
.action-area :deep(.action-section) {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.feedback-area :deep(.feedback-panel) {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  flex: 1;
  border-radius: 0 0 12px 12px;
  overflow-y: auto;
  min-height: 0;
}

.preview-area :deep(.highlight-toolbar) {
  background: #F5F5F5;
  height: 56px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #E5E5E5;
  flex-shrink: 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.preview-area :deep(.paper-preview) {
  background: #ffffff;
  flex: 1;
  color: rgba(0, 0, 0, 0.87);
  overflow-y: auto;
  min-height: 0;
}

.reference-area :deep(.reference-answer) {
  background: #ffffff;
  flex: 1;
  color: rgba(0, 0, 0, 0.87);
  overflow-y: auto;
  min-height: 0;
}

/* 头部样式 */
.reference-header,
.feedback-header {
  padding: 16px 20px;
  background: #F5F5F5;
  border-bottom: 1px solid #E5E5E5;
  height: 56px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.reference-header h3,
.feedback-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

/* 统一滚动条样式 */
.content-grid :deep(*)::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.content-grid :deep(*)::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 2px;
}

.content-grid :deep(*)::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  transition: background 0.2s ease;
}

.content-grid :deep(*)::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.content-grid :deep(*)::-webkit-scrollbar-corner {
  background: rgba(0, 0, 0, 0.03);
}

/* Firefox 滚动条样式 */
.content-grid :deep(*) {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.03);
}

/* 响应式设计 */
@media (max-width: 1080px) {
  .content-grid {
    grid-template-areas:
      "scoring"
      "action"
      "preview"
      "reference"
      "feedback";
    grid-template-columns: 1fr;
    grid-template-rows: 80px 80px 1fr 1fr 1fr;
    gap: 12px;
    height: 90vh;
  }
}

@media (max-width: 768px) {
  .content-grid {
    padding: 12px;
    gap: 8px;
    grid-template-rows: 70px 70px 1fr 1fr 1fr;
    height: 95vh;
  }
  
  .preview-area :deep(.highlight-toolbar) {
    padding: 8px 12px;
    height: 48px;
    overflow-x: auto;
    overflow-y: hidden;
  }
}
</style>