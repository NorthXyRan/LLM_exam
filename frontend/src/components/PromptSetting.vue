<template>
  <div class="prompt-setting-page">
    <div class="prompt-container">
      <el-card class="prompt-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <div class="icon-wrapper">
                <el-icon class="card-icon"><edit-pen /></el-icon>
              </div>
              <h3>Prompt</h3>
            </div>
          </div>
        </template>
        
        <div class="prompt-content">          
          <el-input
            v-model="promptContent"
            type="textarea"
            placeholder="请输入评分提示词模板..."
            :rows="20"
            class="prompt-textarea"
            show-word-limit
            :maxlength="2000"
          />
        </div>
        
        <!-- 底部操作 -->
        <div class="bottom-actions">
          <el-button @click="clearPrompt">清空</el-button>
          <el-button 
            type="primary" 
            @click="savePrompt"
            :disabled="!promptContent.trim()"
          >
            保存
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  EditPen
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue'

// 提示词内容
const promptContent = ref('')

// 可用变量
const availableVariables = ref([
  { key: '{question}', description: '题目内容' },
  { key: '{reference_answer}', description: '参考答案' },
  { key: '{student_answer}', description: '学生答案' },
  { key: '{total_score}', description: '题目总分' },
  { key: '{question_type}', description: '题目类型' },
  { key: '{difficulty}', description: '难度等级' }
])

const clearPrompt = () => {
  ElMessageBox.confirm(
    '确定要清空所有内容吗？',
    '确认清空',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    promptContent.value = ''
    ElMessage.success('已清空内容')
  })
}

const savePrompt = () => {
  // 这里实现保存逻辑
  ElMessage.success('提示词设置已保存！')
}
</script>

<style scoped>
.prompt-setting-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.prompt-container {
  max-width: 1000px;
  margin: 0 auto;
}

.prompt-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  overflow: hidden;
  border: 0px;
}

.prompt-card :deep(.el-card__header) {
  border-bottom: none;  /* 去掉卡片头部下划线 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: -20px -20px 0;
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.card-icon {
  font-size: 20px;
  color: white;
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.prompt-content {
  padding: 24px 20px 20px;
}

.prompt-textarea :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 5px solid #e5e7eb;
  transition: all 0.3s ease;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  line-height: 1.6;
}

.prompt-textarea :deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.bottom-actions {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
}

.bottom-actions .el-button {
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.bottom-actions .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.bottom-actions .el-button--primary:hover:not(.is-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.bottom-actions .el-button--default {
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}

.bottom-actions .el-button--default:hover {
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .prompt-setting-page {
    padding: 16px;
  }
  
  .bottom-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .prompt-content {
    padding: 16px 12px 12px;
  }
}
</style>