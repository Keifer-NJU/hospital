<template>
  <div class="task-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">{{ task?.name || '任务详情' }}</h2>
        <span class="task-id">任务ID: {{ $route.params.id }}</span>
      </div>
      <div class="header-right">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回任务列表
        </el-button>
      </div>
    </div>

    <!-- 步骤条 -->
    <div class="steps-container" v-if="task">
      <div class="custom-steps">
        <div class="step-item" :class="getStepItemClass('VALIDATE')">
          <div class="step-icon" :class="getStepIconClass('VALIDATE')">
            <span v-if="getStepStatus('VALIDATE') === 'finish'">✓</span>
            <span v-else>1</span>
          </div>
          <span class="step-title">数据校验</span>
        </div>

        <div class="step-line" :class="{ active: currentStepIndex > 0 }"></div>

        <div class="step-item" :class="getStepItemClass('UPLOAD')">
          <div class="step-icon" :class="getStepIconClass('UPLOAD')">
            <span v-if="getStepStatus('UPLOAD') === 'finish'">✓</span>
            <span v-else>2</span>
          </div>
          <span class="step-title">数据填报</span>
        </div>
      </div>
    </div>

    <!-- 数据统计 -->
    <el-row :gutter="20" class="mb-20" v-if="task">
      <el-col :span="6">
        <div class="stats-card">
          <div class="stats-number">{{ task.totalCount }}</div>
          <div class="stats-label">总数据量</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stats-card" style="border-left-color: var(--success-color)">
          <div class="stats-number" style="color: var(--success-color)">{{ task.successCount }}</div>
          <div class="stats-label">成功</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stats-card" style="border-left-color: var(--danger-color)">
          <div class="stats-number" style="color: var(--danger-color)">{{ task.failedCount }}</div>
          <div class="stats-label">失败</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stats-card" style="border-left-color: var(--warning-color)">
          <div class="stats-number" style="color: var(--warning-color)">{{ processingCount }}</div>
          <div class="stats-label">正在处理</div>
        </div>
      </el-col>
    </el-row>

    <!-- 进度条 -->
    <div class="progress-container" v-if="task">
      <div class="progress-info">
        <span class="progress-text">{{ currentStepText }}</span>
        <span class="progress-percentage">{{ task.progress }}%</span>
      </div>
      <el-progress
        :percentage="task.progress"
        :status="getProgressStatus(task.status)"
        :stroke-width="12"
      >
        <template #default="{ percentage }">
          <span class="progress-text">{{ percentage }}%</span>
        </template>
      </el-progress>
      <div class="progress-detail" v-if="currentProcessingItem">
        {{ currentProcessingItem }}
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="button-group" v-if="task">
      <el-button
        v-if="task.currentStep === 'VALIDATE' && task.status === 'COMPLETED'"
        type="primary"
        @click="startUpload"
        :disabled="task.failedCount === task.totalCount"
      >
        <el-icon><Upload /></el-icon>
        开始填报
      </el-button>

      <el-button
        v-if="task.currentStep === 'UPLOAD' && task.status !== 'COMPLETED'"
        @click="goBackToValidate"
      >
        <el-icon><Back /></el-icon>
        返回校验
      </el-button>

      <el-button
        v-if="task.status === 'RUNNING'"
        type="danger"
        @click="stopTask"
      >
        <el-icon><VideoPause /></el-icon>
        停止任务
      </el-button>

      <el-button @click="exportTaskData" :loading="exportLoading">
        <el-icon><Download /></el-icon>
        导出结果
      </el-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-container" v-if="task && task.orders">
      <el-table
        v-loading="tableLoading"
        :data="filteredTableData"
        stripe
        style="width: 100%"
        max-height="600"
      >
        <!-- 基础订单信息 -->
        <el-table-column prop="orderNo" label="入库单号" width="140" fixed="left" />
        <el-table-column prop="materialName" label="物资名称" width="180" show-overflow-tooltip />
        <el-table-column prop="specification" label="规格型号" width="150" show-overflow-tooltip />
        <el-table-column prop="brand" label="品牌" width="120" show-overflow-tooltip />
        <el-table-column prop="supplierName" label="供货单位" width="180" show-overflow-tooltip />
        <el-table-column prop="quantity" label="数量" width="100" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.quantity) }}
          </template>
        </el-table-column>
        <el-table-column prop="plannedPrice" label="计划价格" width="120" align="right">
          <template #default="{ row }">
            ¥{{ formatNumber(row.plannedPrice) }}
          </template>
        </el-table-column>

        <!-- 扩展信息 -->
        <el-table-column prop="productId" label="产品ID" width="120" show-overflow-tooltip />

        <!-- 根据当前步骤显示不同的状态列 -->
        <template v-if="task.currentStep === 'VALIDATE'">
          <el-table-column prop="validateStatus" label="校验状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getValidateStatusTagType(row.validateStatus)" size="small">
                {{ getValidateStatusText(row.validateStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="validateFailReason" label="失败原因" width="200" show-overflow-tooltip />
        </template>

        <template v-else>
          <el-table-column prop="uploadStatus" label="填报状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getUploadStatusTagType(row.uploadStatus)" size="small">
                {{ getUploadStatusText(row.uploadStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="uploadFailReason" label="失败原因" width="200" show-overflow-tooltip />
          <el-table-column prop="settlementType" label="结算类型" width="120">
            <template #default="{ row }">
              {{ getSettlementTypeText(row.settlementType) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              {{ getTypeText(row.type) }}
            </template>
          </el-table-column>
          <el-table-column prop="productPrice" label="产品价格" width="120" align="right">
            <template #default="{ row }">
              <span v-if="row.productPrice">¥{{ formatNumber(row.productPrice) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="maxReferencePrice" label="省最高参考价" width="140" align="right">
            <template #default="{ row }">
              <span v-if="row.maxReferencePrice">¥{{ formatNumber(row.maxReferencePrice) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="task.orders?.length || 0"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Upload,
  Back,
  VideoPause,
  Download
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'

export default {
  name: 'TaskDetail',
  components: {
    ArrowLeft,
    Upload,
    Back,
    VideoPause,
    Download
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const tableLoading = ref(false)
    const exportLoading = ref(false)
    const currentProcessingItem = ref('')
    const wsConnection = ref(null)

    const pagination = reactive({
      currentPage: 1,
      pageSize: 20
    })

    const task = computed(() => store.getters.getCurrentTask)

    const currentStepIndex = computed(() => {
      if (!task.value) return 0
      return task.value.currentStep === 'VALIDATE' ? 0 : 1
    })

    const currentStepText = computed(() => {
      if (!task.value) return ''
      const stepMap = {
        VALIDATE: '正在进行数据校验',
        UPLOAD: '正在进行数据填报'
      }
      return stepMap[task.value.currentStep] || ''
    })

    const processingCount = computed(() => {
      if (!task.value) return 0
      return task.value.totalCount - task.value.successCount - task.value.failedCount
    })

    const filteredTableData = computed(() => {
      if (!task.value?.orders) return []
      const start = (pagination.currentPage - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      return task.value.orders.slice(start, end)
    })

    // 模拟WebSocket连接
    const connectWebSocket = () => {
      // 这里应该连接真实的WebSocket
      // 模拟进度更新
      if (task.value?.status === 'RUNNING') {
        const interval = setInterval(() => {
          if (task.value && task.value.progress < 100) {
            const newProgress = Math.min(task.value.progress + Math.random() * 10, 100)
            const currentIndex = Math.floor((newProgress / 100) * task.value.totalCount)
            const currentOrder = task.value.orders[currentIndex]

            if (currentOrder) {
              currentProcessingItem.value = `正在处理第 ${currentIndex + 1}/${task.value.totalCount} 条：${currentOrder.orderNo}`
            }

            store.commit('UPDATE_TASK_PROGRESS', {
              taskId: task.value.id,
              progress: {
                progress: Math.floor(newProgress),
                successCount: Math.floor((newProgress / 100) * task.value.totalCount * 0.8),
                failedCount: Math.floor((newProgress / 100) * task.value.totalCount * 0.1)
              }
            })

            if (newProgress >= 100) {
              store.commit('UPDATE_TASK_PROGRESS', {
                taskId: task.value.id,
                progress: {
                  status: 'COMPLETED',
                  progress: 100
                }
              })
              currentProcessingItem.value = '处理完成'
              clearInterval(interval)
            }
          } else {
            clearInterval(interval)
          }
        }, 2000)

        return () => clearInterval(interval)
      }
    }

    // 获取任务详情
    const fetchTaskDetail = async () => {
      const taskId = route.params.id
      // 模拟获取任务详情
      const mockTask = {
        id: parseInt(taskId),
        name: `批量填报任务${taskId}`,
        status: 'RUNNING',
        totalCount: 20,
        successCount: 8,
        failedCount: 1,
        currentStep: 'VALIDATE',
        progress: 45,
        createTime: new Date().toISOString(),
        orders: Array.from({ length: 20 }, (_, index) => ({
          id: index + 1,
          orderNo: `RK${String(20240800 + index).padStart(8, '0')}`,
          materialName: `医用耗材${index + 1}`,
          specification: `规格型号${index + 1}`,
          brand: `品牌${index + 1}`,
          supplierName: `供应商${index + 1}`,
          quantity: Math.floor(Math.random() * 1000) + 1,
          plannedPrice: (Math.random() * 1000 + 100).toFixed(2),
          productId: `P${Math.random().toString(36).substr(2, 8)}`,
          validateStatus: ['PENDING', 'SUCCESS', 'FAILED'][Math.floor(Math.random() * 3)],
          uploadStatus: ['PENDING', 'SUCCESS', 'FAILED'][Math.floor(Math.random() * 3)],
          settlementType: Math.random() > 0.5 ? 1 : 2,
          type: Math.random() > 0.5 ? 1 : 2,
          validateFailReason: Math.random() > 0.7 ? '产品信息不匹配' : '',
          uploadFailReason: Math.random() > 0.8 ? '网络连接超时' : '',
          productPrice: (Math.random() * 1000 + 50).toFixed(2),
          maxReferencePrice: (Math.random() * 1200 + 100).toFixed(2)
        }))
      }

      store.commit('SET_CURRENT_TASK', mockTask)
    }

    // 返回任务列表
    const goBack = () => {
      router.push('/dashboard/tasks')
    }

    // 开始填报
    const startUpload = () => {
      if (task.value) {
        store.commit('UPDATE_TASK_PROGRESS', {
          taskId: task.value.id,
          progress: {
            currentStep: 'UPLOAD',
            status: 'RUNNING',
            progress: 0
          }
        })
        ElMessage.success('开始数据填报')
        connectWebSocket()
      }
    }

    // 返回校验
    const goBackToValidate = () => {
      if (task.value) {
        store.commit('UPDATE_TASK_PROGRESS', {
          taskId: task.value.id,
          progress: {
            currentStep: 'VALIDATE',
            status: 'COMPLETED'
          }
        })
        ElMessage.info('已返回数据校验步骤')
      }
    }

    // 停止任务
    const stopTask = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要停止当前任务吗？',
          '确认停止',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        if (task.value) {
          store.commit('UPDATE_TASK_PROGRESS', {
            taskId: task.value.id,
            progress: {
              status: 'FAILED'
            }
          })
          ElMessage.success('任务已停止')
        }
      } catch {
        // 用户取消
      }
    }

    // 导出任务数据
    const exportTaskData = () => {
      exportLoading.value = true
      setTimeout(() => {
        ElMessage.success('导出成功')
        exportLoading.value = false
      }, 2000)
    }

    // 分页处理
    const handleSizeChange = (val) => {
      pagination.pageSize = val
    }

    const handleCurrentChange = (val) => {
      pagination.currentPage = val
    }

    // 格式化和状态映射函数
    const formatNumber = (value) => {
      return Number(value).toLocaleString()
    }

    const getStepStatus = (step) => {
      if (!task.value) return 'wait'
      if (task.value.currentStep === step) {
        return task.value.status === 'COMPLETED' ? 'finish' : 'process'
      }
      return currentStepIndex.value > (step === 'VALIDATE' ? 0 : 1) ? 'finish' : 'wait'
    }

    const getProgressStatus = (status) => {
      const statusMap = {
        COMPLETED: 'success',
        FAILED: 'exception',
        RUNNING: null
      }
      return statusMap[status]
    }

    const getValidateStatusText = (status) => {
      const statusMap = {
        PENDING: '待校验',
        SUCCESS: '成功',
        FAILED: '失败'
      }
      return statusMap[status] || status
    }

    const getValidateStatusTagType = (status) => {
      const typeMap = {
        PENDING: 'info',
        SUCCESS: 'success',
        FAILED: 'danger'
      }
      return typeMap[status] || 'info'
    }

    const getUploadStatusText = (status) => {
      const statusMap = {
        PENDING: '待填报',
        SUCCESS: '成功',
        FAILED: '失败'
      }
      return statusMap[status] || status
    }

    const getUploadStatusTagType = (status) => {
      const typeMap = {
        PENDING: 'info',
        SUCCESS: 'success',
        FAILED: 'danger'
      }
      return typeMap[status] || 'info'
    }

    const getSettlementTypeText = (type) => {
      const typeMap = {
        1: '耗材交易结算',
        2: '试剂交易结算'
      }
      return typeMap[type] || ''
    }

    const getTypeText = (type) => {
      const typeMap = {
        1: '挂网产品',
        2: '带量专区'
      }
      return typeMap[type] || ''
    }

    const getStepItemClass = (step) => {
      if (!task.value) return ''
      const stepIndex = step === 'VALIDATE' ? 0 : 1
      if (currentStepIndex.value > stepIndex) return 'completed'
      if (currentStepIndex.value === stepIndex) return 'active'
      return 'waiting'
    }

    const getStepIconClass = (step) => {
      if (!task.value) return 'icon-waiting'
      const stepIndex = step === 'VALIDATE' ? 0 : 1
      if (currentStepIndex.value > stepIndex) return 'icon-completed'
      if (currentStepIndex.value === stepIndex) return 'icon-active'
      return 'icon-waiting'
    }

    onMounted(() => {
      fetchTaskDetail()
      const cleanup = connectWebSocket()
      if (cleanup) {
        onUnmounted(cleanup)
      }
    })

    return {
      task,
      tableLoading,
      exportLoading,
      currentProcessingItem,
      pagination,
      currentStepIndex,
      currentStepText,
      processingCount,
      filteredTableData,
      goBack,
      startUpload,
      goBackToValidate,
      stopTask,
      exportTaskData,
      handleSizeChange,
      handleCurrentChange,
      formatNumber,
      getStepStatus,
      getProgressStatus,
      getValidateStatusText,
      getValidateStatusTagType,
      getUploadStatusText,
      getUploadStatusTagType,
      getSettlementTypeText,
      getTypeText,
      getStepItemClass,
      getStepIconClass
    }
  }
}
</script>

<style scoped>
.task-detail {
  height: 100%;
}

/* 简洁的页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 0;
  margin-bottom: 8px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.3;
}

.task-id {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 1px 6px;
  border-radius: 3px;
}

.header-right {
  display: flex;
}

/* 步骤条样式 */
.steps-container {
  background: #fff;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.custom-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.step-icon {
  width: 32px;
  height: 32px;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.step-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
  white-space: nowrap;
  transition: all 0.3s ease;
}

/* 步骤连接线 */
.step-line {
  flex: 1;
  height: 2px;
  background: #e4e7ed;
  margin: 0 24px;
  position: relative;
  transition: all 0.3s ease;
}

.step-line.active {
  background: #67c23a;
}

/* 步骤状态样式 */
.step-item.waiting .step-icon {
  background: #fff;
  border-color: #c0c4cc;
  color: #c0c4cc;
}

.step-item.waiting .step-title {
  color: #c0c4cc;
}

.step-item.active .step-icon {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

.step-item.active .step-title {
  color: #409eff;
  font-weight: 600;
}

.step-item.completed .step-icon {
  background: #67c23a;
  border-color: #67c23a;
  color: #fff;
}

.step-item.completed .step-title {
  color: #67c23a;
  font-weight: 600;
}

/* 图标类样式 */
.icon-waiting {
  background: #fff;
  border-color: #c0c4cc;
  color: #c0c4cc;
}

.icon-active {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

.icon-completed {
  background: #67c23a;
  border-color: #67c23a;
  color: #fff;
}

.progress-detail {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-left {
    flex-direction: column;
    gap: 8px;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }

  .steps-container {
    padding: 16px;
  }

  .stats-card {
    margin-bottom: 16px;
  }

  .button-group {
    flex-wrap: wrap;
  }

  .button-group .el-button {
    margin-bottom: 8px;
  }
}
</style>
