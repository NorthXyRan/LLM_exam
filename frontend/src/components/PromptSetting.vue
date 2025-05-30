<template>
  <div class="prompt-setting-page">
    <div class="page-header">
      <h1>Prompt 设置</h1>
      <p class="page-subtitle">配置AI评分的提示词模板，优化批改效果</p>
    </div>
    
    <div class="prompt-container">
      <el-card class="prompt-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <div class="icon-wrapper">
                <el-icon class="card-icon"><edit-pen /></el-icon>
              </div>
              <h3>评分提示词</h3>
            </div>
            <el-tag 
              v-if="promptContent.trim()" 
              type="success" 
              effect="dark"
              class="status-tag"
            >
              <el-icon><check /></el-icon>
              已配置
            </el-tag>
            <el-tag 
              v-else 
              type="info" 
              effect="plain"
              class="status-tag waiting-tag"
            >
              <el-icon><edit /></el-icon>
              待配置
            </el-tag>
          </div>
        </template>
        
        <div class="prompt-content">
          <!-- 快速模板选择 -->
          <div class="template-section">
            <div class="section-header">
              <el-icon class="section-icon"><collection /></el-icon>
              <h4>快速模板</h4>
            </div>
            <div class="template-grid">
              <div 
                v-for="template in promptTemplates" 
                :key="template.id"
                class="template-item"
                @click="selectTemplate(template)"
              >
                <div class="template-header">
                  <el-icon class="template-icon" :style="{ color: template.color }">
                    <component :is="template.icon" />
                  </el-icon>
                  <span class="template-name">{{ template.name }}</span>
                </div>
                <p class="template-description">{{ template.description }}</p>
              </div>
            </div>
          </div>
          
          <!-- 提示词编辑区域 -->
          <div class="editor-section">
            <div class="section-header">
              <el-icon class="section-icon"><edit /></el-icon>
              <h4>提示词内容</h4>
              <div class="header-actions">
                <el-button 
                  type="primary" 
                  link 
                  @click="insertVariable"
                  class="action-btn"
                >
                  <el-icon><plus /></el-icon>
                  插入变量
                </el-button>
                <el-button 
                  type="warning" 
                  link 
                  @click="clearPrompt"
                  class="action-btn"
                >
                  <el-icon><delete /></el-icon>
                  清空
                </el-button>
              </div>
            </div>
            
            <div class="editor-container">
              <el-input
                v-model="promptContent"
                type="textarea"
                placeholder="请输入评分提示词模板..."
                :rows="12"
                :autosize="{ minRows: 8, maxRows: 20 }"
                class="prompt-textarea"
                show-word-limit
                :maxlength="2000"
              />
              
              <!-- 变量提示 -->
              <div class="variable-tips">
                <div class="tips-header">
                  <el-icon><info-filled /></el-icon>
                  <span>可用变量</span>
                </div>
                <div class="variable-list">
                  <span 
                    v-for="variable in availableVariables" 
                    :key="variable.key"
                    class="variable-tag"
                    @click="insertVariableText(variable.key)"
                    :title="variable.description"
                  >
                    {{ variable.key }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 预览区域 -->
          <div v-if="promptContent.trim()" class="preview-section">
            <div class="section-header">
              <el-icon class="section-icon"><view /></el-icon>
              <h4>预览效果</h4>
            </div>
            <div class="preview-content">
              <div class="preview-text">
                {{ previewText }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 底部操作 -->
        <div class="bottom-actions">
          <el-button @click="resetToDefault">恢复默认</el-button>
          <el-button 
            type="primary" 
            @click="savePrompt"
            :disabled="!promptContent.trim()"
          >
            保存设置
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Check,
  Collection,
  Delete,
  Edit,
  EditPen,
  InfoFilled,
  Plus
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref } from 'vue'

// 提示词内容
const promptContent = ref('')

// 快速模板
const promptTemplates = ref([
  {
    id: 1,
    name: '基础评分',
    description: '标准的评分模板，适用于大部分题目',
    color: '#3b82f6',
    icon: 'Edit',
    template: `请根据以下标准为学生答案评分：

题目：{question}
参考答案：{reference_answer}
学生答案：{student_answer}

评分要求：
1. 满分为 {total_score} 分
2. 根据答案的准确性、完整性进行评分
3. 给出具体的扣分理由
4. 提供改进建议

请按以下格式输出：
得分：[具体分数]/[满分]
评语：[详细评语]`
  },
  {
    id: 2,
    name: '严格评分',
    description: '更严格的评分标准，注重细节和准确性',
    color: '#ef4444',
    icon: 'Check',
    template: `请严格按照以下标准评分：

题目：{question}
参考答案：{reference_answer}
学生答案：{student_answer}

严格评分标准：
1. 满分：{total_score}分
2. 答案必须完全准确才能得满分
3. 部分正确按比例给分
4. 错误理解扣重分
5. 格式不规范适当扣分

输出要求：
得分：[分数]/[满分]
扣分理由：[详细说明]
改进方向：[具体建议]`
  },
  {
    id: 3,
    name: '宽松评分',
    description: '相对宽松的评分，鼓励学生思考过程',
    color: '#22c55e',
    icon: 'Plus',
    template: `请以鼓励为主进行评分：

题目：{question}
参考答案：{reference_answer}
学生答案：{student_answer}

宽松评分原则：
1. 满分：{total_score}分
2. 重视思考过程和逻辑
3. 创新性答案给予额外考虑
4. 部分正确给予相应分数
5. 即使错误也肯定努力

输出格式：
得分：[分数]/[满分]
亮点：[答案中的优点]
建议：[温和的改进建议]`
  }
])

// 可用变量
const availableVariables = ref([
  { key: '{question}', description: '题目内容' },
  { key: '{reference_answer}', description: '参考答案' },
  { key: '{student_answer}', description: '学生答案' },
  { key: '{total_score}', description: '题目总分' },
  { key: '{question_type}', description: '题目类型' },
  { key: '{difficulty}', description: '难度等级' }
])

// 预览文本
const previewText = computed(() => {
  return promptContent.value
    .replace(/{question}/g, '示例题目：请解释什么是机器学习？')
    .replace(/{reference_answer}/g, '机器学习是一种人工智能技术...')
    .replace(/{student_answer}/g, '机器学习就是让计算机自己学习...')
    .replace(/{total_score}/g, '10')
    .replace(/{question_type}/g, '简答题')
    .replace(/{difficulty}/g, '中等')
})

// 方法
const selectTemplate = (template: any) => {
  ElMessageBox.confirm(
    '选择此模板将覆盖当前内容，是否继续？',
    '确认选择',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    promptContent.value = template.template
    ElMessage.success(`已应用"${template.name}"模板`)
  }).catch(() => {
    // 用户取消
  })
}

const insertVariable = () => {
  // 这里可以实现一个变量选择弹窗
  ElMessage.info('点击下方变量标签即可插入')
}

const insertVariableText = (variable: string) => {
  const textarea = document.querySelector('.prompt-textarea textarea') as HTMLTextAreaElement
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = promptContent.value
    promptContent.value = text.substring(0, start) + variable + text.substring(end)
    
    // 设置光标位置
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length, start + variable.length)
    }, 0)
  } else {
    promptContent.value += variable
  }
  ElMessage.success(`已插入变量：${variable}`)
}

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

const resetToDefault = () => {
  ElMessageBox.confirm(
    '确定要恢复到默认模板吗？',
    '确认恢复',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    promptContent.value = promptTemplates.value[0].template
    ElMessage.success('已恢复默认模板')
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

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 16px;
  color: #8590a6;
  margin: 0;
}

.prompt-container {
  max-width: 1000px;
  margin: 0 auto;
}

.prompt-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8f4fd;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  overflow: hidden;
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

.status-tag {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.waiting-tag {
  background: rgba(255, 255, 255, 0.9);
  color: #909399;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.prompt-content {
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-icon {
  color: #667eea;
  font-size: 18px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.template-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f4f8;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.template-item {
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.template-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.template-icon {
  font-size: 16px;
}

.template-name {
  font-weight: 600;
  color: #2c3e50;
}

.template-description {
  font-size: 14px;
  color: #8590a6;
  margin: 0;
  line-height: 1.4;
}

.editor-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f4f8;
}

.editor-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prompt-textarea :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  line-height: 1.6;
}

.prompt-textarea :deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.variable-tips {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e5e7eb;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #667eea;
}

.variable-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.variable-tag {
  background: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  cursor: pointer;
  transition: all 0.3s ease;
}

.variable-tag:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.preview-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f4f8;
}

.preview-content {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.preview-text {
  white-space: pre-wrap;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
}

.bottom-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  border-top: 1px solid #ebeef5;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  margin: 20px -20px -20px;
}

.bottom-actions .el-button {
  padding: 12px 24px;
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
  
  .template-grid {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .bottom-actions {
    flex-direction: column;
  }
  
  .variable-list {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 24px;
  }
  
  .prompt-content {
    padding: 16px 12px 12px;
  }
}
</style>