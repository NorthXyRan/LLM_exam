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

        <!-- 预览区域 - 新增高亮数据传递 -->
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

        <!-- 反馈区域 - 新增选中高亮数据传递 -->
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

// 新增：高亮数据类型定义
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
    ambiguous: HighlightItem[]
    abundant: HighlightItem[]
    'total score': number
  }
}

// 新增：选中高亮的数据类型
interface SelectedHighlight {
  text: string
  type: 'correct' | 'wrong' | 'ambiguous' | 'abundant'
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
  highlightData?: HighlightData | null // 新增：高亮数据
}

// 从父组件Grading接收的props - 新增highlightData
const props = withDefaults(defineProps<Props>(), {
  llmScore: 0,
  maxScore: 100,
  studentAnswer: '',
  highlightData: null // 新增
})

const emits = defineEmits<{
  (e: 'startGrading'): void
  (e: 'openSettings'): void
  (e: 'markAnswer', data: { text: string, type: 'correct' | 'wrong' | 'unclear' | 'redundant' }): void
  (e: 'scoreChange', data: { teacherScore: number, llmScore: number }): void
  (e: 'saveFeedback', feedback: string): void
  (e: 'eraseMarks'): void
  (e: 'clearAll'): void
}>()

// 高亮模式状态
const highlightMode = ref(false)
const hasSelectedText = ref(false)

// 修改：选中高亮的数据结构，适配FeedbackPanel的接口
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

// 新增：处理高亮点击事件
const handleHighlightClicked = (data: SelectedHighlight) => {
  // 转换类型映射以适配FeedbackPanel
  const typeMapping = {
    'ambiguous': 'unclear' as const,
    'abundant': 'redundant' as const,
    'correct': 'correct' as const,
    'wrong': 'wrong' as const
  }

  selectedHighlight.value = {
    text: data.text,
    type: typeMapping[data.type],
    aiReason: data.reason
  }
  
  ElMessage.info(`查看高亮内容：${data.text.substring(0, 30)}...`)
  console.log('高亮点击数据:', data)
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
    correct: `该答案准确回答了问题的核心要点，逻辑清晰，表达规范。体现了学生对知识点的准确理解。`,
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
  // TODO: 这里可以实现保存修改后的高亮数据到本地存储的逻辑
}

const handleSubmitReason = (data: any) => {
  console.log('提交理由:', data)
  ElMessage.success('理由已提交，将重新请求AI评分')
  // TODO: 这里可以实现调用大模型API重新评分的逻辑
  // 1. 构造新的prompt，告诉AI这个应该是正确/错误的
  // 2. 调用API获取新的理由
  // 3. 更新高亮数据
  // 4. 刷新显示
}

const handleEraseMarks = () => {
  // 清除选中文本的标记
  emits('eraseMarks')
  ElMessage.info('已清除选中文本的标记')
}

const handleClearAll = () => {
  // 清除所有标记
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

.paper-content {
  background: #FFFFFF;
  width: 100%;
}

.paper-content :deep(.el-card__body) {
  padding: 0;
}

/* === 网格布局 === */
.content-grid {
  display: grid;
  grid-template-columns: 7fr 3fr;
  grid-template-rows: 80px auto;
  gap: 16px;
  min-height: 60vh;
  padding: 16px;
  background: #FFFFFF;
}

/* === 网格区域 === */
.scoring-area { grid-area: 1 / 1; }
.action-area { grid-area: 1 / 2; }
.preview-area { grid-area: 2 / 1; }
.feedback-area { grid-area: 2 / 2; }

/* === 统一卡片样式 === */
.area-card {
  background: #F5F5F5;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  padding: 0px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.2s ease;
}

.area-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* === 预览区域特殊样式 === */
.preview-area .area-card {
  padding: 0;
  background: #FFFFFF;
}

/* === 统一按钮圆角 === */
.page-content :deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.page-content :deep(.el-button--primary) {
  background: #007AFF;
  border-color: #007AFF;
}

.page-content :deep(.el-button--primary:hover) {
  background: #0056B3;
  border-color: #0056B3;
}

.page-content :deep(.el-button--success) {
  background: #4CD964;
  border-color: #4CD964;
}

.page-content :deep(.el-button--success:hover) {
  background: #3AC85A;
  border-color: #3AC85A;
}

.page-content :deep(.el-button--warning) {
  background: #FF9500;
  border-color: #FF9500;
}

.page-content :deep(.el-button--warning:hover) {
  background: #E6850E;
  border-color: #E6850E;
}

.page-content :deep(.el-button--danger) {
  background: #FF3B30;
  border-color: #FF3B30;
}

.page-content :deep(.el-button--danger:hover) {
  background: #E6342A;
  border-color: #E6342A;
}

.page-content :deep(.el-button--default) {
  background: #E5E5E5;
  border-color: #E5E5E5;
  color: rgba(0, 0, 0, 0.6);
}

.page-content :deep(.el-button--default:hover) {
  background: #D1D1D1;
  border-color: #D1D1D1;
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
  border: none;
  border-bottom: 1px solid #E5E5E5;
  border-radius: 12px 12px 0 0;
  margin: 0;
  padding: 16px 20px;
  background: #F5F5F5;
  height: 56px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.preview-area :deep(.paper-preview) {
  background: #ffffff;
  border: none;
  border-radius: 0 0 12px 12px;
  margin: 0;
  flex: 1;
  padding: 20px;
  color: rgba(0, 0, 0, 0.87);
}

/* === 文本颜色统一 === */
.page-content :deep(h1),
.page-content :deep(h2),
.page-content :deep(h3),
.page-content :deep(h4) {
  color: rgba(0, 0, 0, 0.87);
  font-weight: 600;
}

.page-content :deep(p),
.page-content :deep(span),
.page-content :deep(.el-text) {
  color: rgba(0, 0, 0, 0.6);
}

.page-content :deep(.secondary-text) {
  color: rgba(0, 0, 0, 0.3);
}

/* === 响应式设计 === */
@media (max-width: 1080px) {
  .content-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, auto);
    gap: 12px;
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

@media (max-width: 768px) {
  .content-grid {
    padding: 12px;
    gap: 8px;
  }
  
  .area-card {
    padding: 12px;
  }
  
  .preview-area .area-card {
    padding: 0;
  }
  
  .preview-area :deep(.highlight-toolbar) {
    padding: 8px 12px;
  }
  
  .preview-area :deep(.paper-preview) {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .page-content {
    margin-top: 8px;
  }
  
  .content-grid {
    padding: 8px;
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
    padding: 12px;
  }
}
</style>