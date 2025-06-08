<template>
  <div class="uploading-container">
    <!-- Paper Upload Component -->
    <PaperUpload
      :exam-paper="examPaper"
      @paper-uploaded="handlePaperUploaded"
      @paper-removed="handlePaperRemoved"
      @preview-paper="handlePreviewPaper"
      @reparse-paper="handleReparsePaper"
    />

    <!-- Answer Upload Component -->
    <AnswerUpload
      :reference-answer="referenceAnswer"
      :exam-paper="examPaper"
      :disabled="!examPaper.name"
      @answer-uploaded="handleAnswerUploaded"
      @answer-removed="handleAnswerRemoved"
      @preview-answer="handlePreviewAnswer"
      @edit-answer="handleEditAnswer"
    />

    <!-- Student Upload Component -->
    <StudentUpload
      :student-papers="studentPapers"
      :parsing="parsing"
      :disabled="!canUploadStudentPapers"
      :exam-paper="examPaper"
      @papers-uploaded="handleStudentPapersUploaded"
      @reparse-paper="handleReParseStudentPaper"
    />

    <!-- 独立的重置按钮 -->
    <div class="reset-button-container">
      <el-button type="danger" @click="resetAll">Reset</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref } from 'vue'
import AnswerUpload from './upload/AnswerUpload.vue'
import PaperUpload from './upload/PaperUpload.vue'
import StudentUpload from './upload/StudentUpload.vue'
import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'
// 设置PDF.js的worker路径
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

// 试卷相关数据
const examPaper = ref({
  name: '',
  status: '',
  questionCount: 0
})

// 参考答案相关数据
const referenceAnswer = ref({
  name: '',
  status: '',
  matched: false,
  answerCount: 0
})

// 学生答卷相关数据
interface StudentPaper {
  id: number
  filename: string
  valid: boolean
  questionCount: number
  error: string
}

const studentPapers = ref<StudentPaper[]>([])
const parsing = ref(false)

// 计算属性
const canUploadStudentPapers = computed(() => {
  return examPaper.value.status === 'ready' && referenceAnswer.value.status === 'ready'
})

// Paper 相关事件处理
const readFileContent = (file:File):Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileName = file.name.toLowerCase()

    if (fileName.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read txt file'))
      reader.readAsText(file, 'utf-8')

    } else if (fileName.endsWith('.docx')) {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer
          const result = await mammoth.extractRawText({ arrayBuffer })

          if (result.messages.length > 0) {
            console.warn('DOCX解析警告:', result.messages)
          }

          resolve(result.value)
        } catch (error) {
          reject(new Error('Failed to parse docx file: ' + (error as Error).message))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read docx file'))
      reader.readAsArrayBuffer(file)

    } else if (fileName.endsWith('.pdf')) {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer
          const uint8Array = new Uint8Array(arrayBuffer)

          // 现在可以正常使用worker了
          const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise
          let fullText = ''

          ElMessage.info(`开始解析PDF文件，共${pdf.numPages}页...`)

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()

            const pageText = textContent.items
              .map((item: any) => {
                if ('str' in item) {
                  return item.str
                }
                return ''
              })
              .join(' ')

            fullText += `\n=== 第${i}页 ===\n${pageText}\n`

            // 显示进度
            if (pdf.numPages > 5 && i % 3 === 0) {
              ElMessage.info(`已处理 ${i}/${pdf.numPages} 页`)
            }
          }

          if (!fullText.trim()) {
            throw new Error('PDF文件中没有找到可提取的文本内容')
          }

          console.log(`PDF解析完成，提取文本长度: ${fullText.length}`)
          resolve(fullText)
        } catch (error) {
          reject(new Error('Failed to parse PDF file: ' + (error as Error).message))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read PDF file'))
      reader.readAsArrayBuffer(file)

    } else {
      reject(new Error('不支持的文件格式，请上传.txt、.docx或.pdf文件'))
    }
  })
}

const parseQuestionCount = async (content: string, splitDirHandle?: any): Promise<number> => {
  try {
    ElMessage.info('正在调用大模型分析试卷...')

    // 1. 构造发送给大模型的prompt
    const prompt = `
请分析以下试卷内容, 并返回一个JSON格式的结果, 题目数量和题目内容：

试卷内容：
${content}

请按照以下格式返回JSON:
{
  "questionCount": 题目总数,
  "questions": [
    {
      "question_id": 题号,
      "question": "题目内容",
      "score": 分值
    }
  ]
}

重要:只返回JSON数据,不要任何额外的文字说明。
    `

    // 2. 调用大模型API (这里以OpenAI为例，你需要替换为实际的API)
    const response = await fetch('https://api.gpt.ge/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-kQNsaC7f0VrwxsrM53841bAeFe3f4e8dAe7f05109aA6F655`
      },
      body: JSON.stringify({
        model: "gpt-4o-all",  // 使用支持文件分析的模型
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1688,
        temperature: 0.1,
        stream: false
      })
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('详细错误:', errorText)
      throw new Error(`API调用失败: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('API返回结果:', result)

    let analysisResult = result.choices[0].message.content
    console.log('原始返回内容:', analysisResult)

    // 清理和提取JSON部分
    let parsedResult
    try {
      // 方法1: 直接解析
      parsedResult = JSON.parse(analysisResult)
    } catch (e) {
      try {
        // 方法2: 提取JSON部分
        // 查找第一个 { 和最后一个 }
        const jsonStart = analysisResult.indexOf('{')
        const jsonEnd = analysisResult.lastIndexOf('}')

        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const jsonStr = analysisResult.substring(jsonStart, jsonEnd + 1)
          console.log('提取的JSON:', jsonStr)
          parsedResult = JSON.parse(jsonStr)
        } else {
          throw new Error('未找到有效的JSON格式')
        }
      } catch (e2) {
        // 方法3: 使用正则表达式提取
        const jsonMatch = analysisResult.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          console.log('正则提取的JSON:', jsonMatch[0])
          parsedResult = JSON.parse(jsonMatch[0])
        } else {
          // 如果都失败，创建默认结果
          console.log('JSON解析失败，使用默认结果')
          parsedResult = {
            questionCount: 3,
            questions: [
              { question_id: 1, question: "解析失败的题目1", score: 10 },
              { question_id: 2, question: "解析失败的题目2", score: 15 },
              { question_id: 3, question: "解析失败的题目3", score: 20 }
            ],
            rawResponse: analysisResult  // 保存原始响应用于调试
          }
        }
      }
    }

    console.log('解析后的结果:', parsedResult)

    // 保存JSON到paper/split目录
    if (splitDirHandle) {
      const jsonFileName = `analysis.json`
      const fileHandle = await splitDirHandle.getFileHandle(jsonFileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(JSON.stringify(parsedResult, null, 2))
      await writable.close()

      ElMessage.success(`分析结果已保存到 paper/split/${jsonFileName}`)
    }

    return parsedResult.questionCount || 3

  } catch (error) {
    console.error('大模型分析失败:', error)
    ElMessage.error('大模型分析失败: ' + (error as Error).message)
    return 5
  }
}

const handlePaperUploaded = async(uploadFile: any) => {
  try{
    ElMessage.info('开始解析试卷...')

    const file = uploadFile.raw || uploadFile
    if (!file || !(file instanceof File)) {
      throw new Error('无效的文件对象')
    }

    // 检查文件类型
    const fileName = file.name.toLowerCase()
    const supportedTypes = ['.txt', '.docx', '.pdf']
    const isSupported = supportedTypes.some(type => fileName.endsWith(type))

    if (!isSupported) {
      throw new Error('不支持的文件格式，请上传.txt、.docx或.pdf文件')
    }

    // 显示文件类型信息
    let fileType = 'TXT'
    if (fileName.endsWith('.docx')) fileType = 'DOCX'
    else if (fileName.endsWith('.pdf')) fileType = 'PDF'

    ElMessage.info(`正在解析${fileType}文件，请稍候...`)

    const content = await readFileContent(file);

    // 检查解析后的内容
    if (!content || content.trim().length === 0) {
      throw new Error('文件内容为空或解析失败')
    }

    console.log(`${fileType}文件解析成功，内容长度:`, content.length)

    let splitDirHandle = null;

    if ('showDirectoryPicker' in window) {
      const rootDirHandle = await (window as any).showDirectoryPicker({mode:'readwrite'});
      const paperDirHandle = await rootDirHandle.getDirectoryHandle('paper', { create: true });
      const sourceDirHandle = await paperDirHandle.getDirectoryHandle('source', { create: true });
      splitDirHandle = await paperDirHandle.getDirectoryHandle('split', { create: true });

      // 保存原始文件和解析后的文本
      const originalFileHandle = await sourceDirHandle.getFileHandle(`original_${file.name}`, { create: true });
      const originalWritable = await originalFileHandle.createWritable();
      await originalWritable.write(file);
      await originalWritable.close();

      const textFileHandle = await sourceDirHandle.getFileHandle(`parsed_${file.name}.txt`, { create: true });
      const textWritable = await textFileHandle.createWritable();
      await textWritable.write(content);
      await textWritable.close();

      ElMessage.success(`${fileType}文件解析成功！原始文件和解析文本已保存`);
    } else {
      ElMessage.warning('浏览器不支持目录选择API,无法保存文件');
    }

    const questionCount = await parseQuestionCount(content, splitDirHandle);

    examPaper.value = {
      name: file.name,
      status: 'ready',
      questionCount: questionCount
    };

  }catch(error){
    console.error(error)
    ElMessage.error('试卷解析失败: ' + (error as Error).message)
  }
}

const handlePaperRemoved = () => {
  examPaper.value = {
    name: '',
    status: '',
    questionCount: 0
  }
  resetAnswerAndStudents()
  ElMessage.info('已移除试卷文件')
}

const handlePreviewPaper = () => {
  ElMessage.info('打开试卷预览')
}

const handleReparsePaper = () => {
  ElMessage.info('重新解析试卷')
}

// Answer 相关事件处理
const handleAnswerUploaded = (file: File) => {
  ElMessage.info('开始解析参考答案...')
  setTimeout(() => {
    const matched = Math.random() > 0.3
    referenceAnswer.value = {
      name: file.name,
      status: 'ready',
      matched: matched,
      answerCount: matched ? examPaper.value.questionCount : examPaper.value.questionCount - 1
    }
    studentPapers.value = []
    if (matched) {
      ElMessage.success('参考答案解析完成，与试卷匹配！')
    } else {
      ElMessage.warning('参考答案解析完成，但与试卷题目不完全匹配！')
    }
  }, 2000)
}

const handleAnswerRemoved = () => {
  referenceAnswer.value = {
    name: '',
    status: '',
    matched: false,
    answerCount: 0
  }
  studentPapers.value = []
  ElMessage.info('已移除答案文件')
}

const handlePreviewAnswer = () => {
  ElMessage.info('打开答案预览')
}

const handleEditAnswer = () => {
  ElMessage.info('打开答案编辑')
}

// Student 相关事件处理
const handleStudentPapersUploaded = (fileList: File[]) => {
  parsing.value = true
  ElMessage.info('开始解析学生答卷...')

  setTimeout(() => {
    const newPapers = fileList.map((f: File, index: number) => ({
      id: Date.now() + index,
      filename: f.name,
      valid: Math.random() > 0.2,
      questionCount: examPaper.value.questionCount,
      error: Math.random() > 0.2 ? '' : '缺少第2题'
    }))

    studentPapers.value = newPapers
    parsing.value = false

    const validCount = newPapers.filter((p: any) => p.valid).length
    ElMessage.success(`学生答卷解析完成！成功解析 ${validCount}/${newPapers.length} 份`)
  }, 3000)
}

const handleReParseStudentPaper = (paper: any) => {
  ElMessage.info(`重新解析 ${paper.filename}`)
}

// 合并重置方法
const resetAnswerAndStudents = () => {
  referenceAnswer.value = {
    name: '',
    status: '',
    matched: false,
    answerCount: 0
  }
  studentPapers.value = []
}

// 全部重置
const resetAll = () => {
  ElMessageBox.confirm('确定要重置所有设置吗？', '确认重置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    examPaper.value = { name: '', status: '', questionCount: 0 }
    resetAnswerAndStudents()
    ElMessage.success('已重置所有设置')
  })
}
</script>

<style scoped>
.uploading-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 重置按钮容器 */
.reset-button-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 自定义重置按钮样式 */
.reset-button-container :deep(.el-button--danger) {
  background-color: #f97069;
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  min-height: 48px;
  transition: all 0.2s ease;
}

.reset-button-container :deep(.el-button--danger:hover) {
  background-color: #ff2d20;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
}

.reset-button-container :deep(.el-button--danger:active) {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .uploading-container {
    max-width: 100%;
    padding: 16px;
    gap: 20px;
  }

  .reset-button-container {
    margin-top: 24px;
  }
}

@media (max-width: 480px) {
  .uploading-container {
    padding: 12px;
    gap: 16px;
  }

  .reset-button-container {
    margin-top: 20px;
  }
}
</style>