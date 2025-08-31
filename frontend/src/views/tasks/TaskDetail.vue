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

    <!-- 主要内容区域 -->
    <div class="main-content" v-if="task">
      <!-- 任务概览卡片 -->
      <div class="overview-card">
        <!-- 步骤条和统计信息整合 -->
        <div class="overview-header">
          <div class="steps-section">
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

          <!-- 右侧操作按钮 -->
          <div class="action-section">
            <!-- 数据校验步骤的按钮 -->
            <el-button
              v-if="task.currentStep === 'VALIDATE' && task.status === 'PENDING'"
              type="primary"
              @click="startValidate"
            >
              开始校验
            </el-button>

            <el-button
              v-if="task.currentStep === 'VALIDATE' && task.status === 'COMPLETED'"
              type="primary"
              @click="goToUploadStep"
              :disabled="task.failedCount === task.totalCount"
            >
              下一步
            </el-button>

            <!-- 数据填报步骤的按钮 -->
            <div class="button-row" v-if="task.currentStep === 'UPLOAD' && task.status === 'PENDING'">
              <el-button
                type="primary"
                @click="startUpload"
              >
                开始填报
              </el-button>

              <el-button @click="goBackToValidate">
                返回校验
              </el-button>
            </div>

            <el-button
              v-if="task.status === 'RUNNING'"
              type="danger"
              @click="stopTask"
            >
              <el-icon><VideoPause /></el-icon>
              停止任务
            </el-button>

            <!-- 继续任务按钮 -->
            <el-button
              v-if="task.status === 'FAILED'"
              type="success"
              @click="continueTask"
            >
              <el-icon><VideoPlay /></el-icon>
              继续任务
            </el-button>
          </div>
        </div>

        <!-- 统计和进度信息 -->
        <div class="progress-stats-section">
          <!-- 数据统计 -->
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ task.totalCount }}</div>
              <div class="stat-label">总数据量</div>
            </div>
            <div class="stat-item success">
              <div class="stat-value">{{ task.successCount }}</div>
              <div class="stat-label">成功</div>
            </div>
            <div class="stat-item danger">
              <div class="stat-value">{{ task.failedCount }}</div>
              <div class="stat-label">失败</div>
            </div>
            <div class="stat-item warning">
              <div class="stat-value">{{ processingCount }}</div>
              <div class="stat-label">正在处理</div>
            </div>
          </div>

          <!-- 进度条区域 -->
          <div class="progress-section">
            <div class="progress-info">
              <span class="progress-text">{{ currentStepText }}</span>
              <span class="progress-percentage">{{ task.progress }}%</span>
            </div>
            <el-progress
              :percentage="task.progress"
              :status="getProgressStatus(task.status)"
              :stroke-width="8"
              class="main-progress"
            />
            <div class="progress-detail" v-if="currentProcessingItem">
              {{ currentProcessingItem }}
            </div>
          </div>
        </div>
      </div>

      <!-- 数据表格区域 -->
      <div class="table-section">
        <div class="section-header">
          <div class="table-info">
            共 {{ task.orders?.length || 0 }} 条记录
          </div>
        </div>

        <div class="table-content">
          <!-- 表格内容保持不变 -->
          <el-table
            v-loading="tableLoading"
            :data="filteredTableData"
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
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'

export default {
  name: 'TaskDetail',
  components: {
    ArrowLeft,
    VideoPause,
    VideoPlay
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const tableLoading = ref(false)
    const currentProcessingItem = ref('')
    const wsConnection = ref(null)
    const progressInterval = ref(null) // 添加定时器引用

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
      // 清除之前的定时器
      if (progressInterval.value) {
        clearInterval(progressInterval.value)
        progressInterval.value = null
      }

      // 这里应该连接真实的WebSocket
      // 模拟进度更新
      if (task.value?.status === 'RUNNING') {
        progressInterval.value = setInterval(() => {
          // 检查任务状态，如果不是运行状态则停止
          if (!task.value || task.value.status !== 'RUNNING') {
            clearInterval(progressInterval.value)
            progressInterval.value = null
            return
          }

          if (task.value.progress < 100) {
            const newProgress = Math.min(task.value.progress + Math.random() * 5 + 2, 100)
            const currentIndex = Math.floor((newProgress / 100) * task.value.totalCount)
            const currentOrder = task.value.orders[currentIndex]

            // 更新当前处理项显示
            if (currentOrder) {
              const stepText = task.value.currentStep === 'VALIDATE' ? '校验' : '填报'
              currentProcessingItem.value = `正在${stepText}第 ${currentIndex + 1}/${task.value.totalCount} 条：${currentOrder.orderNo}`
            }

            // 更新数据状态 - 根据当前步骤更新不同的状态字段
            updateDataStatus(currentIndex, newProgress)

            // 更新任务整体进度
            const successRate = 0.85 // 85%成功率
            const failureRate = 0.1  // 10%失败率
            const processedCount = Math.floor((newProgress / 100) * task.value.totalCount)

            store.commit('UPDATE_TASK_PROGRESS', {
              taskId: task.value.id,
              progress: {
                progress: Math.floor(newProgress),
                successCount: Math.floor(processedCount * successRate),
                failedCount: Math.floor(processedCount * failureRate)
              }
            })

            if (newProgress >= 100) {
              // 任务完成时，确保所有数据都有最终状态
              finalizeAllDataStatus()

              store.commit('UPDATE_TASK_PROGRESS', {
                taskId: task.value.id,
                progress: {
                  status: 'COMPLETED',
                  progress: 100
                }
              })
              currentProcessingItem.value = '处理完成'
              clearInterval(progressInterval.value)
              progressInterval.value = null
            }
          } else {
            clearInterval(progressInterval.value)
            progressInterval.value = null
          }
        }, 1500) // 更频繁的更新，更好的用户体验

        return () => {
          if (progressInterval.value) {
            clearInterval(progressInterval.value)
            progressInterval.value = null
          }
        }
      }
    }

    // 更新数据状态的函数
    const updateDataStatus = (currentIndex, progress) => {
      if (!task.value?.orders) return

      const currentStep = task.value.currentStep
      const statusField = currentStep === 'VALIDATE' ? 'validateStatus' : 'uploadStatus'
      const processingStatus = currentStep === 'VALIDATE' ? 'VALIDATING' : 'UPLOADING'

      // 更新当前正在处理的数据状态
      if (task.value.orders[currentIndex]) {
        task.value.orders[currentIndex][statusField] = processingStatus
      }

      // 根据进度随机设置已处理数据的最终状态
      for (let i = 0; i < currentIndex; i++) {
        const order = task.value.orders[i]
        if (order && order[statusField] === processingStatus) {
          // 85%成功率，15%失败率
          const isSuccess = Math.random() < 0.85
          order[statusField] = isSuccess ? 'SUCCESS' : 'FAILED'

          // 只有失败的数据才设置失败原因，成功的清空失败原因
          const reasonField = currentStep === 'VALIDATE' ? 'validateFailReason' : 'uploadFailReason'
          if (!isSuccess) {
            const failureReasons = currentStep === 'VALIDATE'
              ? ['产品信息不匹配', '供应商信息错误', '价格异常', '数据格式错误']
              : ['网络连接超时', '系统繁忙', '数据验证失败', '上传服务异常']

            order[reasonField] = failureReasons[Math.floor(Math.random() * failureReasons.length)]
          } else {
            // 成功的数据清空失败原因
            order[reasonField] = ''
          }
        }
      }
    }

    // 任务完成时确保所有数据都有最终状态
    const finalizeAllDataStatus = () => {
      if (!task.value?.orders) return

      const currentStep = task.value.currentStep
      const statusField = currentStep === 'VALIDATE' ? 'validateStatus' : 'uploadStatus'
      const processingStatus = currentStep === 'VALIDATE' ? 'VALIDATING' : 'UPLOADING'

      task.value.orders.forEach(order => {
        if (order[statusField] === 'PENDING' || order[statusField] === processingStatus) {
          // 最后处理的数据也按照成功率分配状态
          const isSuccess = Math.random() < 0.85
          order[statusField] = isSuccess ? 'SUCCESS' : 'FAILED'

          // 只有失败的数据才设置失败原因，成功的清空失败原因
          const reasonField = currentStep === 'VALIDATE' ? 'validateFailReason' : 'uploadFailReason'
          if (!isSuccess) {
            const failureReasons = currentStep === 'VALIDATE'
              ? ['产品信息不匹配', '供应商信息错误', '价格异常', '数据格式错误']
              : ['网络连接超时', '系统繁忙', '数据验证失败', '上传服务异常']

            order[reasonField] = failureReasons[Math.floor(Math.random() * failureReasons.length)]
          } else {
            // 成功的数据清空失败原因
            order[reasonField] = ''
          }
        }
      })
    }

    // 重置数据状态的函数
    const resetDataStatus = () => {
      if (!task.value?.orders) return

      const currentStep = task.value.currentStep
      const statusField = currentStep === 'VALIDATE' ? 'validateStatus' : 'uploadStatus'
      const reasonField = currentStep === 'VALIDATE' ? 'validateFailReason' : 'uploadFailReason'

      // 将所有数据状态重置为PENDING
      task.value.orders.forEach(order => {
        order[statusField] = 'PENDING'
        order[reasonField] = ''
      })
    }

    // 获取任务详情
    const fetchTaskDetail = async () => {
      const taskId = route.params.id
      // 模拟获取任务详情
      const mockTask = {
        id: parseInt(taskId),
        name: `批量填报任务${taskId}`,
        status: 'PENDING', // 初始状态为PENDING，需要点击开始校验
        totalCount: 20,
        successCount: 0, // 初始为0
        failedCount: 0,  // 初始为0
        currentStep: 'VALIDATE',
        progress: 0, // 初始进度为0
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
          validateStatus: 'PENDING', // 所有数据都是待校验状态
          uploadStatus: 'PENDING',   // 所有数据都是待填报状态
          settlementType: Math.random() > 0.5 ? 1 : 2,
          type: Math.random() > 0.5 ? 1 : 2,
          validateFailReason: '', // 初始无失败原因
          uploadFailReason: '',   // 初始无失败原因
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

    // 数据校验完成，进入填报步骤
    const goToUploadStep = () => {
      if (task.value) {
        // 切换步骤并重置进度、统计数据
        store.commit('UPDATE_TASK_PROGRESS', {
          taskId: task.value.id,
          progress: {
            currentStep: 'UPLOAD',
            status: 'PENDING',
            progress: 0,
            successCount: 0,
            failedCount: 0
          }
        })
        // 重置所有订单的填报状态
        task.value.orders.forEach(order => {
          order.uploadStatus = 'PENDING'
          order.uploadFailReason = ''
        })
        ElMessage.success('已进入数据填报步骤')
      }
    }

    // 开始校验
    const startValidate = () => {
      if (task.value) {
        // 重置校验状态
        resetDataStatus()

        store.commit('UPDATE_TASK_PROGRESS', {
          taskId: task.value.id,
          progress: {
            status: 'RUNNING',
            progress: 0,
            successCount: 0,
            failedCount: 0
          }
        })
        ElMessage.success('开始数据校验')
        connectWebSocket()
      }
    }

    // 开始填报
    const startUpload = () => {
      if (task.value) {
        // 重置填报状态
        resetDataStatus()

        store.commit('UPDATE_TASK_PROGRESS', {
          taskId: task.value.id,
          progress: {
            status: 'RUNNING',
            progress: 0,
            successCount: 0,
            failedCount: 0
          }
        })
        ElMessage.success('开始数据填报')
        connectWebSocket()
      }
    }

    // 返回校验
    const goBackToValidate = () => {
      if (task.value) {
        // 切换步骤，重置当前步骤的数据状态
        resetDataStatus()

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
          '确定要停止当前任务吗？停止后将保留当前进度，未开始的数据不会继续处理。',
          '确认停止',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        if (task.value) {
          // 清除定时器，停止进度更新
          if (progressInterval.value) {
            clearInterval(progressInterval.value)
            progressInterval.value = null
          }

          // 停止任务时，将正在处理中的数据状态结束处理
          stopProcessingItems()

          store.commit('UPDATE_TASK_PROGRESS', {
            taskId: task.value.id,
            progress: {
              status: 'FAILED'
            }
          })

          currentProcessingItem.value = '任务已停止'
          ElMessage.success('任务已停止')
        }
      } catch {
        // 用户取消
      }
    }

    // 停止正在处理的数据项
    const stopProcessingItems = () => {
      if (!task.value?.orders) return

      const currentStep = task.value.currentStep
      const statusField = currentStep === 'VALIDATE' ? 'validateStatus' : 'uploadStatus'
      const processingStatus = currentStep === 'VALIDATE' ? 'VALIDATING' : 'UPLOADING'

      // 将所有正在处理中的数据完成处理（按成功率分配最终状态）
      task.value.orders.forEach(order => {
        if (order[statusField] === processingStatus) {
          // 85%成功率，15%失败率
          const isSuccess = Math.random() < 0.85
          order[statusField] = isSuccess ? 'SUCCESS' : 'FAILED'

          const reasonField = currentStep === 'VALIDATE' ? 'validateFailReason' : 'uploadFailReason'
          if (!isSuccess) {
            const failureReasons = currentStep === 'VALIDATE'
              ? ['产品信息不匹配', '供应商信息错误', '价格异常', '数据格式错误']
              : ['网络连接超时', '系统繁忙', '数据验证失败', '上传服务异常']

            order[reasonField] = failureReasons[Math.floor(Math.random() * failureReasons.length)]
          } else {
            order[reasonField] = ''
          }
        }
      })

      // 重新计算统计数据
      updateTaskStatistics()
    }

    // 更新任务统计数据
    const updateTaskStatistics = () => {
      if (!task.value?.orders) return

      const currentStep = task.value.currentStep
      const statusField = currentStep === 'VALIDATE' ? 'validateStatus' : 'uploadStatus'

      let successCount = 0
      let failedCount = 0

      task.value.orders.forEach(order => {
        if (order[statusField] === 'SUCCESS') {
          successCount++
        } else if (order[statusField] === 'FAILED') {
          failedCount++
        }
      })

      // 计算进度百分比
      const processedCount = successCount + failedCount
      const progress = Math.floor((processedCount / task.value.totalCount) * 100)

      store.commit('UPDATE_TASK_PROGRESS', {
        taskId: task.value.id,
        progress: {
          progress,
          successCount,
          failedCount
        }
      })
    }

    // 继续任务
    const continueTask = async () => {
      if (task.value) {
        // 继续任务时不重置数据状态，保持当前进度
        // 只对未处理的数据（PENDING状态）继续处理
        store.commit('UPDATE_TASK_PROGRESS', {
          taskId: task.value.id,
          progress: {
            status: 'RUNNING'
            // 保持当前进度和统计数据，不重置
          }
        })

        // 重新连接WebSocket继续处理剩余数据
        connectWebSocket()

        ElMessage.success('任务已继续')
      }
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
        VALIDATING: '校验中',
        SUCCESS: '成功',
        FAILED: '失败'
      }
      return statusMap[status] || status
    }

    const getValidateStatusTagType = (status) => {
      const typeMap = {
        PENDING: 'info',
        VALIDATING: 'warning',
        SUCCESS: 'success',
        FAILED: 'danger'
      }
      return typeMap[status] || 'info'
    }

    const getUploadStatusText = (status) => {
      const statusMap = {
        PENDING: '待填报',
        UPLOADING: '填报中',
        SUCCESS: '成功',
        FAILED: '失败'
      }
      return statusMap[status] || status
    }

    const getUploadStatusTagType = (status) => {
      const typeMap = {
        PENDING: 'info',
        UPLOADING: 'warning',
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
      currentProcessingItem,
      pagination,
      currentStepIndex,
      currentStepText,
      processingCount,
      filteredTableData,
      goBack,
      goToUploadStep,
      startValidate,
      startUpload,
      goBackToValidate,
      stopTask,
      continueTask,
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

/* 主要内容区域 */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 任务概览卡片 */
.overview-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  border: 1px solid #ebeef5;
}

/* 概览头部 */
.overview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  min-height: 40px; /* 确保最小高度，避免布局塌陷 */
}

.steps-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px; /* 添加左右内边距保护步骤条 */
  min-width: 360px; /* 确保步骤条有足够的最小宽度 */
}

.custom-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 360px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
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
  transition: all 0.3s ease;
}

.step-title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e4e7ed;
  margin: 0 16px;
  min-width: 60px;
  transition: background 0.3s ease;
}

.step-line.active {
  background: #67c23a;
}

/* 步骤状态样式 */
.step-item.waiting .step-icon {
  background: #fff;
  border-color: #dcdfe6;
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

/* 操作按钮区域 */
.action-section {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
  min-width: 160px;
}

.button-row {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: flex-end;
}

/* 统计和进度区域 */
.progress-stats-section {
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  background: #f8f9ff;
  border-radius: 8px;
  padding: 20px 16px;
  text-align: center;
  border-left: 4px solid #409eff;
  transition: transform 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-item.success {
  border-left-color: #67c23a;
  background: #f0fff4;
}

.stat-item.danger {
  border-left-color: #f56c6c;
  background: #fff5f5;
}

.stat-item.warning {
  border-left-color: #e6a23c;
  background: #fefce8;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.stat-item.success .stat-value {
  color: #67c23a;
}

.stat-item.danger .stat-value {
  color: #f56c6c;
}

.stat-item.warning .stat-value {
  color: #e6a23c;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* 进度条区域 */
.progress-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.progress-percentage {
  font-size: 18px;
  color: #409eff;
  font-weight: 700;
}

.progress-detail {
  font-size: 12px;
  color: #909399;
  text-align: center;
  margin-top: 8px;
}

/* 数据表格区域 */
.table-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f5f7fa 100%);
  border-bottom: 1px solid #ebeef5;
}

.table-info {
  font-size: 14px;
  color: #606266;
  background: rgba(64, 158, 255, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
}

.pagination-container {
  padding: 20px 24px;
  background: #fafbfc;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .overview-header {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .action-section {
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-content {
    gap: 16px;
  }

  .overview-card,
  .table-section {
    padding: 16px;
    border-radius: 8px;
    margin: 0 -16px;
  }

  .section-header {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-item {
    padding: 16px;
  }

  .stat-value {
    font-size: 24px;
  }

  .progress-section {
    padding: 16px;
  }

  .action-section {
    width: 100%;
  }

  .action-section .el-button {
    flex: 1;
    min-width: auto;
  }

  .custom-steps {
    max-width: none;
    justify-content: space-between;
  }

  .step-line {
    margin: 0 8px;
    min-width: 20px;
  }

  .pagination-container {
    padding: 16px;
  }
}
</style>
