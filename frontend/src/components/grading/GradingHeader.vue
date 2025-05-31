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

.select-list {
  display: flex;
  gap: 8px;
  padding: 4px;
  overflow-x: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: #007AFF #F5F5F5;
}

.select-list::-webkit-scrollbar {
  height: 4px;
}

.select-list::-webkit-scrollbar-track {
  background: #F5F5F5;
  border-radius: 2px;
}

.select-list::-webkit-scrollbar-thumb {
  background-color: #007AFF;
  border-radius: 2px;
}

.select-item {
  padding: 8px 12px;
  background-color: #F5F5F5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  flex-shrink: 0;
  border: 1px solid transparent;
}

.select-item:hover {
  background-color: #E5E5E5;
  transform: translateY(-1px);
}

.select-item.active {
  background-color: #007AFF;
  color: #FFFFFF;
  border-color: #007AFF;
}

.select-item.circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.select-item.graded {
  background-color: #4CD964;
  color: #FFFFFF;
  border-color: #4CD964;
}

.select-item.graded:hover {
  background-color: #3AC85A;
}

.statistics-overview {
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid #E5E5E5;
}

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

/* === 响应式设计 === */
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
}
</style> 