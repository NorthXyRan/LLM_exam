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
upload/
├── UploadingPage.vue         # 主上传页面（父组件）
└── upload/
    ├── PaperUpload.vue       # 试卷上传组件
    ├── AnswerUpload.vue      # 参考答案上传组件
    └── StudentUpload.vue     # 学生答卷上传组件
```

### 主要功能

* **试卷上传** ：支持试卷文件上传和自动解析
* **参考答案上传** ：支持参考答案上传和题目匹配验证
* **学生答卷批量上传** ：支持多文件批量上传和解析
* **重置功能** ：一键重置所有上传状态

### 上传流程

1. **第一步** ：上传试卷文件 → 系统自动解析试卷结构
2. **第二步** ：上传参考答案 → 系统验证与试卷的匹配度
3. **第三步** ：批量上传学生答卷 → 系统解析并验证完整性
4. **完成** ：所有文件上传完成，可进入批改流程

### 限制说明

1. **文件依赖** : 参考答案上传需要先上传试卷
2. **学生答卷上传** : 需要试卷和参考答案都上传完成
3. **文件格式**

## 评分组件

```
grading/
├── Grading.vue          # 主组件
└── grading/
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

prompt输入框
