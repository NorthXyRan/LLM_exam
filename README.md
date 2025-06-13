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
├── Uploading.vue              # 主容器组件 (核心业务逻辑)
├── BaseUpload.vue             # 基础上传组件 (通用UI)
├── PaperUpload.vue            # 试卷上传组件 (事件转发)
├── AnswerUpload.vue           # 参考答案上传组件 (事件转发)
├── StudentUpload.vue          # 学生答案上传组件 (事件转发)
└── Preview.vue                # 预览弹窗组件 (内容展示)



services/llm/
├── index.ts                    # 统一导出
├── upload/
│   ├── uploadLLMService.ts     # AI解析服务
│   └── uploadPrompts.ts        # Prompt模板

```

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
