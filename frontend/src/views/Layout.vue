<template>
  <div class="layout-container">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="240px" class="sidebar">
        <div class="logo">
          <h2>采购订单智能上报系统</h2>
        </div>
        <el-menu
          :default-active="$route.path"
          router
          text-color="#000000"
          active-text-color="#1890ff"
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
            <el-dropdown @command="handleUserCommand" placement="bottom-end">
              <div class="user-avatar">
                <el-icon class="avatar-icon"><Avatar /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item disabled class="user-info-item">
                    <div class="user-details">
                      <el-icon class="user-icon"><Avatar /></el-icon>
                      <span class="user-name">{{ currentUser?.name || '用户' }}</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout" class="logout-item">
                    <el-icon class="logout-icon"><SwitchButton /></el-icon>
                    <span>退出登录</span>
                  </el-dropdown-item>
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
  Avatar,
  SwitchButton,
  Files
} from '@element-plus/icons-vue'

export default {
  name: 'Layout',
  components: {
    Document,
    List,
    Setting,
    QuestionFilled,
    Avatar,
    SwitchButton,
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
  background-color: #f3f7fc !important;
  box-shadow: 2px 0 8px 0 rgba(0, 21, 41, 0.06);
  z-index: 1001;
  border-right: 1px solid rgba(0, 21, 41, 0.04);
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f7fc !important;
}

.logo h2 {
  color: #1677ff;
  font-size: 20px;
  font-weight: 600;
}

.header {
  background-color: #f3f7fc !important;
  border-bottom: 1px solid rgba(228, 231, 237, 0.3);
  box-shadow: 0 1px 2px rgba(0, 21, 41, 0.03);
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

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1677ff, #40a9ff);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);
}

.user-avatar:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

.avatar-icon {
  color: white;
  font-size: 18px;
}

.user-info-item {
  padding: 12px 16px !important;
  cursor: default !important;
}

.user-details {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-icon {
  color: #1677ff;
  font-size: 16px;
}

.user-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.logout-item {
  color: #f56c6c !important;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logout-item:hover {
  background-color: #fef0f0 !important;
}

.logout-icon {
  font-size: 14px;
}

.main-content {
  background-color: #f5f7fa;
  padding: 24px;
}

/* 下拉菜单样式优化 */
:deep(.el-dropdown-menu) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 21, 41, 0.08);
  min-width: 160px;
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 12px;
  font-size: 14px;
}

:deep(.el-dropdown-menu__item--divided::before) {
  margin: 4px 0;
}
</style>
