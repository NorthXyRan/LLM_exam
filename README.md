# LLM_exam

## How to start ？？？

```
npm install
```

```
cd frontend && npm run dev
```

## 布局组件

```
layout/
├── MainLayout.vue          # 主布局（只管布局和状态）
├── AppHeader.vue           # 头部组件
├── AppSidebar.vue          # 侧边栏组件
└── menuConfig.ts           # 菜单配置文件
```

## 上传组件

```
src/components/upload/
├── Uploading.vue              # 主上传容器组件
├── BaseUpload.vue             # 基础上传组件模板（所有上传组件的统一UI基础）
├── fileReaders.ts             # 共享文件读取和验证工具
│   ├── readFileContent()      # 统一文件读取函数（支持TXT/JSON/DOCX/PDF）
│   ├── validateJsonData()     # 数据格式验证函数
│   └── fileReaders object     # 文件读取器集合
├── PaperUpload.vue            # 试卷上传组件（含AI解析功能）
├── AnswerUpload.vue           # 参考答案上传组件（含AI解析功能）
├── StudentUpload.vue          # 学生答案上传组件
└── preview.vue                # 试卷预览弹窗组件

```

### Uploading 组件数据流

#### 1. 数据流架构

```
文件上传 → 文件读取 → AI解析/直接解析 → 数据验证 → Store存储 → 本地持久化
   ↓           ↓           ↓              ↓          ↓           ↓
子组件    fileReaders   OpenAI API    validate   Pinia      localStorage
   ↓           ↓           ↓              ↓          ↓           ↓
事件触发   统一读取函数   智能解析      JSON验证   状态管理    持久化存储
```

#### 2. 文件处理策略

- **JSON 文件**: 直接解析，跳过 AI 处理，不重复保存
- **其他格式** (TXT/DOCX/PDF): AI 解析 → 保存解析结果到本地 （PDF 效果较差）

#### 3. 数据存储位置

**Pinia Store (内存状态)**

```javascript
// examDataStore (src/stores/examData.ts)
examData: {
  questions: [],        // 试卷题目数据
  referenceAnswers: [], // 参考答案数据
  studentAnswers: []    // 学生答案数据
}

// uploadStatusStore (src/stores/uploadStatus.ts)
uploadStatus: {
  examPaper: { name, status, questionCount, content },
  referenceAnswer: { name, status, answerCount },
  studentAnswers: { name, studentCount, answerCount }
}
```

**本地文件系统** (AI 解析结果)

```
/saved_files/
├── paper.json     # 试卷AI解析结果
├── answer.json    # 答案AI解析结果
└── ...
```

**LocalStorage** (持久化)

```javascript
localStorage.getItem("examData"); // 考试数据持久化
localStorage.getItem("uploadStatus"); // 上传状态持久化
```

#### 4. 数据传递链路

**试卷上传流程**

```
PaperUpload.vue → handleFileUpload() → readFileContent() → processPaperData()
    ↓
AI解析(非JSON) / 直接解析(JSON) → validateJsonData() → emit('paper-uploaded')
    ↓
Uploading.vue → handlePaperUploaded() → examDataStore.setQuestions()
    ↓
uploadStatusStore.setPaperStatus() → saveToLocal()
```

**参考答案上传流程**

```
AnswerUpload.vue → handleFileUpload() → readFileContent() → processAnswerData()
    ↓
AI解析(非JSON) / 直接解析(JSON) → validateJsonData() → emit('answer-uploaded')
    ↓
Uploading.vue → handleAnswerUploaded() → examDataStore.updateReferenceAnswers()
    ↓
uploadStatusStore.setReferenceAnswerStatus() → saveToLocal()
```

**学生答案上传流程**

```
StudentUpload.vue → handleFileUpload() → readFileContent() → validateJsonData()
    ↓
emit('papers-uploaded') → Uploading.vue → handleStudentPapersUploaded()
    ↓
examDataStore.setStudentAnswers() → uploadStatusStore.setStudentAnswersStatus() → saveToLocal()
```

#### 5. 错误状态处理

**上传失败时的数据保存**

```javascript
uploadState = {
  fileName: "文件名",
  hasError: true,
  errorMessage: "错误信息",
  isSuccess: false,
  rawContent: "原始文件内容", // 关键：保存原始内容用于预览
};
```

**预览功能** - 成功/失败状态都可预览

```javascript
// 成功状态：预览处理后的JSON数据
handlePreview() → emit('preview-*') → previewDialog显示

// 失败状态：预览原始文件内容
handlePreview(errorData) → emit('preview-*', errorData) → previewDialog显示原始内容
```

#### 6. 关键工具函数

**fileReaders.ts**

```javascript
readFileContent(file); // 统一文件读取入口
validateJsonData(data, type); // JSON数据格式验证
saveJsonResult(data, filename, type); // 智能保存策略
isJsonFile(filename); // 文件格式判断
getSaveDirectory(); // 保存目录管理
```

#### 7. 开发要点

- **统一架构**: 所有上传组件继承 BaseUpload.vue
- **智能保存**: JSON 文件不重复保存，其他格式保存 AI 解析结果
- **错误兼容**: 上传失败也能预览原始文件内容
- **状态管理**: Pinia + localStorage 双重持久化
- **类型安全**: 完整 TypeScript 类型定义

## 评分组件

```
grading/
├── Grading.vue          # 主组件
├── GradingHeader.vue    # 头部组件
├── ScoringSection.vue   # 评分组件
├── ActionSection.vue    # 操作组件
├── HighlightToolbar.vue # 工具栏组件
├── PaperPreview.vue     # 预览组件
├── ReferenceAnswer.vue  # 参考答案组件
└── FeedbackPanel.vue    # 反馈组件
```

## 结果组件

```
Result.vue (父组件，当前为空：后续路由设置？)
├── ReportPage.vue - 评分报告页面
├── AnalysisPage.vue - 详细分析页面
└── PaperViewer.vue - 试卷查看器（弹窗）
```

## prompt 组件

prompt 输入框
