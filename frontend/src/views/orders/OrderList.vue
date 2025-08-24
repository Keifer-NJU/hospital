<template>
  <div class="order-list">
    <!-- 搜索表单 -->
    <div class="search-form">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        :inline="true"
        label-width="80px"
      >
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="入库单号">
              <el-input
                v-model="searchForm.orderNo"
                placeholder="请输入入库单号"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="物资名称">
              <el-input
                v-model="searchForm.materialName"
                placeholder="请输入物资名称"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="规格型号">
              <el-input
                v-model="searchForm.specification"
                placeholder="请输入规格型号"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="品牌">
              <el-input
                v-model="searchForm.brand"
                placeholder="请输入品牌"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="审核状态" style="width: 89%">
              <el-select
                v-model="searchForm.auditStatus"
                placeholder="请选择审核状态"
                clearable
                popper-class="audit-status-dropdown"
              >
                <el-option label="待审核" value="PENDING" />
                <el-option label="已审核" value="APPROVED" />
                <el-option label="已驳回" value="REJECTED" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="9" class="search-buttons">
            <el-form-item>
              <el-button type="primary" @click="handleSearch" :loading="loading">
                <el-icon><Search /></el-icon>
                查询
              </el-button>
              <el-button @click="handleReset">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 操作按钮 -->
    <div class="button-group">
      <el-button
        type="primary"
        :disabled="selectedOrders.length === 0"
        @click="handleBatchSubmit"
      >
        <el-icon><Upload /></el-icon>
        批量填报 ({{ selectedOrders.length }})
      </el-button>
      <el-button type="primary" :disabled="selectedOrders.length === 0" @click="handleExport" :loading="exportLoading">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        row-key="id"
        style="width: 100%"
        max-height="600"
      >
        <el-table-column type="selection" width="55" reserve-selection />

        <el-table-column prop="orderNo" label="入库单号" width="140">
          <template #default="{ row }">
            <el-link type="primary" @click="viewOrderDetail(row)">
              {{ row.orderNo }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="materialName" label="物资名称" width="180" show-overflow-tooltip />

        <el-table-column prop="specification" label="规格型号" width="150" show-overflow-tooltip />

        <el-table-column prop="brand" label="品牌" width="120" show-overflow-tooltip />

        <el-table-column prop="auditStatus" label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.auditStatus)"
              size="small"
            >
              {{ getStatusText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="supplierName" label="供货单位" width="180" show-overflow-tooltip />

        <el-table-column prop="quantity" label="采购数量" width="100" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.quantity) }}
          </template>
        </el-table-column>

        <el-table-column prop="plannedPrice" label="计划价格" width="120" align="right">
          <template #default="{ row }">
            ¥{{ formatNumber(row.plannedPrice) }}
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="middle" @click="viewOrderDetail(row)">
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

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="800px"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="入库单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="物资名称">{{ currentOrder.materialName }}</el-descriptions-item>
          <el-descriptions-item label="规格型号">{{ currentOrder.specification }}</el-descriptions-item>
          <el-descriptions-item label="品牌">{{ currentOrder.brand }}</el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getStatusTagType(currentOrder.auditStatus)">
              {{ getStatusText(currentOrder.auditStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="供货单位">{{ currentOrder.supplierName }}</el-descriptions-item>
          <el-descriptions-item label="采购数量">{{ formatNumber(currentOrder.quantity) }}</el-descriptions-item>
          <el-descriptions-item label="计划价格">¥{{ formatNumber(currentOrder.plannedPrice) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ formatDateTime(currentOrder.createTime) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Upload, Download, View } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

export default {
  name: 'OrderList',
  components: {
    Search,
    Refresh,
    Upload,
    Download,
    ViewIcon: View
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const searchFormRef = ref()
    const tableRef = ref()
    const loading = ref(false)
    const exportLoading = ref(false)
    const detailVisible = ref(false)
    const currentOrder = ref(null)
    const selectedOrders = ref([])

    const searchForm = reactive({
      orderNo: '',
      materialName: '',
      specification: '',
      brand: '',
      auditStatus: '',
      dateRange: null
    })

    const pagination = reactive({
      currentPage: 1,
      pageSize: 20,
      total: 0
    })

    // 修改：添加分页数据计算
    const tableData = computed(() => {
      const allOrders = store.getters.allOrders
      const start = (pagination.currentPage - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      return allOrders.slice(start, end)
    })

    // 获取订单数据
    const fetchOrders = async () => {
      loading.value = true
      try {
        const params = {
          ...searchForm,
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize
        }
        if (params.dateRange) {
          params.startDate = params.dateRange[0]
          params.endDate = params.dateRange[1]
          delete params.dateRange
        }

        await store.dispatch('fetchOrders', params)
        pagination.total = store.getters.allOrders.length
      } catch (error) {
        ElMessage.error('获取数据失败')
      } finally {
        loading.value = false
      }
    }

    // 搜索
    const handleSearch = () => {
      pagination.currentPage = 1
      fetchOrders()
    }

    // 重置
    const handleReset = () => {
      searchFormRef.value.resetFields()
      Object.assign(searchForm, {
        orderNo: '',
        materialName: '',
        specification: '',
        brand: '',
        auditStatus: '',
        dateRange: null
      })
      pagination.currentPage = 1
      fetchOrders()
    }

    // 选择变化
    const handleSelectionChange = (selection) => {
      selectedOrders.value = selection
    }

    // 批量提交
    const handleBatchSubmit = async () => {
      if (selectedOrders.value.length === 0) {
        ElMessage.warning('请选择要填报的订单')
        return
      }

      try {
        await ElMessageBox.confirm(
          `确定要填报选中的 ${selectedOrders.value.length} 条订单吗？`,
          '确认填报',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        // 创建任务并跳转到任务详情页
        const task = await store.dispatch('createTask', selectedOrders.value)
        ElMessage.success('任务创建成功，正在跳转...')
        router.push(`/dashboard/task/${task.id}`)
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('创建任务失败')
        }
      }
    }

    // 导出数据
    const handleExport = () => {
      exportLoading.value = true
      // 模拟导出
      setTimeout(() => {
        ElMessage.success('导出成功')
        exportLoading.value = false
      }, 2000)
    }

    // 查看详情
    const viewOrderDetail = (order) => {
      currentOrder.value = order
      detailVisible.value = true
    }

    // 分页
    const handleSizeChange = (val) => {
      pagination.pageSize = val
      pagination.currentPage = 1 // 重置到第一页
      fetchOrders()
    }

    const handleCurrentChange = (val) => {
      pagination.currentPage = val
      // 前端分页不需要重新请求数据，数据已经通过computed自动更新
    }

    // 格式化函数
    const formatNumber = (value) => {
      return Number(value).toLocaleString()
    }

    const formatDateTime = (value) => {
      return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
    }

    const getStatusText = (status) => {
      const statusMap = {
        PENDING: '待审核',
        APPROVED: '已审核',
        REJECTED: '已驳回'
      }
      return statusMap[status] || status
    }

    const getStatusTagType = (status) => {
      const typeMap = {
        PENDING: 'warning',
        APPROVED: 'success',
        REJECTED: 'danger'
      }
      return typeMap[status] || 'info'
    }

    onMounted(() => {
      fetchOrders()
    })

    return {
      searchFormRef,
      tableRef,
      searchForm,
      pagination,
      tableData,
      loading,
      exportLoading,
      detailVisible,
      currentOrder,
      selectedOrders,
      handleSearch,
      handleReset,
      handleSelectionChange,
      handleBatchSubmit,
      handleExport,
      viewOrderDetail,
      handleSizeChange,
      handleCurrentChange,
      formatNumber,
      formatDateTime,
      getStatusText,
      getStatusTagType
    }
  }
}
</script>

<style scoped>
.order-list {
  height: 100%;
}

.search-form {
  background: #fff;
  padding: 20px;
  margin-bottom: 16px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-form .el-row {
  margin-bottom: 16px;
}

.search-form .el-row:last-child {
  margin-bottom: 0;
}

.search-buttons {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.search-buttons .el-form-item {
  margin-bottom: 0;
}

.search-buttons .el-button {
  margin-left: 8px;
}

.search-buttons .el-button:first-child {
  margin-left: 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.order-detail :deep(.el-descriptions__label) {
  font-weight: 600;
}

@media (max-width: 1200px) {
  .search-form .el-row .el-col {
    margin-bottom: 16px;
  }

  .search-buttons {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .search-form {
    padding: 16px;
  }

  .search-form :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  .search-form :deep(.el-form-item__label) {
    display: block;
    text-align: left;
    padding: 0 0 8px 0;
    width: 100% !important;
  }

  .search-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }

  .search-buttons {
    justify-content: center;
    margin-top: 16px;
  }

  .button-group {
    flex-direction: column;
    align-items: stretch;
  }

  .button-group .el-button {
    margin-bottom: 8px;
  }
}
</style>
