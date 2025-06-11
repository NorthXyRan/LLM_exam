import { ElMessage } from 'element-plus'
import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// 配置PDF.js工作线程
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

// 数据类型定义
interface PaperData {
  questionCount: number
  questions: Array<{
    question_id: number
    question: string
    score: number
  }>
}

interface AnswerData {
  answerCount: number
  answers: Array<{
    question_id: number
    answer: string
  }>
}

interface StudentAnswerItem {
  student_id: number
  question_id: number
  answer: string
}

// 全局保存目录引用
let globalSaveDirectory: any = null

/**
 * 文件读取器集合
 */
export const fileReaders = {
  // 读取文本文件
  async readText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file, 'utf-8')
    })
  },

  // 读取DOCX文件
  async readDocx(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: reader.result as ArrayBuffer })
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
    })
  },

  // 读取PDF文件
  async readPdf(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const uint8Array = new Uint8Array(reader.result as ArrayBuffer)
          const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise
          let fullText = ''

          ElMessage.info(`开始解析PDF文件，共${pdf.numPages}页...`)

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map((item: any) => item.str || '').join(' ')
            fullText += `\n=== 第${i}页 ===\n${pageText}\n`

            if (pdf.numPages > 5 && i % 3 === 0) {
              ElMessage.info(`已处理 ${i}/${pdf.numPages} 页`)
            }
          }

          if (!fullText.trim()) {
            throw new Error('PDF文件中没有找到可提取的文本内容')
          }

          resolve(fullText)
        } catch (error) {
          reject(new Error('Failed to parse PDF file: ' + (error as Error).message))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read PDF file'))
      reader.readAsArrayBuffer(file)
    })
  },
}

/**
 * 根据文件扩展名读取文件内容
 * @param {File} file - 要读取的文件
 * @returns {Promise<string>} 文件内容
 */
export async function readFileContent(file: File): Promise<string> {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.txt') || fileName.endsWith('.json')) {
    return await fileReaders.readText(file)
  } else if (fileName.endsWith('.docx')) {
    return await fileReaders.readDocx(file)
  } else if (fileName.endsWith('.pdf')) {
    return await fileReaders.readPdf(file)
  } else {
    throw new Error('不支持的文件格式')
  }
}

/**
 * 验证JSON数据格式
 * @param {any} jsonData - JSON数据
 * @param {string} type - 数据类型 ('paper', 'answer', 'student')
 * @returns {boolean} 验证结果
 */
export function validateJsonData(jsonData: any, type: 'paper' | 'answer' | 'student'): boolean {
  switch (type) {
    case 'paper':
      if (!jsonData.questions || !Array.isArray(jsonData.questions)) {
        throw new Error('试卷文件格式错误：需要包含 questions 数组')
      }
      for (const question of jsonData.questions) {
        if (!question.question_id || !question.question || question.score === undefined) {
          throw new Error('试卷数据格式错误：缺少必要字段 question_id、question 或 score')
        }
      }
      break

    case 'answer':
      if (!jsonData.answers || !Array.isArray(jsonData.answers)) {
        throw new Error('参考答案文件格式错误：需要包含 answers 数组')
      }
      for (const answer of jsonData.answers) {
        if (!answer.question_id || !answer.answer) {
          throw new Error('参考答案数据格式错误：缺少必要字段 question_id 或 answer')
        }
      }
      break

    case 'student':
      if (!Array.isArray(jsonData)) {
        throw new Error('学生答案文件格式错误：需要是数组格式')
      }
      if (jsonData.length === 0) {
        throw new Error('学生答案数据为空')
      }
      const sampleItem = jsonData[0]
      if (!sampleItem.student_id || !sampleItem.question_id || sampleItem.answer === undefined) {
        throw new Error('学生答案数据格式错误：需要包含 student_id、question_id 和 answer 字段')
      }
      break

    default:
      throw new Error('未知的数据类型')
  }
  return true
}

/**
 * 获取或创建保存目录（全局单例）
 * @returns {Promise<any>} 保存目录句柄
 */
export async function getSaveDirectory(): Promise<any> {
  if (globalSaveDirectory) return globalSaveDirectory

  if (!('showDirectoryPicker' in window)) {
    console.warn('当前浏览器不支持文件系统API，无法保存解析结果')
    return null
  }

  try {
    const directoryHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
    const examDirectory = await directoryHandle.getDirectoryHandle('LLM_Exam_Papers', {
      create: true,
    })
    globalSaveDirectory = examDirectory
    console.log('✅ 创建保存目录成功: LLM_Exam_Papers')
    return examDirectory
  } catch (error) {
    console.warn('创建保存目录失败:', error)
    return null
  }
}

/**
 * 保存AI解析结果到本地文件
 * 仅在文件不是JSON格式时才保存（避免重复保存）
 * @param {any} result - AI解析的结果对象
 * @param {string} originalFileName - 原始文件名
 * @param {string} type - 文件类型 ('paper' | 'answer')
 */
export async function saveJsonResult(
  result: any,
  originalFileName: string,
  type: 'paper' | 'answer',
): Promise<void> {
  // 如果原始文件就是JSON格式，不需要保存
  if (originalFileName.toLowerCase().endsWith('.json')) {
    console.log('📁 原始文件为JSON格式，跳过保存')
    return
  }

  const saveDirectory = await getSaveDirectory()
  if (!saveDirectory) return

  try {
    // 根据类型生成文件名
    const jsonFileName =
      type === 'paper' ? `paper_parsed_${Date.now()}.json` : `answer_parsed_${Date.now()}.json`

    const fileHandle = await saveDirectory.getFileHandle(jsonFileName, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(JSON.stringify(result, null, 2))
    await writable.close()

    ElMessage.success(`AI解析结果已保存到 ${jsonFileName}`)
    console.log(`✅ AI解析结果已保存: ${jsonFileName}`)
  } catch (error) {
    console.warn('保存解析结果失败:', error)
    ElMessage.warning('保存解析结果失败，但不影响使用')
  }
}

/**
 * 判断文件是否为JSON格式
 * @param {string} fileName - 文件名
 * @returns {boolean} 是否为JSON文件
 */
export function isJsonFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.json')
}
