<template>
  <div class="help-page">
    <div class="page-header">
      <h1>帮助中心</h1>
      <el-button @click="goBack" type="primary">
        <el-icon><ArrowLeft /></el-icon>
        返回首页
      </el-button>
    </div>
    
    <div class="page-content">
      <el-row :gutter="20">
        <!-- 左侧：导航菜单 -->
        <el-col :span="6">
          <el-card class="help-nav">
            <el-menu
              :default-active="activeSection"
              @select="handleSectionSelect"
              class="help-menu"
            >
              <el-menu-item index="quick-start">
                <el-icon><VideoPlay /></el-icon>
                <span>快速开始</span>
              </el-menu-item>
              <el-menu-item index="faq">
                <el-icon><QuestionFilled /></el-icon>
                <span>常见问题</span>
              </el-menu-item>
              <el-menu-item index="user-guide">
                <el-icon><Document /></el-icon>
                <span>使用指南</span>
              </el-menu-item>
              <el-menu-item index="api-docs">
                <el-icon><Notebook /></el-icon>
                <span>API 文档</span>
              </el-menu-item>
              <el-menu-item index="contact">
                <el-icon><Service /></el-icon>
                <span>联系支持</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>
        
        <!-- 右侧：内容区域 -->
        <el-col :span="18">
          <el-card class="help-content">
            <!-- 快速开始 -->
            <div v-if="activeSection === 'quick-start'" class="content-section">
              <h2>快速开始</h2>
              <el-steps :active="2" direction="vertical">
                <el-step title="注册账号" description="创建您的智能阅卷系统账号">
                  <template #icon>
                    <el-icon><User /></el-icon>
                  </template>
                </el-step>
                <el-step title="上传文件" description="上传需要评分的考试文件">
                  <template #icon>
                    <el-icon><Upload /></el-icon>
                  </template>
                </el-step>
                <el-step title="配置评分" description="设置评分标准和 Prompt 模板">
                  <template #icon>
                    <el-icon><Setting /></el-icon>
                  </template>
                </el-step>
                <el-step title="开始评分" description="启动 AI 智能评分流程">
                  <template #icon>
                    <el-icon><VideoPlay /></el-icon>
                  </template>
                </el-step>
                <el-step title="查看结果" description="查看详细的评分报告和分析">
                  <template #icon>
                    <el-icon><DataAnalysis /></el-icon>
                  </template>
                </el-step>
              </el-steps>
              
              <div class="quick-actions">
                <h3>快速操作</h3>
                <el-button type="primary" @click="router.push('/uploading')">
                  <el-icon><Upload /></el-icon>
                  立即上传文件
                </el-button>
                <el-button @click="router.push('/grading')">
                  <el-icon><VideoPlay /></el-icon>
                  开始评分
                </el-button>
              </div>
            </div>
            
            <!-- 常见问题 -->
            <div v-if="activeSection === 'faq'" class="content-section">
              <h2>常见问题</h2>
              <el-collapse v-model="activeFaq">
                <el-collapse-item
                  v-for="faq in faqList"
                  :key="faq.id"
                  :title="faq.question"
                  :name="faq.id"
                >
                  <div v-html="faq.answer"></div>
                </el-collapse-item>
              </el-collapse>
            </div>
            
            <!-- 使用指南 -->
            <div v-if="activeSection === 'user-guide'" class="content-section">
              <h2>使用指南</h2>
              <el-tabs v-model="activeGuideTab">
                <el-tab-pane label="文件上传指南" name="upload">
                  <div class="guide-content">
                    <h3>支持的文件格式</h3>
                    <ul>
                      <li><strong>图片格式：</strong>JPG, PNG, GIF, BMP</li>
                      <li><strong>文档格式：</strong>PDF, DOC, DOCX, TXT</li>
                      <li><strong>表格格式：</strong>XLS, XLSX, CSV</li>
                    </ul>
                    
                    <h3>文件大小限制</h3>
                    <p>单个文件最大支持 500MB，批量上传最多支持 100 个文件。</p>
                    
                    <h3>上传步骤</h3>
                    <ol>
                      <li>点击"文件上传"菜单进入上传页面</li>
                      <li>拖拽文件到上传区域或点击选择文件</li>
                      <li>等待文件上传完成</li>
                      <li>确认文件信息无误后进行下一步</li>
                    </ol>
                  </div>
                </el-tab-pane>
                
                <el-tab-pane label="评分设置指南" name="scoring">
                  <div class="guide-content">
                    <h3>评分标准配置</h3>
                    <p>您可以根据不同的考试类型调整评分标准：</p>
                    <ul>
                      <li><strong>内容准确性：</strong>评估答案的正确性和准确度</li>
                      <li><strong>逻辑结构：</strong>评估答案的逻辑性和条理性</li>
                      <li><strong>语言表达：</strong>评估语言的流畅性和规范性</li>
                      <li><strong>创新性：</strong>评估答案的创新思路和独特见解</li>
                    </ul>
                    
                    <h3>Prompt 模板</h3>
                    <p>系统提供多种预设模板，您也可以自定义 Prompt 模板以适应特定的评分需求。</p>
                  </div>
                </el-tab-pane>
                
                <el-tab-pane label="结果分析指南" name="analysis">
                  <div class="guide-content">
                    <h3>评分报告解读</h3>
                    <ul>
                      <li><strong>总体评分：</strong>综合各项指标的最终得分</li>
                      <li><strong>分项得分：</strong>各个评分维度的详细得分</li>
                      <li><strong>评语分析：</strong>AI 生成的详细评语和建议</li>
                    </ul>
                    
                    <h3>数据导出</h3>
                    <p>支持将评分结果导出为 PDF、Excel 等格式，便于保存和分享。</p>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
            
            <!-- API 文档 -->
            <div v-if="activeSection === 'api-docs'" class="content-section">
              <h2>API 文档</h2>
              <div class="api-docs">
                <h3>基础信息</h3>
                <p><strong>Base URL:</strong> <code>https://api.example.com/v1</code></p>
                <p><strong>认证方式:</strong> Bearer Token</p>
                
                <h3>主要接口</h3>
                <el-table :data="apiList" style="width: 100%">
                  <el-table-column prop="method" label="方法" width="80" />
                  <el-table-column prop="endpoint" label="端点" width="200" />
                  <el-table-column prop="description" label="描述" />
                  <el-table-column label="操作" width="100">
                    <template #default="scope">
                      <el-button size="small" @click="showApiDetail(scope.row)">详情</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                
                <h3>示例代码</h3>
                <el-tabs v-model="activeCodeTab">
                  <el-tab-pane label="JavaScript" name="js">
                    <pre><code>// 上传文件
const formData = new FormData();
formData.append('file', file);

fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));</code></pre>
                  </el-tab-pane>
                  
                  <el-tab-pane label="Python" name="python">
                    <pre><code># 上传文件
import requests

url = 'https://api.example.com/v1/upload'
headers = {'Authorization': 'Bearer YOUR_TOKEN'}
files = {'file': open('exam.pdf', 'rb')}

response = requests.post(url, headers=headers, files=files)
print(response.json())</code></pre>
                  </el-tab-pane>
                  
                  <el-tab-pane label="cURL" name="curl">
                    <pre><code># 上传文件
curl -X POST \
  https://api.example.com/v1/upload \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -F 'file=@exam.pdf'</code></pre>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </div>
            
            <!-- 联系支持 -->
            <div v-if="activeSection === 'contact'" class="content-section">
              <h2>联系支持</h2>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-card class="contact-card">
                    <h3>在线客服</h3>
                    <p>工作时间：周一至周五 9:00-18:00</p>
                    <el-button type="primary" @click="openChat">
                      <el-icon><ChatDotRound /></el-icon>
                      开始对话
                    </el-button>
                  </el-card>
                </el-col>
                
                <el-col :span="12">
                  <el-card class="contact-card">
                    <h3>邮件支持</h3>
                    <p>support@example.com</p>
                    <p>我们会在 24 小时内回复您的邮件</p>
                    <el-button @click="sendEmail">
                      <el-icon><Message /></el-icon>
                      发送邮件
                    </el-button>
                  </el-card>
                </el-col>
              </el-row>
              
              <el-card style="margin-top: 20px;">
                <h3>提交反馈</h3>
                <el-form :model="feedbackForm" label-width="100px">
                  <el-form-item label="反馈类型">
                    <el-select v-model="feedbackForm.type" placeholder="请选择反馈类型">
                      <el-option label="功能建议" value="feature" />
                      <el-option label="问题反馈" value="bug" />
                      <el-option label="使用咨询" value="question" />
                      <el-option label="其他" value="other" />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="联系邮箱">
                    <el-input v-model="feedbackForm.email" placeholder="请输入您的邮箱" />
                  </el-form-item>
                  
                  <el-form-item label="反馈内容">
                    <el-input
                      v-model="feedbackForm.content"
                      type="textarea"
                      :rows="4"
                      placeholder="请详细描述您的问题或建议..."
                    />
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="submitFeedback">提交反馈</el-button>
                    <el-button @click="resetFeedback">重置</el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
    ArrowLeft,
    ChatDotRound,
    DataAnalysis,
    Document,
    Message,
    Notebook,
    QuestionFilled,
    Service,
    Setting,
    Upload,
    User,
    VideoPlay
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeSection = ref('quick-start')
const activeFaq = ref(['1'])
const activeGuideTab = ref('upload')
const activeCodeTab = ref('js')

// 反馈表单
const feedbackForm = ref({
  type: '',
  email: '',
  content: ''
})

// 常见问题列表
const faqList = ref([
  {
    id: '1',
    question: '系统支持哪些文件格式？',
    answer: '系统支持多种文件格式，包括：<br/>• 图片格式：JPG, PNG, GIF, BMP<br/>• 文档格式：PDF, DOC, DOCX, TXT<br/>• 表格格式：XLS, XLSX, CSV'
  },
  {
    id: '2',
    question: '单次可以上传多少个文件？',
    answer: '单次最多可以上传 100 个文件，每个文件大小不超过 500MB。如需处理更多文件，建议分批上传。'
  },
  {
    id: '3',
    question: '评分结果的准确性如何？',
    answer: '我们的 AI 评分系统基于先进的自然语言处理技术，准确率可达 90% 以上。同时支持人工复核和调整，确保评分的公正性和准确性。'
  },
  {
    id: '4',
    question: '如何自定义评分标准？',
    answer: '您可以在"Prompt 设置"页面中：<br/>• 调整各项评分权重<br/>• 选择评分严格程度<br/>• 自定义 Prompt 模板<br/>• 使用预设的学科模板'
  },
  {
    id: '5',
    question: '评分数据是否安全？',
    answer: '我们采用企业级安全措施保护您的数据：<br/>• 数据传输采用 HTTPS 加密<br/>• 服务器存储采用 AES-256 加密<br/>• 定期进行安全审计<br/>• 支持数据删除和导出'
  },
  {
    id: '6',
    question: '系统是否支持批量处理？',
    answer: '是的，系统支持批量处理功能。您可以一次性上传多个文件，系统会自动进行批量评分，大大提高工作效率。'
  }
])

// API 接口列表
const apiList = ref([
  { method: 'POST', endpoint: '/upload', description: '上传文件' },
  { method: 'POST', endpoint: '/grade', description: '开始评分' },
  { method: 'GET', endpoint: '/result/{id}', description: '获取评分结果' },
  { method: 'GET', endpoint: '/history', description: '获取历史记录' },
  { method: 'POST', endpoint: '/settings', description: '更新设置' }
])

const goBack = () => {
  router.push('/')
}

const handleSectionSelect = (key: string) => {
  activeSection.value = key
}

const showApiDetail = (api: any) => {
  ElMessage.info(`查看 ${api.endpoint} 接口详情`)
}

const openChat = () => {
  ElMessage.info('正在连接在线客服...')
}

const sendEmail = () => {
  ElMessage.info('正在打开邮件客户端...')
}

const submitFeedback = () => {
  if (!feedbackForm.value.type || !feedbackForm.value.email || !feedbackForm.value.content) {
    ElMessage.warning('请填写完整的反馈信息')
    return
  }
  ElMessage.success('反馈提交成功，我们会尽快处理您的反馈')
  resetFeedback()
}

const resetFeedback = () => {
  feedbackForm.value = {
    type: '',
    email: '',
    content: ''
  }
}
</script>

<style scoped>
.help-page {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.help-nav {
  height: fit-content;
}

.help-menu {
  border: none;
}

.help-content {
  min-height: 600px;
}

.content-section h2 {
  color: #409eff;
  margin-bottom: 20px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.quick-actions {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.quick-actions h3 {
  margin-bottom: 15px;
  color: #409eff;
}

.guide-content {
  line-height: 1.6;
}

.guide-content h3 {
  color: #409eff;
  margin-top: 20px;
  margin-bottom: 10px;
}

.guide-content ul, .guide-content ol {
  margin-left: 20px;
}

.guide-content li {
  margin-bottom: 5px;
}

.api-docs pre {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
}

.api-docs code {
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.contact-card {
  text-align: center;
  margin-bottom: 20px;
}

.contact-card h3 {
  color: #409eff;
  margin-bottom: 15px;
}

.contact-card p {
  color: #666;
  margin-bottom: 15px;
}
</style>
