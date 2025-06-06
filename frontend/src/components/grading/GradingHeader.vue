<template>
  <div class="page-header">
    <div class="header-content">
      <!-- 题目选择区域 -->
      <div class="select-section">
        <h1>Select Question</h1>
        <div class="select-list">
          <div
            v-for="(question, index) in questions" 
            :key="question.question_id"
            :class="[
              'select-item',
              { 'active': currentQuestion === (index + 1) }
            ]"
            @click="handleQuestionChange(index + 1, question)"
            :title="`${question.question.substring(0, 50)}...（${question.score}分）`"
          >
            Question {{ index + 1 }}
          </div>
        </div>
      </div>

      <!-- 学生选择区域 -->
      <div class="select-section">
        <h1>Select Student</h1>
        <div class="select-list">
          <div 
            v-for="student in studentList" 
            :key="student.id"
            :class="[
              'select-item circle',
              { 
                'active': currentStudentId === student.id,
                'graded': gradedPapers.includes(student.id)
              }
            ]"
            @click="handleStudentChange(student.id)"
            :title="`学生ID: ${student.id}${gradedPapers.includes(student.id) ? '（已批改）' : '（未批改）'}`"
          >
            {{ student.id }}
          </div>
        </div>
      </div>
      
      <!-- 统计信息概览 -->
      <div class="statistics-overview">
        <el-row :gutter="10">
          
          <!-- 批改进度 -->
          <el-col :span="5">
            <div class="stat-item">
              <span class="label">Marked/Total</span>
              <span class="value">{{ gradedCount }}/{{ totalStudents }}</span>
            </div>
          </el-col>
          
          <!-- 最高分（可点击跳转） -->
          <el-col :span="5">
            <div class="stat-item clickable" @click="jumpToStudent(statistics.highestStudent)">
              <span class="label">Highest</span>
              <span class="value highlight-good">{{ statistics.highest }}</span>
            </div>
          </el-col>
          
          <!-- 最低分（可点击跳转） -->
          <el-col :span="5">
            <div class="stat-item clickable" @click="jumpToStudent(statistics.lowestStudent)">
              <span class="label">Lowest</span>
              <span class="value highlight-poor">{{ statistics.lowest }}</span>
            </div>
          </el-col>
          
          <!-- 平均分 -->
          <el-col :span="5">
            <div class="stat-item">
              <span class="label">Average</span>
              <span class="value">{{ statistics.average }}</span>
            </div>
          </el-col>
          
          <!-- 当前题目查看 -->
          <el-col :span="4">
            <div class="stat-item clickable" @click="emits('showCurrentQuestion')">
              <span class="label">Current Question</span>
              <span class="value icon-value">
                <el-icon><Document /></el-icon>
              </span>
            </div>
          </el-col>
          
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

/**
 * ===== TypeScript 接口定义 =====
 */

// 组件Props接口
interface Props {
  currentQuestion: number           // 当前选中的题目序号（1, 2, 3...）
  currentStudentId: number          // 当前选中的学生ID
  questions: Array<{
    question_id: number            // 题目ID（如 "1", "2"）
    question: string               // 题目内容
    score: number                  // 题目分值
  }>
  totalStudents: number            // 学生总数
  gradedCount: number             // 已批改的学生数量
  gradedPapers: number[]          // 已批改的学生ID列表
  studentList: Array<{            // 学生列表（移除可选标记，简化逻辑）
    id: number
  }>
  statistics: {                   // 统计信息
    highest: number               // 最高分
    lowest: number                // 最低分
    average: number               // 平均分
    highestStudent?: {            // 最高分学生信息
      id?: number
    }
    lowestStudent?: {             // 最低分学生信息
      id?: number
    }
  }
}

const props = defineProps<Props>()

/**
 * ===== 事件定义 =====
 * 定义组件向父组件发送的事件
 */
const emits = defineEmits<{
  // 题目切换事件
  (e: 'questionChange', question: { id: number; name: string; score: number }): void
  // 学生切换事件
  (e: 'studentChange', studentId: number): void
  // 显示当前题目事件
  (e: 'showCurrentQuestion'): void
}>()

/**
 * ===== 事件处理函数 =====
 */

/**
 * 处理学生切换
 * @param studentId 学生ID
 */
const handleStudentChange = (studentId: number) => {
  if (!studentId) {
    ElMessage.warning('学生ID无效')
    return  
  }
  emits('studentChange', studentId)
}

/**
 * 处理题目切换
 * @param questionIndex 题目序号（从1开始）
 * @param question 题目数据对象
 */
const handleQuestionChange = (questionIndex: number, question: any) => {
  emits('questionChange', {
    id: questionIndex,              // 题目序号
    name: `第${questionIndex}题`,    // 题目名称
    score: question.score           // 题目分值
  })
}

/**
 * 跳转到指定学生
 * 用于点击统计信息时快速跳转到最高分/最低分学生
 * @param student 学生信息对象
 */
const jumpToStudent = (student: { id?: number } | undefined) => {
  if (!student?.id) {
    ElMessage.warning('未找到学生信息')
    return
  }
  handleStudentChange(student.id)
}
</script>

<style scoped>
/**
 * ===== 主容器样式 =====
 */
.page-header {
  background: #FFFFFF;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E5E5;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/**
 * ===== 选择区域样式 =====
 * 题目选择和学生选择的通用样式
 */
.select-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.select-section h1 {
  margin: 0;
  color: rgba(0, 0, 0, 0.87);
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  min-width: 120px;
}

/**
 * ===== 选择列表样式 =====
 * 题目和学生的横向滚动列表
 */
.select-list {
  display: flex;
  gap: 8px;
  padding: 4px;
  overflow-x: auto;              /* 水平滚动 */
  flex: 1;
  scrollbar-width: thin;         /* Firefox滚动条样式 */
  scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.03);
}

/* WebKit浏览器（Chrome, Safari）滚动条样式 */
.select-list::-webkit-scrollbar {
  height: 4px;
}

.select-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 2px;
}

.select-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  transition: background 0.2s ease;
}

.select-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

/**
 * ===== 选择项样式 =====
 * 题目和学生选择按钮的通用样式
 */
.select-item {
  padding: 8px 12px;
  background-color: #F5F5F5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  flex-shrink: 0;               /* 防止被压缩 */
  border: 1px solid transparent;
  user-select: none;            /* 防止文本被选中 */
}

.select-item:hover {
  background-color: #E5E5E5;
  transform: translateY(-1px);  /* 悬浮效果 */
}

.select-item.active {
  background-color: #007AFF;
  color: #FFFFFF;
  border-color: #007AFF;
}

/**
 * ===== 圆形选择项样式 =====
 * 专门用于学生ID显示的圆形按钮
 */
.select-item.circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  padding: 0;                   /* 重置padding以保持圆形 */
}

/**
 * ===== 已批改状态样式 =====
 */
.select-item.graded {
  background-color: #4CD964;    /* 绿色表示已完成 */
  color: #FFFFFF;
  border-color: #4CD964;
}

.select-item.graded:hover {
  background-color: #3AC85A;
}

/**
 * ===== 统计信息区域样式 =====
 */
.statistics-overview {
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid #E5E5E5;
}

/**
 * ===== 统计卡片样式 =====
 */
.stat-item {
  text-align: center;
  padding: 12px 8px;
  background-color: #F5F5F5;
  border-radius: 12px;
  height: 100%;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.stat-item.clickable {
  cursor: pointer;
}

.stat-item.clickable:hover {
  background-color: #E5E5E5;
  transform: translateY(-1px);
  border-color: #007AFF;
}

/**
 * ===== 统计项内容样式 =====
 */
.stat-item .label {
  display: block;
  color: rgba(0, 0, 0, 0.6);
  font-size: 11px;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-item .value {
  display: block;
  color: #007AFF;
  font-size: 16px;
  font-weight: 600;
}

/**
 * ===== 特殊值样式 =====
 * 为不同类型的分数添加色彩区分
 */
.value.highlight-good {
  color: #4CD964;               /* 绿色：好成绩 */
}

.value.highlight-poor {
  color: #FF3B30;               /* 红色：差成绩 */
}

.value.icon-value {
  font-size: 18px;
}

/**
 * ===== 响应式设计 =====
 * 适配移动设备和小屏幕
 */
@media (max-width: 768px) {
  .page-header {
    padding: 12px 16px;
  }

  .header-content {
    gap: 12px;
  }

  .select-section {
    gap: 12px;
  }

  .select-section h1 {
    min-width: 80px;
    font-size: 14px;
  }

  .statistics-overview {
    padding-top: 8px;
    margin-top: 8px;
  }

  .stat-item {
    padding: 8px 4px;
  }

  .stat-item .value {
    font-size: 14px;
  }

  /* 移动端下统计卡片堆叠显示 */
  .statistics-overview :deep(.el-col) {
    margin-bottom: 8px;
  }
}

@media (max-width: 480px) {
  .select-section {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .select-section h1 {
    min-width: unset;
    text-align: center;
  }
}
</style>