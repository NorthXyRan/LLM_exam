<template>
  <div class="page-header">
    <div class="header-content">
      <!-- 试卷题目选择 -->
      <div class="select-section">
          <h1>选择试卷题目</h1>
          <div class="select-list">
            <div 
              v-for="question in questions" 
              :key="question.id"
              :class="[
                'select-item',
                { 'active': currentQuestion === question.id }
              ]"
              @click="handleQuestionChange(question)"
            >
              {{ question.name }}
            </div>
        </div>
      </div>

      <!-- 学生试卷选择 -->
      <div class="select-section">
          <h1>选择学生试卷</h1>
          <div class="select-list">
            <div 
              v-for="page in totalPapers" 
              :key="page"
              :class="[
                'select-item circle',
                { 
                  'active': currentPage === page,
                  'graded': gradedPapers.includes(page)
                }
              ]"
              @click="handlePageChange(page)"
            >
              {{ page }}
            </div>
        </div>
      </div>
      
      <!-- 统计概览 -->
      <div class="statistics-overview">
        <el-row :gutter="10">
          <el-col :span="4">
            <div class="stat-item">
              <span class="label">已批改/总份数</span>
              <span class="value">{{ gradedCount }}/{{ totalPapers }}</span>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-item clickable" @click="jumpToStudent(statistics.highestStudent)">
              <span class="label">最高分</span>
              <span class="value">{{ statistics.highest }}</span>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-item clickable" @click="jumpToStudent(statistics.lowestStudent)">
              <span class="label">最低分</span>
              <span class="value">{{ statistics.lowest }}</span>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-item">
              <span class="label">平均分</span>
              <span class="value">{{ statistics.average }}</span>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-item clickable" @click="emits('showCurrentQuestion')">
              <span class="label">当前题目</span>
              <span class="value"><el-icon><Document /></el-icon></span>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="stat-item clickable" @click="emits('showReferenceAnswer')">
              <span class="label">参考答案</span>
              <span class="value"><el-icon><Document /></el-icon></span>
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

// Props: 传递所有必要的数据（currentQuestion, questions, statistics 等）
interface Props {
  currentQuestion: number
  questions: Array<{
    id: number
    name: string
    score: number
  }>
  currentPage: number
  totalPapers: number
  gradedCount: number
  gradedPapers: number[]
  statistics: {
    highest: number
    lowest: number
    average: number
    highestStudent?: {
      name?: string
      id?: string
      paperIndex?: number
    }
    lowestStudent?: {
      name?: string
      id?: string
      paperIndex?: number
    }
  }
}

const props = defineProps<Props>()
const emits = defineEmits<{
  (e: 'questionChange', question: { id: number; name: string; score: number }): void
  (e: 'pageChange', page: number): void
  (e: 'jumpToStudent', student: { name?: string; id?: string; paperIndex?: number }): void
  (e: 'showReferenceAnswer'): void
  (e: 'showCurrentQuestion'): void
}>()

// 页码变化处理
const handlePageChange = (page: number) => {
  emits('pageChange', page)
}

// 跳转到指定学生的试卷
const jumpToStudent = (student: { name?: string; id?: string; paperIndex?: number } | undefined) => {
  if (!student?.paperIndex) {
    ElMessage.warning('未找到学生信息')
    return
  }
  emits('jumpToStudent', student)
}

// 处理题目切换
const handleQuestionChange = (question: { id: number; name: string; score: number }) => {
  emits('questionChange', question)
}
</script>

<style scoped>
.page-header {
  margin-bottom: 12px;
  background: white;
  padding: 10px 12px;
  border-radius: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.select-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.select-section h1 {
  margin: 0;
  color: #409eff;
  font-size: 16px;
  white-space: nowrap;
  min-width: 100px;
}

.select-list {
  display: flex;
  gap: 6px;
  padding: 4px;
  overflow-x: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: #409eff #f0f2f5;
}

.select-list::-webkit-scrollbar {
  height: 4px;
}

.select-list::-webkit-scrollbar-track {
  background: #f0f2f5;
  border-radius: 3px;
}

.select-list::-webkit-scrollbar-thumb {
  background-color: #409eff;
  border-radius: 3px;
}

.select-item {
  padding: 4px 10px;
  background-color: #f0f2f5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  color: #606266;
  flex-shrink: 0;
  position: relative;
}

.select-item:hover {
  background-color: #e6f1fc;
  transform: translateY(-2px);
}

.select-item.active {
  background-color: #409eff;
  color: white;
}

.select-item.circle {
  min-width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.select-item.graded {
  background-color: #67c23a;
  color: white;
}

.statistics-overview {
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid #eee;
}

.stat-item {
  text-align: center;
  padding: 6px;
  background-color: #f8f9fa;
  border-radius: 32px;
  height: 100%;
  position: relative;
}

.stat-item.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-item.clickable:hover {
  background-color: #e6f1fc;
  transform: translateY(-2px);
}

.stat-item .label {
  display: block;
  color: #666;
  font-size: 11px;
  margin-bottom: 2px;
}

.stat-item .value {
  display: block;
  color: #409eff;
  font-size: 14px;
  font-weight: bold;
}
</style> 