<template>
  <div class="task-list">
    <!-- 查看条件栏 -->
    <div class="card">
      <div class="filter-container">
        <el-form :model="searchForm" :inline="true" label-width="auto">
          <el-form-item label="任务名称">
            <el-input
              v-model="searchForm.taskName"
              placeholder="请输入任务名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="任务状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择任务状态"
              clearable
              style="width: 150px"
            >
              <el-option label="等待中" value="PENDING" />
              <el-option label="进行中" value="RUNNING" />
              <el-option label="已完成" value="COMPLETED" />
              <el-option label="失败" value="FAILED" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 380px"
            />
          </el-form-item>
          <el-form-item label="操作人">
            <el-input
              v-model="searchForm.operator"
              placeholder="请输入操作人"
              clearable
              style="width: 150px"
            />
          </el-form-item>
        </el-form>
        <div class="filter-buttons">
          <el-button type="primary" @click="handleSearch" :loading="searchLoading">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="filteredTaskList"
        style="width: 100%"
        @row-click="viewTaskDetail"
        row-class-name="clickable-row"
      >
        <el-table-column prop="name" label="任务名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="task-name-cell">
              <span class="task-name">{{ row.name }}</span>
              <div class="task-description">{{ row.description || '批量填报任务' }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="id" label="任务ID" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.id }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="任务时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="任务状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="operator" label="操作人" width="120" align="center">
          <template #default="{ row }">
            {{ row.operator || '系统用户' }}
          </template>
        </el-table-column>

        <el-table-column label="进度统计" width="180" align="center">
          <template #default="{ row }">
            <div class="progress-stats">
              <el-progress
                :percentage="row.progress"
                :status="getProgressStatus(row.status)"
                :stroke-width="6"
                :show-text="false"
              />
              <div class="progress-text">
                {{ row.progress }}% ({{ row.successCount }}/{{ row.totalCount }})
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="middle" @click.stop="viewTaskDetail(row)">
              <el-icon><ViewIcon /></el-icon>
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, RefreshLeft, View as ViewIcon } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

export default {
  name: 'TaskList',
  components: {
    Search,
    RefreshLeft,
    ViewIcon
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const loading = ref(false)

    const pagination = reactive({
      currentPage: 1,
      pageSize: 20,
      total: 0
    })

    const searchLoading = ref(false)

    const searchForm = reactive({
      taskName: '',
      status: '',
      dateRange: [],
      operator: ''
    })

    const taskList = computed(() => store.getters.allTasks)

    const filteredTaskList = computed(() => {
      const { taskName, status, dateRange, operator } = searchForm
      return taskList.value.filter(task => {
        const matchesName = task.name.includes(taskName)
        const matchesStatus = status ? task.status === status : true
        const matchesDate = dateRange.length === 2
          ? dayjs(task.createTime).isBetween(dayjs(dateRange[0]), dayjs(dateRange[1]), null, '[]')
          : true
        const matchesOperator = operator ? task.operator.includes(operator) : true
        return matchesName && matchesStatus && matchesDate && matchesOperator
      })
    })

    const taskStats = computed(() => {
      const tasks = filteredTaskList.value
      return {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'COMPLETED').length,
        running: tasks.filter(t => t.status === 'RUNNING').length,
        failed: tasks.filter(t => t.status === 'FAILED').length
      }
    })

    // 获取任务数据
    const fetchTasks = async () => {
      loading.value = true
      try {
        await store.dispatch('fetchTasks')
        pagination.total = taskList.value.length
      } catch (error) {
        ElMessage.error('获取任务列表失败')
      } finally {
        loading.value = false
      }
    }

    // 刷新任务
    const refreshTasks = () => {
      fetchTasks()
    }

    // 查看任务详情
    const viewTaskDetail = (task) => {
      router.push(`/dashboard/task/${task.id}`)
    }

    // 重试任务
    const retryTask = (task) => {
      ElMessage.info('重试功能开发中...')
    }

    // 分页处理
    const handleSizeChange = (val) => {
      pagination.pageSize = val
      fetchTasks()
    }

    const handleCurrentChange = (val) => {
      pagination.currentPage = val
      fetchTasks()
    }

    // 查询处理
    const handleSearch = () => {
      searchLoading.value = true
      // 这里可以添加查询逻辑
      setTimeout(() => {
        searchLoading.value = false
      }, 1000)
    }

    const handleReset = () => {
      Object.assign(searchForm, {
        taskName: '',
        status: '',
        dateRange: [],
        operator: ''
      })
      fetchTasks()
    }

    // 格式化函数
    const formatDateTime = (value) => {
      return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
    }

    const getStatusText = (status) => {
      const statusMap = {
        PENDING: '等待中',
        RUNNING: '进行中',
        COMPLETED: '已完成',
        FAILED: '失败'
      }
      return statusMap[status] || status
    }

    const getStatusTagType = (status) => {
      const typeMap = {
        PENDING: 'info',
        RUNNING: 'warning',
        COMPLETED: 'success',
        FAILED: 'danger'
      }
      return typeMap[status] || 'info'
    }

    const getStepText = (step) => {
      const stepMap = {
        VALIDATE: '数据校验',
        UPLOAD: '数据填报'
      }
      return stepMap[step] || step
    }

    const getStepTagType = (step) => {
      const typeMap = {
        VALIDATE: 'primary',
        UPLOAD: 'success'
      }
      return typeMap[step] || 'info'
    }

    const getProgressStatus = (status) => {
      const statusMap = {
        COMPLETED: 'success',
        FAILED: 'exception',
        RUNNING: null
      }
      return statusMap[status]
    }

    onMounted(() => {
      fetchTasks()
    })

    return {
      loading,
      pagination,
      searchLoading,
      searchForm,
      taskList,
      filteredTaskList,
      taskStats,
      refreshTasks,
      viewTaskDetail,
      retryTask,
      handleSizeChange,
      handleCurrentChange,
      handleSearch,
      handleReset,
      formatDateTime,
      getStatusText,
      getStatusTagType,
      getStepText,
      getStepTagType,
      getProgressStatus
    }
  }
}
</script>

<style scoped>
.task-list {
  height: 100%;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.filter-buttons {
  display: flex;
  gap: 10px;
}

.data-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-item {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-item.success {
  color: var(--success-color);
}

.stat-item.danger {
  color: var(--danger-color);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row):hover {
  background-color: #f5f7fa;
}

.task-name-cell {
  display: flex;
  flex-direction: column;
}

.task-name {
  font-weight: 500;
}

.task-description {
  font-size: 12px;
  color: var(--text-secondary);
}

.progress-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-text {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .stats-card {
    margin-bottom: 16px;
  }

  .data-stats {
    font-size: 11px;
  }

  .filter-container {
    flex-direction: column;
  }

  .filter-buttons {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
