<template>
  <div class="page-content">
    <div class="paper-content">
      <div class="content-grid">
        <!-- 评分区域 -->
        <div class="scoring-area">
          <div class="area-card">
            <scoring-section
              :llm-score="llmScore"
              :max-score="maxScore"
              @score-change="handleScoreChange"
            />
          </div>
        </div>

        <!-- 操作区域 -->
        <div class="action-area">
          <div class="area-card">
            <action-section
              @start-grading="handleStartGrading"
              @batch-grading="handleBatchGrading"
            />
          </div>
        </div>

        <!-- 预览区域 -->
        <div class="preview-area">
          <div class="area-card">
            <highlight-toolbar
              :has-selected-text="hasSelectedText"
              @highlight-mode-change="handleHighlightModeChange"
              @mark-answer="handleMarkAnswer"
            />
            <paper-preview
              :highlight-mode="highlightMode"
              @text-selected="handleTextSelected"
              @mark-answer="handleMarkAnswer"
            >
              <template #preview>
                <slot name="preview" />
              </template>
            </paper-preview>
          </div>
        </div>

        <!-- 反馈区域 -->
        <div class="feedback-area">
          <div class="area-card">
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
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import ActionSection from './ActionSection.vue'
import FeedbackPanel from './FeedbackPanel.vue'
import HighlightToolbar from './HighlightToolbar.vue'
import PaperPreview from './PaperPreview.vue'
import ScoringSection from './ScoringSection.vue'

interface Props {
  paperInfo: {
    studentName: string
    studentId: string
  }
  llmScore?: number
  maxScore?: number
}

const props = withDefaults(defineProps<Props>(), {
  llmScore: 0,
  maxScore: 100
})

const emits = defineEmits<{
  (e: 'startGrading'): void
  (e: 'openSettings'): void
  (e: 'markAnswer', data: { text: string, type: 'correct' | 'wrong' | 'unclear' | 'redundant' }): void
  (e: 'scoreChange', data: { teacherScore: number, llmScore: number }): void
  (e: 'saveFeedback', feedback: string): void
}>()

// 高亮模式状态
const highlightMode = ref(false)
const hasSelectedText = ref(false)
const selectedHighlight = ref<{
  text: string
  type: 'correct' | 'wrong' | 'unclear' | 'redundant'
  reason?: string
  aiReason?: string
} | null>(null)

// 处理高亮模式变化
const handleHighlightModeChange = (mode: boolean) => {
  highlightMode.value = mode
}

// 处理文本选择
const handleTextSelected = (data: { text: string, hasSelection: boolean }) => {
  hasSelectedText.value = data.hasSelection
}

// 标记答案
const handleMarkAnswer = (data: { text: string, type: 'correct' | 'wrong' | 'unclear' | 'redundant' } | string) => {
  let markData: { text: string, type: 'correct' | 'wrong' | 'unclear' | 'redundant' }
  
  if (typeof data === 'string') {
    // 来自工具栏的标记，需要获取当前选中的文本
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim() || ''
    markData = { text: selectedText, type: data as 'correct' | 'wrong' | 'unclear' | 'redundant' }
  } else {
    markData = data
  }

  // 模拟 AI 给分理由
  const aiReasons = {
    correct: '该答案准确回答了问题的核心要点，逻辑清晰，表达规范。体现了学生对知识点的准确理解。',
    wrong: '该答案存在明显的概念错误或逻辑漏洞，与标准答案不符。需要进一步学习相关知识点。',
    unclear: '该答案的表述不够清晰明确，可能存在歧义或不完整的地方。建议进一步阐述或补充说明。',
    redundant: '该部分内容与题目要求不符或存在不必要的重复，应当删除或精简以提高答案质量。'
  }

  selectedHighlight.value = {
    text: markData.text,
    type: markData.type,
    aiReason: aiReasons[markData.type]
  }

  // 向父组件传递事件
  emits('markAnswer', markData)
}

const handleStartGrading = () => {
  emits('startGrading')
}

const handleBatchGrading = () => {
  ElMessage.success('开始批量评分')
  // TODO: 实现批量评分逻辑
}

// 处理评分变化
const handleScoreChange = (data: { teacherScore: number, llmScore: number }) => {
  emits('scoreChange', data)
}

// 处理 AI 理由相关操作
const handleModifyReason = (data: any) => {
  console.log('修改理由:', data)
  ElMessage.info('可在右侧文本框中编辑理由')
}

const handleSaveReason = (data: any) => {
  console.log('保存理由:', data)
  ElMessage.success('理由已保存到本地')
  // TODO: 实现保存理由到本地存储的逻辑
}

const handleSubmitReason = (data: any) => {
  console.log('提交理由:', data)
  ElMessage.success('理由已提交到服务器')
  // TODO: 实现提交理由到服务器的逻辑
}
</script>

<style scoped>
.page-content {
  border-radius: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.paper-content {
  background: #ffffff;
  width: 100%;
}

.paper-content :deep(.el-card__body) {
  padding: 0;
}

/* === 网格布局 === */
.content-grid {
  display: grid;
  grid-template-columns: 7fr 3fr;
  grid-template-rows: auto 1fr;
  gap: 12px;
  height: 70vh;
  padding: 12px;
}

/* === 网格区域 === */
.scoring-area { grid-area: 1 / 1; }
.action-area { grid-area: 1 / 2; }
.preview-area { grid-area: 2 / 1; }
.feedback-area { grid-area: 2 / 2; }

/* === 统一卡片样式 === */
.area-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 24px;
  padding: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* === 预览区域特殊样式 === */
.preview-area .area-card {
  padding: 0;
}

/* === 统一按钮圆角 === */
.page-content :deep(.el-button) {
  border-radius: 24px;
}

/* === 子组件样式重置 === */
.scoring-area :deep(.scoring-section),
.action-area :deep(.action-section),
.feedback-area :deep(.feedback-panel) {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

/* === 预览区域组件样式 === */
.preview-area :deep(.highlight-toolbar) {
  background: #f8f9fa;
  border: none;
  border-bottom: 1px solid #e9ecef;
  border-radius: 24px 24px 0 0;
  margin: 0;
  padding: 10px 15px;
}

.preview-area :deep(.paper-preview) {
  background: #f8f9fa;
  border: none;
  border-radius: 0 0 24px 24px;
  margin: 0;
  flex: 1;
  padding: 20px;
}

/* === 响应式设计 === */
@media (max-width: 1080px) {
  .content-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, auto);
    height: auto;
  }
  
  .scoring-area { grid-area: 1; }
  .action-area { grid-area: 2; }
  .preview-area { grid-area: 3; }
  .feedback-area { grid-area: 4; }
  
  .preview-area,
  .feedback-area {
    min-height: 300px;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 8px;
    margin-top: 8px;
  }
  
  .content-grid {
    gap: 8px;
  }
  
  .area-card {
    padding: 8px;
  }
  
  .preview-area .area-card {
    padding: 0;
  }
  
  .preview-area :deep(.highlight-toolbar) {
    padding: 8px 12px;
  }
  
  .preview-area :deep(.paper-preview) {
    padding: 15px;
  }
}
</style>