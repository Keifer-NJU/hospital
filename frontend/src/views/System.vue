<template>
  <div class="system-management">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">系统管理</h2>
      </div>

      <el-tabs v-model="activeTab" type="border-card">
        <!-- 用户管理 -->
        <el-tab-pane label="用户管理" name="users">
          <div class="tab-content">
            <div class="button-group mb-20">
              <el-button type="primary">
                <el-icon><Plus /></el-icon>
                添加用户
              </el-button>
              <el-button>
                <el-icon><Download /></el-icon>
                导出用户
              </el-button>
            </div>

            <el-table :data="users" stripe style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="username" label="用户名" width="150" />
              <el-table-column prop="name" label="姓名" width="120" />
              <el-table-column prop="role" label="角色" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'">
                    {{ row.role === 'admin' ? '管理员' : '普通用户' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="lastLogin" label="最后登录" width="180" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
                    {{ row.status === 'active' ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default>
                  <el-button type="primary" link size="small">编辑</el-button>
                  <el-button type="warning" link size="small">重置密码</el-button>
                  <el-button type="danger" link size="small">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 系统配置 -->
        <el-tab-pane label="系统配置" name="config">
          <div class="tab-content">
            <el-form :model="systemConfig" label-width="150px" class="config-form">
              <el-form-item label="系统名称">
                <el-input v-model="systemConfig.systemName" style="width: 300px" />
              </el-form-item>

              <el-form-item label="HRP系统地址">
                <el-input v-model="systemConfig.hrpUrl" style="width: 400px" />
              </el-form-item>

              <el-form-item label="医保平台地址">
                <el-input v-model="systemConfig.platformUrl" style="width: 400px" />
              </el-form-item>

              <el-form-item label="批量处理数量">
                <el-input-number v-model="systemConfig.batchSize" :min="1" :max="1000" />
              </el-form-item>

              <el-form-item label="任务超时时间">
                <el-input-number v-model="systemConfig.timeout" :min="60" :max="3600" />
                <span style="margin-left: 8px; color: var(--text-secondary)">秒</span>
              </el-form-item>

              <el-form-item label="自动重试次数">
                <el-input-number v-model="systemConfig.retryTimes" :min="0" :max="5" />
              </el-form-item>

              <el-form-item label="日志保留天数">
                <el-input-number v-model="systemConfig.logRetentionDays" :min="7" :max="365" />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="saveConfig">保存配置</el-button>
                <el-button @click="resetConfig">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 系统日志 -->
        <el-tab-pane label="系统日志" name="logs">
          <div class="tab-content">
            <div class="log-filters mb-20">
              <el-select v-model="logFilter.level" placeholder="日志级别" clearable style="width: 120px; margin-right: 12px">
                <el-option label="INFO" value="INFO" />
                <el-option label="WARN" value="WARN" />
                <el-option label="ERROR" value="ERROR" />
              </el-select>

              <el-date-picker
                v-model="logFilter.date"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 160px; margin-right: 12px"
              />

              <el-button type="primary" @click="fetchLogs">查询</el-button>
              <el-button @click="clearLogs" type="danger">清空日志</el-button>
            </div>

            <el-table :data="logs" stripe style="width: 100%" max-height="400">
              <el-table-column prop="timestamp" label="时间" width="180" />
              <el-table-column prop="level" label="级别" width="80">
                <template #default="{ row }">
                  <el-tag :type="getLogLevelType(row.level)" size="small">
                    {{ row.level }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="module" label="模块" width="120" />
              <el-table-column prop="message" label="消息" show-overflow-tooltip />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 数据备份 -->
        <el-tab-pane label="数据备份" name="backup">
          <div class="tab-content">
            <div class="backup-section">
              <h3>创建备份</h3>
              <p style="color: var(--text-secondary); margin-bottom: 20px">
                创建系统数据的完整备份，包括订单数据、任务记录和系统配置
              </p>
              <el-button type="primary" @click="createBackup" :loading="backupLoading">
                <el-icon><FolderAdd /></el-icon>
                创建备份
              </el-button>
            </div>

            <el-divider />

            <div class="backup-list">
              <h3>备份记录</h3>
              <el-table :data="backups" stripe style="width: 100%">
                <el-table-column prop="name" label="备份名称" width="200" />
                <el-table-column prop="size" label="文件大小" width="120" />
                <el-table-column prop="createTime" label="创建时间" width="180" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                      {{ row.status === 'success' ? '成功' : '失败' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="{ row }">
                    <el-button type="primary" link size="small" @click="downloadBackup(row)">
                      下载
                    </el-button>
                    <el-button type="warning" link size="small" @click="restoreBackup(row)">
                      恢复
                    </el-button>
                    <el-button type="danger" link size="small" @click="deleteBackup(row)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, FolderAdd } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

export default {
  name: 'System',
  components: {
    Plus,
    Download,
    FolderAdd
  },
  setup() {
    const activeTab = ref('users')
    const backupLoading = ref(false)

    const users = ref([
      {
        id: 1,
        username: '18916836260',
        name: '管理员',
        role: 'admin',
        lastLogin: '2024-08-23 10:30:00',
        status: 'active'
      },
      {
        id: 2,
        username: 'user001',
        name: '张三',
        role: 'user',
        lastLogin: '2024-08-22 15:20:00',
        status: 'active'
      }
    ])

    const systemConfig = reactive({
      systemName: '采购订单管理系统',
      hrpUrl: 'http://localhost:8082/api',
      platformUrl: 'https://platform.example.com',
      batchSize: 100,
      timeout: 300,
      retryTimes: 3,
      logRetentionDays: 30
    })

    const logFilter = reactive({
      level: '',
      date: ''
    })

    const logs = ref([
      {
        timestamp: '2024-08-23 14:30:15',
        level: 'INFO',
        module: '订单管理',
        message: '用户18916836260查询订单列表'
      },
      {
        timestamp: '2024-08-23 14:25:30',
        level: 'WARN',
        module: '任务管理',
        message: '任务ID:123 处理超时，开始重试'
      },
      {
        timestamp: '2024-08-23 14:20:45',
        level: 'ERROR',
        module: 'HRP接口',
        message: 'HRP系统连接失败，请检查网络配置'
      }
    ])

    const backups = ref([
      {
        id: 1,
        name: 'backup_20240823_143000.sql',
        size: '15.2MB',
        createTime: '2024-08-23 14:30:00',
        status: 'success'
      },
      {
        id: 2,
        name: 'backup_20240822_090000.sql',
        size: '14.8MB',
        createTime: '2024-08-22 09:00:00',
        status: 'success'
      }
    ])

    const saveConfig = () => {
      ElMessage.success('配置保存成功')
    }

    const resetConfig = () => {
      Object.assign(systemConfig, {
        systemName: '采购订单管理系统',
        hrpUrl: 'http://localhost:8082/api',
        platformUrl: 'https://platform.example.com',
        batchSize: 100,
        timeout: 300,
        retryTimes: 3,
        logRetentionDays: 30
      })
      ElMessage.info('配置已重置')
    }

    const fetchLogs = () => {
      ElMessage.success('日志查询完成')
    }

    const clearLogs = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要清空所有日志吗？此操作不可恢复',
          '确认清空',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        logs.value = []
        ElMessage.success('日志已清空')
      } catch {
        // 用户取消
      }
    }

    const createBackup = () => {
      backupLoading.value = true
      setTimeout(() => {
        const now = dayjs()
        backups.value.unshift({
          id: Date.now(),
          name: `backup_${now.format('YYYYMMDD_HHmmss')}.sql`,
          size: `${(Math.random() * 10 + 10).toFixed(1)}MB`,
          createTime: now.format('YYYY-MM-DD HH:mm:ss'),
          status: 'success'
        })
        backupLoading.value = false
        ElMessage.success('备份创建成功')
      }, 3000)
    }

    const downloadBackup = (backup) => {
      ElMessage.success(`开始下载 ${backup.name}`)
    }

    const restoreBackup = async (backup) => {
      try {
        await ElMessageBox.confirm(
          `确定要恢复备份 ${backup.name} 吗？当前数据将被覆盖`,
          '确认恢复',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        ElMessage.success('备份恢复成功')
      } catch {
        // 用户取消
      }
    }

    const deleteBackup = async (backup) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除备份 ${backup.name} 吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        const index = backups.value.findIndex(b => b.id === backup.id)
        if (index > -1) {
          backups.value.splice(index, 1)
        }
        ElMessage.success('备份删除成功')
      } catch {
        // 用户取消
      }
    }

    const getLogLevelType = (level) => {
      const typeMap = {
        INFO: 'success',
        WARN: 'warning',
        ERROR: 'danger'
      }
      return typeMap[level] || 'info'
    }

    return {
      activeTab,
      backupLoading,
      users,
      systemConfig,
      logFilter,
      logs,
      backups,
      saveConfig,
      resetConfig,
      fetchLogs,
      clearLogs,
      createBackup,
      downloadBackup,
      restoreBackup,
      deleteBackup,
      getLogLevelType
    }
  }
}
</script>

<style scoped>
.system-management {
  height: 100%;
}

.tab-content {
  padding: 20px 0;
}

.config-form {
  max-width: 600px;
}

.backup-section {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 20px;
}

.backup-section h3 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
}

.backup-list h3 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
}

.log-filters {
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .log-filters {
    flex-wrap: wrap;
    gap: 8px;
  }

  .log-filters .el-select,
  .log-filters .el-date-picker {
    margin-right: 0 !important;
    margin-bottom: 8px;
  }
}
</style>
