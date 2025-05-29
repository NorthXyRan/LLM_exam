<template>
  <div class="uploading-page">
    <div class="page-header">
      <h1>文件上传</h1>
      <el-button @click="goBack" type="primary">
        <el-icon><ArrowLeft /></el-icon>
        返回首页
      </el-button>
    </div>
    
    <div class="page-content">
      <el-card>
        <h2>上传考试文件</h2>
        <p>请选择要上传的考试文件进行智能评分</p>
        
        <!-- 这里可以添加文件上传组件 -->
        <el-upload
          class="upload-demo"
          drag
          action="#"
          multiple
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 jpg/png/pdf/doc/docx 文件，且不超过 500MB
            </div>
          </template>
        </el-upload>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, UploadFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.uploading-page {
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

.upload-demo {
  margin-top: 20px;
}
</style>
