<template>
  <div class="prompt-setting-page">
    <div class="page-header">
      <h1>Prompt 设置</h1>
    </div>
    
    <div class="page-content">
      <el-row :gutter="20">
        <!-- 左侧：评分标准设置 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>评分标准设置</span>
                <el-button type="primary" size="small" @click="saveScoreSettings">保存设置</el-button>
              </div>
            </template>
            
            <el-form :model="scoreSettings" label-width="120px">
              <el-form-item label="内容准确性">
                <el-slider v-model="scoreSettings.accuracy" :max="30" show-input />
                <span class="score-desc">评估答案内容的准确性和正确性</span>
              </el-form-item>
              
              <el-form-item label="逻辑结构">
                <el-slider v-model="scoreSettings.logic" :max="25" show-input />
                <span class="score-desc">评估答案的逻辑性和结构合理性</span>
              </el-form-item>
              
              <el-form-item label="语言表达">
                <el-slider v-model="scoreSettings.expression" :max="25" show-input />
                <span class="score-desc">评估语言表达的流畅性和规范性</span>
              </el-form-item>
              
              <el-form-item label="创新性">
                <el-slider v-model="scoreSettings.innovation" :max="20" show-input />
                <span class="score-desc">评估答案的创新思路和独特见解</span>
              </el-form-item>
              
              <el-form-item label="严格程度">
                <el-radio-group v-model="scoreSettings.strictness">
                  <el-radio label="lenient">宽松</el-radio>
                  <el-radio label="normal">标准</el-radio>
                  <el-radio label="strict">严格</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        
        <!-- 右侧：Prompt 模板设置 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>Prompt 模板</span>
                <el-button type="primary" size="small" @click="savePromptTemplate">保存模板</el-button>
              </div>
            </template>
            
            <el-tabs v-model="activePromptTab">
              <el-tab-pane label="基础评分" name="basic">
                <el-input
                  v-model="promptTemplates.basic"
                  type="textarea"
                  :rows="8"
                  placeholder="请输入基础评分的 prompt 模板..."
                />
              </el-tab-pane>
              
              <el-tab-pane label="详细分析" name="detailed">
                <el-input
                  v-model="promptTemplates.detailed"
                  type="textarea"
                  :rows="8"
                  placeholder="请输入详细分析的 prompt 模板..."
                />
              </el-tab-pane>
              
              <el-tab-pane label="改进建议" name="suggestions">
                <el-input
                  v-model="promptTemplates.suggestions"
                  type="textarea"
                  :rows="8"
                  placeholder="请输入改进建议的 prompt 模板..."
                />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 预设模板 -->
      <el-card style="margin-top: 20px;">
        <template #header>
          <span>预设模板</span>
        </template>
        
        <el-row :gutter="15">
          <el-col :span="8" v-for="template in presetTemplates" :key="template.id">
            <el-card class="preset-card" @click="loadPresetTemplate(template)">
              <h4>{{ template.name }}</h4>
              <p>{{ template.description }}</p>
              <div class="template-tags">
                <el-tag v-for="tag in template.tags" :key="tag" size="small">{{ tag }}</el-tag>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
      
      <!-- 高级设置 -->
      <el-card style="margin-top: 20px;">
        <template #header>
          <span>高级设置</span>
        </template>
        
        <el-form :model="advancedSettings" label-width="150px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="AI 模型选择">
                <el-select v-model="advancedSettings.model" placeholder="选择 AI 模型">
                  <el-option label="GPT-4" value="gpt-4" />
                  <el-option label="GPT-3.5 Turbo" value="gpt-3.5-turbo" />
                  <el-option label="Claude-3" value="claude-3" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="温度参数">
                <el-slider v-model="advancedSettings.temperature" :min="0" :max="1" :step="0.1" show-input />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="最大输出长度">
                <el-input-number v-model="advancedSettings.maxTokens" :min="100" :max="4000" />
              </el-form-item>
              
              <el-form-item label="批量处理">
                <el-switch v-model="advancedSettings.batchProcessing" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activePromptTab = ref('basic')

// 评分标准设置
const scoreSettings = ref({
  accuracy: 25,
  logic: 20,
  expression: 22,
  innovation: 15,
  strictness: 'normal'
})

// Prompt 模板
const promptTemplates = ref({
  basic: `请作为一名专业的阅卷老师，对以下学生答案进行评分。

评分标准：
- 内容准确性（${scoreSettings.value.accuracy}分）
- 逻辑结构（${scoreSettings.value.logic}分）
- 语言表达（${scoreSettings.value.expression}分）
- 创新性（${scoreSettings.value.innovation}分）

请给出具体分数和简要评语。`,
  
  detailed: `请对学生答案进行详细分析，包括：
1. 优点分析
2. 不足之处
3. 具体改进方向
4. 参考答案对比

请提供建设性的反馈意见。`,
  
  suggestions: `基于学生的答案表现，请提供具体的改进建议：
1. 学习重点
2. 练习方向
3. 参考资料推荐
4. 下次答题注意事项`
})

// 高级设置
const advancedSettings = ref({
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  batchProcessing: false
})

// 预设模板
const presetTemplates = ref([
  {
    id: 1,
    name: '语文作文评分',
    description: '适用于语文作文的评分标准',
    tags: ['语文', '作文', '文学']
  },
  {
    id: 2,
    name: '数学解题评分',
    description: '适用于数学题目的评分标准',
    tags: ['数学', '解题', '逻辑']
  },
  {
    id: 3,
    name: '英语写作评分',
    description: '适用于英语写作的评分标准',
    tags: ['英语', '写作', '语法']
  },
  {
    id: 4,
    name: '理科实验报告',
    description: '适用于理科实验报告评分',
    tags: ['理科', '实验', '报告']
  },
  {
    id: 5,
    name: '文科论述题',
    description: '适用于文科论述题评分',
    tags: ['文科', '论述', '分析']
  },
  {
    id: 6,
    name: '编程作业评分',
    description: '适用于编程作业的评分标准',
    tags: ['编程', '代码', '算法']
  }
])

const goBack = () => {
  router.push('/')
}

const saveScoreSettings = () => {
  ElMessage.success('评分标准设置已保存')
}

const savePromptTemplate = () => {
  ElMessage.success('Prompt 模板已保存')
}

const loadPresetTemplate = (template: any) => {
  ElMessage.info(`已加载预设模板：${template.name}`)
  // 这里可以加载对应的模板设置
}
</script>

<style scoped>
.prompt-setting-page {
  min-height: 100%;
}

.page-header {
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0;
  color: #409eff;
}

.page-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score-desc {
  font-size: 12px;
  color: #999;
  display: block;
  margin-top: 5px;
}

.preset-card {
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.preset-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preset-card h4 {
  margin: 0 0 10px 0;
  color: #409eff;
}

.preset-card p {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.template-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
</style>
