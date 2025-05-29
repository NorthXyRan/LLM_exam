<template>
  <div class="page-content">
    <el-card class="paper-content">
      <template #header>
        <div class="toolbar">
          <!-- 评分区域 -->
          <div class="scoring-section">
            <div class="score-group">
              <div class="score-item">
                <span class="score-label">LLM批改分数</span>
                <div class="score-display">
                  <span class="score-value">{{ llmScore }}</span>
                  <span class="score-unit">分</span>
                </div>
              </div>
              
              <el-divider direction="vertical" />
              
              <div class="score-item">
                <span class="score-label">最终评分</span>
                <div class="score-input-group">
                  <el-input
                    v-model="teacherScore"
                    type="number"
                    size="medium"
                    class="score-input"
                    @input="handleTeacherScoreInput"
                  />
                  <span class="score-unit">分</span>
                </div>
              </div>
              
              <el-divider direction="vertical" />
              
              <div class="score-item">
                <span class="score-label">操作</span>
                <div class="score-actions-inline">
                  <el-button 
                    type="primary" 
                    size="medium"
                    @click="saveScore"
                    :disabled="!teacherScore"
                  >
                    保存并提交
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作区域 -->
          <div class="action-section">
            <div class="action-group">
              <div class="score-item">
                <span class="score-label">操作模式</span>
                <div class="action-buttons">
                  <el-button type="primary" size="medium" @click="handleStartGrading">
                    <el-icon><VideoPlay /></el-icon>
                    开始评分
                  </el-button>
                  <el-button type="success" size="medium" @click="handleBatchGrading">
                    <el-icon><Document /></el-icon>
                    全部评分
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <div class="content-container">
        <!-- 左侧区域：高亮工具栏 + 试卷预览 -->
        <div class="left-section">
          <!-- 高亮工具栏 -->
          <div class="highlight-toolbar">
            <div class="tool-section">
              <div class="tool-group">
                <el-button 
                  :type="highlightMode ? 'primary' : 'default'"
                  :class="{ 'active': highlightMode }"
                  @click="toggleHighlightMode"
                  size="medium"
                >
                  <el-icon><Edit /></el-icon>
                  高亮笔
                </el-button>
              </div>
              
              <el-divider direction="vertical" />
              
              <div class="tool-group">
                <el-button 
                  type="success" 
                  size="medium"
                  @click="() => handleMarkAnswer({ text: '', type: 'correct' })"
                  :disabled="!hasSelectedText"
                >
                  <el-icon><Check /></el-icon>
                  正确
                </el-button>
                <el-button 
                  type="danger" 
                  size="medium"
                  @click="() => handleMarkAnswer({ text: '', type: 'wrong' })"
                  :disabled="!hasSelectedText"
                >
                  <el-icon><Close /></el-icon>
                  错误
                </el-button>
                <el-button 
                  type="warning" 
                  size="medium"
                  @click="() => handleMarkAnswer({ text: '', type: 'unclear' })"
                  :disabled="!hasSelectedText"
                >
                  <el-icon><QuestionFilled /></el-icon>
                  模糊
                </el-button>
                <el-button 
                  type="info" 
                  size="medium"
                  @click="() => handleMarkAnswer({ text: '', type: 'redundant' })"
                  :disabled="!hasSelectedText"
                >
                  <el-icon><RemoveFilled /></el-icon>
                  冗余
                </el-button>
              </div>
            </div>
          </div>

          <!-- 试卷预览 -->
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

        <!-- 右侧：反馈理由输入 -->
        <feedback-panel
          :selected-highlight="selectedHighlight"
          @modify-reason="handleModifyReason"
          @save-reason="handleSaveReason"
          @submit-reason="handleSubmitReason"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Check, Close, Document, Edit, QuestionFilled, RemoveFilled, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import FeedbackPanel from './FeedbackPanel.vue'
import PaperPreview from './PaperPreview.vue'

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

// 评分相关数据
const teacherScore = ref<number | string>()

// 切换高亮模式
const toggleHighlightMode = () => {
  highlightMode.value = !highlightMode.value
  if (highlightMode.value) {
    ElMessage.info('高亮模式已开启，选中文本进行标记')
  } else {
    ElMessage.info('高亮模式已关闭')
  }
}

// 处理文本选择
const handleTextSelected = (data: { text: string, hasSelection: boolean }) => {
  hasSelectedText.value = data.hasSelection
}

// 标记答案
const handleMarkAnswer = (data: { text: string, type: 'correct' | 'wrong' | 'unclear' | 'redundant' }) => {
  // 模拟 AI 给分理由
  const aiReasons = {
    correct: '该答案准确回答了问题的核心要点，逻辑清晰，表达规范。体现了学生对知识点的准确理解。',
    wrong: '该答案存在明显的概念错误或逻辑漏洞，与标准答案不符。需要进一步学习相关知识点。',
    unclear: '该答案的表述不够清晰明确，可能存在歧义或不完整的地方。建议进一步阐述或补充说明。',
    redundant: '该部分内容与题目要求不符或存在不必要的重复，应当删除或精简以提高答案质量。'
  }

  selectedHighlight.value = {
    text: data.text,
    type: data.type,
    aiReason: aiReasons[data.type]
  }

  // 向父组件传递事件
  emits('markAnswer', data)
}

const handleStartGrading = () => {
  emits('startGrading')
}

// 处理教师评分变化
const handleTeacherScoreInput = (value: string) => {
  const numericValue = parseFloat(value)
  if (!isNaN(numericValue)) {
    teacherScore.value = numericValue
    emits('scoreChange', {
      teacherScore: numericValue,
      llmScore: props.llmScore || 0
    })
  } else {
    teacherScore.value = value
  }
}

// 保存评分
const saveScore = () => {
  const score = typeof teacherScore.value === 'string' ? parseFloat(teacherScore.value) : teacherScore.value
  if (score !== undefined && !isNaN(score)) {
    ElMessage.success(`评分已保存并提交: ${score}分`)
    // TODO: 这里可以调用API保存评分并提交
    emits('scoreChange', {
      teacherScore: score,
      llmScore: props.llmScore || 0
    })
  }
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

const handleBatchGrading = () => {
  // Implementation for batch grading
  console.log('Batch grading')
}

</script>

<style scoped>
/* === 通用样式变量和基础类 === */
.page-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* === 布局容器 === */
.toolbar {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 20px;
  overflow-x: auto;
}

.content-container {
  display: flex;
  gap: 20px;
  margin-top: 0;
  overflow-x: auto;
}

.left-section {
  flex: 0 0 70%;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* === 评分区域样式 === */
.scoring-section {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 10px 15px;
  flex: 0 0 70%;
}

.score-group {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 0;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.score-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

.score-display {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.score-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.score-unit {
  font-size: 12px;
  color: #999;
}

.score-input-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.score-input {
  width: 100px;
}

.score-input :deep(.el-input__inner) {
  text-align: center;
  font-weight: bold;
  font-size: 16px;
}

.score-actions-inline {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

/* === 操作区域样式 === */
.action-section {
  display: flex;
  flex: 0 0 30%;
  justify-content: flex-start;
}

.action-group {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 10px 15px;
  width: 100%;
  margin-right: 0;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}

/* === 高亮工具栏样式 === */
.highlight-toolbar {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px 6px 0 0;
  padding: 10px 15px;
  border-bottom: none;
}

.highlight-toolbar .tool-section {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-start;
}

.tool-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* === 按钮状态样式 === */
.active {
  background-color: #409eff !important;
  color: white !important;
}

.el-button:disabled {
  opacity: 0.5;
}
</style> 