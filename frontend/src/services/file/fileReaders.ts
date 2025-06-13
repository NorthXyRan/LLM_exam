import { ElMessage, ElMessageBox } from 'element-plus'
import mammoth from 'mammoth'

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
 * 获取保存目录
 * 每次都重新选择目录
 * @returns {Promise<any>} 保存目录句柄
 */
export async function getSaveDirectory(): Promise<any> {
  if (!('showDirectoryPicker' in window)) {
    throw new Error('当前浏览器不支持文件系统API')
  }

  try {
    const directoryHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
    console.log('✅ 选择保存目录成功')
    return directoryHandle
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error('用户取消了目录选择')
    }
    throw new Error('选择保存目录失败: ' + (error as Error).message)
  }
}

/**
 * 询问用户是否要保存AI解析结果
 * @param {any} result - AI解析的结果对象
 * @param {string} originalFileName - 原始文件名
 * @param {string} type - 文件类型 ('paper' | 'answer')
 */
export async function askToSaveJsonResult(
  result: any,
  originalFileName: string,
  type: 'paper' | 'answer',
): Promise<void> {
  // 如果原始文件就是JSON格式，不需要保存
  if (originalFileName.toLowerCase().endsWith('.json')) {
    console.log('📁 原始文件为JSON格式，跳过保存')
    return
  }

  // 检查浏览器支持
  if (!('showDirectoryPicker' in window)) {
    console.log('🌐 当前浏览器不支持文件保存功能')
    return
  }

  try {
    // 询问用户是否要保存
    await ElMessageBox.confirm(
      `AI已成功解析${type === 'paper' ? '试卷' : '参考答案'}，是否保存解析结果到本地？`,
      '保存解析结果',
      {
        confirmButtonText: '保存',
        cancelButtonText: '跳过',
        type: 'info',
      }
    )

    // 用户确认保存，执行保存操作
    await saveJsonResultDirectly(result, originalFileName, type)
  } catch (error) {
    if (error === 'cancel') {
      console.log('👤 用户选择跳过保存')
    } else {
      console.warn('保存过程出错:', error)
    }
  }
}

/**
 * 直接保存AI解析结果到本地文件（内部使用）
 * @param {any} result - AI解析的结果对象
 * @param {string} originalFileName - 原始文件名
 * @param {string} type - 文件类型 ('paper' | 'answer')
 */
async function saveJsonResultDirectly(
  result: any,
  originalFileName: string,
  type: 'paper' | 'answer',
): Promise<void> {
  try {
    const saveDirectory = await getSaveDirectory()
    
    // 生成JSON文件名：原文件名.json
    const baseName = originalFileName.replace(/\.[^/.]+$/, '') // 移除原扩展名
    const jsonFileName = `${baseName}.json`

    const fileHandle = await saveDirectory.getFileHandle(jsonFileName, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(JSON.stringify(result, null, 2))
    await writable.close()

    ElMessage.success(`AI解析结果已保存到 ${jsonFileName}`)
    console.log(`✅ AI解析结果已保存: ${jsonFileName}`)
  } catch (error) {
    console.warn('保存解析结果失败:', error)
    ElMessage.warning('保存解析结果失败: ' + (error as Error).message)
    throw error
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