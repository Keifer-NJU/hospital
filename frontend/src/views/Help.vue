<template>
  <div class="help-center">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">帮助中心</h2>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索帮助内容"
          style="width: 300px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="help-content">
        <el-row :gutter="20">
          <!-- 侧边栏导航 -->
          <el-col :span="6">
            <div class="help-nav">
              <el-menu
                :default-active="activeSection"
                @select="handleMenuSelect"
                mode="vertical"
              >
                <el-menu-item index="overview">
                  <el-icon><InfoFilled /></el-icon>
                  系统概述
                </el-menu-item>
                <el-menu-item index="login">
                  <el-icon><User /></el-icon>
                  登录指南
                </el-menu-item>
                <el-menu-item index="orders">
                  <el-icon><Document /></el-icon>
                  订单管理
                </el-menu-item>
                <el-menu-item index="tasks">
                  <el-icon><List /></el-icon>
                  任务管理
                </el-menu-item>
                <el-menu-item index="troubleshooting">
                  <el-icon><Tools /></el-icon>
                  故障排除
                </el-menu-item>
                <el-menu-item index="faq">
                  <el-icon><QuestionFilled /></el-icon>
                  常见问题
                </el-menu-item>
              </el-menu>
            </div>
          </el-col>

          <!-- 主内容区 -->
          <el-col :span="18">
            <div class="help-main">
              <!-- 系统概述 -->
              <div v-show="activeSection === 'overview'" class="help-section">
                <h3>系统概述</h3>
                <div class="content-block">
                  <h4>系统简介</h4>
                  <p>采购订单管理系统是为了解决医院与医保药械平台数据上传问题而开发的智能化系统。系统实现了以下核心功能：</p>
                  <ul>
                    <li>与HRP系统对接，自动获取入库单数据</li>
                    <li>提供筛选查询功能，支持多条件组合查询</li>
                    <li>批量填报功能，提高工作效率</li>
                    <li>任务管理，实时跟踪填报进度</li>
                    <li>数据校验，确保填报数据准确性</li>
                  </ul>
                </div>

                <div class="content-block">
                  <h4>系统架构</h4>
                  <p>系统采用前后端分离架构：</p>
                  <ul>
                    <li><strong>前端</strong>：Vue.js + Element Plus，提供现代化的用户界面</li>
                    <li><strong>后端</strong>：Spring Boot，提供稳定的API服务</li>
                    <li><strong>数据库</strong>：MySQL，存储业务数据</li>
                    <li><strong>部署</strong>：Docker容器化部署</li>
                  </ul>
                </div>
              </div>

              <!-- 登录指南 -->
              <div v-show="activeSection === 'login'" class="help-section">
                <h3>登录指南</h3>
                <div class="content-block">
                  <h4>登录步骤</h4>
                  <ol>
                    <li>打开系统登录页面</li>
                    <li>输入用户名和密码</li>
                    <li>点击"登录"按钮</li>
                    <li>登录成功后自动跳转到系统首页</li>
                  </ol>
                </div>

                <div class="content-block">
                  <h4>默认账号</h4>
                  <el-alert type="info" :closable="false" style="margin-bottom: 16px">
                    <p><strong>用户名：</strong>18916836260</p>
                    <p><strong>密码：</strong>mXDK52un</p>
                  </el-alert>
                </div>

                <div class="content-block">
                  <h4>忘记密码</h4>
                  <p>如果忘记密码，请点击登录页面的"忘记密码"链接，联系系统管理员重置密码。</p>
                </div>
              </div>

              <!-- 订单管理 -->
              <div v-show="activeSection === 'orders'" class="help-section">
                <h3>订单管理</h3>
                <div class="content-block">
                  <h4>查询订单</h4>
                  <p>系统提供多种查询条件：</p>
                  <ul>
                    <li><strong>入库单号</strong>：精确匹配入库单号</li>
                    <li><strong>物资名称</strong>：模糊匹配物资名称</li>
                    <li><strong>规格型号</strong>：模糊匹配规格型号</li>
                    <li><strong>品牌</strong>：模糊匹配品牌信息</li>
                    <li><strong>审核状态</strong>：选择特定的审核状态</li>
                    <li><strong>时间范围</strong>：选择创建时间范围</li>
                  </ul>
                </div>

                <div class="content-block">
                  <h4>批量填报</h4>
                  <ol>
                    <li>在订单列表中勾选需要填报的订单</li>
                    <li>点击"批量填报"按钮</li>
                    <li>系统会创建一个填报任务</li>
                    <li>自动跳转到任务详情页面</li>
                  </ol>
                </div>

                <div class="content-block">
                  <h4>导出数据</h4>
                  <p>点击"导出数据"按钮可以将当前查询结果导出为Excel或CSV格式文件。</p>
                </div>
              </div>

              <!-- 任务管理 -->
              <div v-show="activeSection === 'tasks'" class="help-section">
                <h3>任务管理</h3>
                <div class="content-block">
                  <h4>任务流程</h4>
                  <p>每个填报任务包含两个步骤：</p>
                  <ol>
                    <li><strong>数据校验</strong>：验证订单数据的完整性和准确性</li>
                    <li><strong>数据填报</strong>：向医保平台提交验证通过的数据</li>
                  </ol>
                </div>

                <div class="content-block">
                  <h4>任务状态</h4>
                  <ul>
                    <li><strong>等待中</strong>：任务已创建，等待开始处理</li>
                    <li><strong>进行中</strong>：任务正在执行中</li>
                    <li><strong>已完成</strong>：任务执行完成</li>
                    <li><strong>失败</strong>：任务执行失败</li>
                  </ul>
                </div>

                <div class="content-block">
                  <h4>实时进度</h4>
                  <p>系统采用WebSocket技术实现实时进度更新，用户可以看到：</p>
                  <ul>
                    <li>总体进度百分比</li>
                    <li>当前处理的具体订单</li>
                    <li>成功、失败、处理中的数量统计</li>
                    <li>详细的处理日志</li>
                  </ul>
                </div>
              </div>

              <!-- 故障排除 -->
              <div v-show="activeSection === 'troubleshooting'" class="help-section">
                <h3>故障排除</h3>
                <div class="content-block">
                  <h4>登录问题</h4>
                  <ul>
                    <li><strong>无法登录</strong>：检查用户名和密码是否正确</li>
                    <li><strong>登录超时</strong>：刷新页面重新登录</li>
                    <li><strong>账号被锁定</strong>：联系管理员解锁</li>
                  </ul>
                </div>

                <div class="content-block">
                  <h4>数据加载问题</h4>
                  <ul>
                    <li><strong>数据加载缓慢</strong>：检查网络连接，减少查询条件</li>
                    <li><strong>数据不显示</strong>：检查HRP系统连接状态</li>
                    <li><strong>数据不准确</strong>：联系技术支持检查数据同步</li>
                  </ul>
                </div>

                <div class="content-block">
                  <h4>任务执行问题</h4>
                  <ul>
                    <li><strong>任务卡住</strong>：刷新页面或重新创建任务</li>
                    <li><strong>填报失败</strong>：检查医保平台连接和数据格式</li>
                    <li><strong>进度不更新</strong>：检查WebSocket连接</li>
                  </ul>
                </div>
              </div>

              <!-- 常见问题 -->
              <div v-show="activeSection === 'faq'" class="help-section">
                <h3>常见问题</h3>
                <el-collapse v-model="activeCollapse">
                  <el-collapse-item title="为什么无法看到订单数据？" name="1">
                    <p>可能的原因：</p>
                    <ul>
                      <li>HRP系统连接异常</li>
                      <li>用户权限不足</li>
                      <li>查询条件过于严格</li>
                    </ul>
                    <p>解决方法：检查网络连接，联系管理员确认权限，适当放宽查询条件。</p>
                  </el-collapse-item>

                  <el-collapse-item title="批量填报任务为什么会失败？" name="2">
                    <p>常见失败原因：</p>
                    <ul>
                      <li>医保平台搜不到该产品或公司</li>
                      <li>产品信息不匹配（名称、规格、品牌等）</li>
                      <li>网络连接超时</li>
                      <li>医保平台维护中</li>
                    </ul>
                    <p>解决方法：检查产品信息准确性，确认网络连接，联系医保平台确认服务状态。</p>
                  </el-collapse-item>

                  <el-collapse-item title="如何提高填报成功率？" name="3">
                    <p>建议：</p>
                    <ul>
                      <li>确保产品信息完整准确</li>
                      <li>避免在医保平台维护时间填报</li>
                      <li>分批次进行填报，避免一次性提交过多数据</li>
                      <li>定期检查和更新产品主数据</li>
                    </ul>
                  </el-collapse-item>

                  <el-collapse-item title="系统支持哪些浏览器？" name="4">
                    <p>推荐使用以下浏览器：</p>
                    <ul>
                      <li>Chrome 90+</li>
                      <li>Firefox 88+</li>
                      <li>Safari 14+</li>
                      <li>Edge 90+</li>
                    </ul>
                    <p>不建议使用IE浏览器。</p>
                  </el-collapse-item>

                  <el-collapse-item title="如何联系技术支持？" name="5">
                    <p>技术支持方式：</p>
                    <ul>
                      <li>电话：400-xxx-xxxx</li>
                      <li>邮箱：support@example.com</li>
                      <li>工作时间：周一至周五 9:00-18:00</li>
                    </ul>
                    <p>紧急情况可通过系统管理员联系。</p>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import {
  Search,
  InfoFilled,
  User,
  Document,
  List,
  Tools,
  QuestionFilled
} from '@element-plus/icons-vue'

export default {
  name: 'Help',
  components: {
    Search,
    InfoFilled,
    User,
    Document,
    List,
    Tools,
    QuestionFilled
  },
  setup() {
    const searchKeyword = ref('')
    const activeSection = ref('overview')
    const activeCollapse = ref(['1'])

    const handleMenuSelect = (key) => {
      activeSection.value = key
    }

    return {
      searchKeyword,
      activeSection,
      activeCollapse,
      handleMenuSelect
    }
  }
}
</script>

<style scoped>
.help-center {
  height: 100%;
}

.help-content {
  margin-top: 20px;
}

.help-nav {
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.help-main {
  background: #fff;
  border-radius: 6px;
  padding: 24px;
  min-height: 600px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.help-section h3 {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 24px;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 8px;
}

.content-block {
  margin-bottom: 32px;
}

.content-block h4 {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 12px;
  font-weight: 600;
}

.content-block p {
  line-height: 1.6;
  color: var(--text-regular);
  margin-bottom: 12px;
}

.content-block ul,
.content-block ol {
  padding-left: 20px;
  color: var(--text-regular);
  line-height: 1.6;
}

.content-block li {
  margin-bottom: 8px;
}

.content-block li strong {
  color: var(--text-primary);
}

:deep(.el-menu) {
  border: none;
}

:deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
}

:deep(.el-menu-item.is-active) {
  background-color: #ecf5ff;
  color: var(--primary-color);
}

:deep(.el-collapse-item__header) {
  font-weight: 600;
}

@media (max-width: 768px) {
  .help-content .el-col:first-child {
    margin-bottom: 20px;
  }

  .help-main {
    padding: 16px;
  }

  .help-section h3 {
    font-size: 20px;
  }
}
</style>

