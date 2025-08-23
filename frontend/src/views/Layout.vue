<template>
  <div class="layout-container">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="240px" class="sidebar">
        <div class="logo">
          <h2>采购订单管理</h2>
        </div>
        <el-menu
          :default-active="$route.path"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#1677ff"
          unique-opened
        >
          <el-sub-menu index="/dashboard/purchase">
            <template #title>
              <el-icon><Files /></el-icon>
              <span>采购订单填报管理</span>
            </template>
            <el-menu-item index="/dashboard/orders">
              <el-icon><Document /></el-icon>
              <span>采购订单查询</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/tasks">
              <el-icon><List /></el-icon>
              <span>填报任务管理</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/dashboard/system">
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/help">
            <el-icon><QuestionFilled /></el-icon>
            <span>帮助中心</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 头部 -->
        <el-header class="header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleUserCommand">
              <span class="user-info">
                <el-icon><User /></el-icon>
                {{ currentUser?.name || '用户' }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主内容 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  List,
  Setting,
  QuestionFilled,
  User,
  ArrowDown,
  Files
} from '@element-plus/icons-vue'

export default {
  name: 'Layout',
  components: {
    Document,
    List,
    Setting,
    QuestionFilled,
    User,
    ArrowDown,
    Files
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const currentUser = computed(() => store.getters.currentUser)

    const handleUserCommand = async (command) => {
      if (command === 'logout') {
        try {
          await ElMessageBox.confirm(
            '确定要退出登录吗？',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )

          store.dispatch('logout')
          ElMessage.success('已退出登录')
          router.push('/login')
        } catch {
          // 用户取消
        }
      }
    }

    return {
      currentUser,
      handleUserCommand
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color:#304156;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  z-index: 1001;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4b;
  border-bottom: 1px solid #1f2d3d;
}

.logo h2 {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 1000;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
  color: #606266;
  font-size: 14px;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-info .el-icon {
  margin-right: 6px;
}

.user-info .el-icon--right {
  margin-left: 6px;
  margin-right: 0;
}

.main-content {
  background-color: #f0f2f5;
  padding: 24px;
  min-height: calc(100vh - 60px);
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  border-radius: 0;
}

:deep(.el-menu-item.is-active) {
  background-color: #263445 !important;
  border-right: 3px solid #409eff;
}

:deep(.el-menu-item:hover) {
  background-color: #263445 !important;
}

@media (max-width: 768px) {
  .sidebar {
    width: 64px !important;
  }

  .logo h2 {
    display: none;
  }

  :deep(.el-menu-item span) {
    display: none;
  }

  .main-content {
    padding: 16px;
  }
}
</style>
