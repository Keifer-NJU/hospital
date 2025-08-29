<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-header">
        <h1>采购订单管理系统</h1>
        <p>医保药械平台智能填报系统</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="login-tips">
          <p>默认账号：18916836260</p>
          <p>默认密码：mXDK52un</p>
          <el-link type="primary" @click="showForgotPassword">忘记密码？</el-link>
        </div>
      </el-form>
    </div>

    <!-- 忘记密码对话框 -->
    <el-dialog
      v-model="forgotPasswordVisible"
      title="找回密码"
      width="400px"
    >
      <p>请联系系统管理员重置密码</p>
      <p>联系电话：400-xxx-xxxx</p>
      <template #footer>
        <el-button @click="forgotPasswordVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const store = useStore()
    const loginFormRef = ref()
    const loading = ref(false)
    const forgotPasswordVisible = ref(false)

    const loginForm = reactive({
      username: '18916836260',
      password: 'mXDK52un'
    })

    const loginRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
      ]
    }

    const handleLogin = async () => {
      try {
        await loginFormRef.value.validate()
        loading.value = true

        await store.dispatch('login', loginForm)
        ElMessage.success('登录成功')
        router.push('/dashboard')
      } catch (error) {
        if (error.message) {
          ElMessage.error(error.message)
        }
      } finally {
        loading.value = false
      }
    }

    const showForgotPassword = () => {
      forgotPasswordVisible.value = true
    }

    return {
      loginFormRef,
      loginForm,
      loginRules,
      loading,
      forgotPasswordVisible,
      handleLogin,
      showForgotPassword,
      User,
      Lock
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  background: linear-gradient(to left, rgba(100, 180, 220, 0.3) 0%, rgba(200, 235, 255, 0.5) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-form {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #909399;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.login-tips {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}

.login-tips p {
  font-size: 12px;
  color: #909399;
  margin: 4px 0;
}

.login-tips .el-link {
  margin-top: 8px;
  font-size: 12px;
}

@media (max-width: 480px) {
  .login-form {
    padding: 32px 24px;
  }

  .login-header h1 {
    font-size: 24px;
  }
}
</style>

