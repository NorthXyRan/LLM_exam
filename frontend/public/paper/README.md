# 试卷管理说明

## 目录结构

```
paper/
├── config.json          # 试卷配置文件
├── example1/            # 示例试卷
│   ├── paper.json       # 题目信息（支持多个题目）
│   └── answer.json      # 参考答案（对应多个题目）
└── README.md           # 说明文档
```

## 文件格式

### paper.json - 支持多个题目

可以包含单个题目或多个题目的数组：

**多个题目格式（推荐）：**

```json
[
  {
    "question_id": "q1",
    "question": "第一题内容",
    "score": 8
  },
  {
    "question_id": "q2",
    "question": "第二题内容",
    "score": 10
  }
]
```

**单个题目格式：**

```json
{
  "question_id": "q1",
  "question": "题目内容",
  "score": 8
}
```

### answer.json - 对应的参考答案

格式需要与 paper.json 保持一致：

**多个答案格式：**

```json
[
  {
    "question_id": "q1",
    "answer": "第一题的参考答案"
  },
  {
    "question_id": "q2",
    "answer": "第二题的参考答案"
  }
]
```

**单个答案格式：**

```json
{
  "question_id": "q1",
  "answer": "参考答案内容"
}
```

## 添加新试卷

### 1. 创建试卷目录

在 `paper/` 目录下创建新的试卷目录，例如 `exam2024/`

### 2. 创建 paper.json 文件

在试卷目录中创建包含多个题目的 `paper.json` 文件

### 3. 创建 answer.json 文件（可选）

在试卷目录中创建对应的 `answer.json` 文件

### 4. 更新配置文件

在 `config.json` 文件中添加新试卷的配置：

```json
{
  "papers": [
    {
      "directory": "exam2024",
      "name": "2024年期末考试",
      "description": "数值分析期末考试"
    }
  ]
}
```

## 添加新题目到现有试卷

### 1. 编辑 paper.json

在现有的题目数组中添加新题目：

```json
[
  // ... 现有题目 ...
  {
    "question_id": "q3",
    "question": "新题目内容",
    "score": 12
  }
]
```

### 2. 编辑 answer.json

添加对应的参考答案：

```json
[
  // ... 现有答案 ...
  {
    "question_id": "q3",
    "answer": "新题目的参考答案"
  }
]
```

## 字段说明

### paper.json

- `question_id`: 题目唯一标识符（在同一试卷内唯一）
- `question`: 题目内容
- `score`: 题目分值

### answer.json

- `question_id`: 对应的题目标识符
- `answer`: 参考答案内容

### config.json

- `directory`: 试卷目录名
- `name`: 试卷显示名称
- `description`: 试卷描述（可选）

## 注意事项

1. 确保 `question_id` 在 `paper.json` 和 `answer.json` 中保持一致
2. 同一试卷内的 `question_id` 应该是唯一的
3. 系统会自动将题目显示为"第1题"、"第2题"等
4. 如果某个题目没有对应的参考答案，系统会显示"暂无参考答案"
5. 支持单个题目和多个题目两种格式，系统会自动识别
