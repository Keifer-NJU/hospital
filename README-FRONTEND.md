# 采购订单智能上报系统 - 前端版本

## 项目简介

采购订单智能上报系统前端演示版本，基于Vue 3开发，提供完整的用户界面和交互体验。系统采用模拟数据，可独立运行，无需后端服务支持。

## 快速开始

### 环境要求
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0

### 一键启动
```bash
# 1. 克隆项目
git clone https://github.com/Keifer-NJU/hospital.git
cd hospital/frontend

# 2. 安装依赖
npm install

# 3. 启动项目
npm run serve

# 4. 访问系统
# 打开浏览器访问: http://localhost:8080
```

## 环境安装

### Node.js 安装

#### macOS (推荐)
```bash
# 使用Homebrew安装
brew install node

# 验证安装
node --version  # 应显示 >= 16.0.0
npm --version   # 应显示 >= 8.0.0
```

### 提升依赖安装速度 (可选)
```bash
# 使用淘宝镜像源
npm config set registry https://registry.npmmirror.com
```

## 系统功能

### 🔐 用户登录
- 演示用户名/密码：admin/password
- 支持用户会话管理

### 📋 采购订单管理
- 订单列表查看和搜索
- 订单详情展示
- 实时状态更新

### 🎯 智能填报任务
- 批量数据校验
- 任务进度实时跟踪
- 任务控制：开始/停止/继续
- WebSocket模拟进度更新

### ⚙️ 系统设置
- 系统配置界面
- 帮助文档

## 项目特色

✅ **纯前端运行** - 无需配置数据库和后端服务  
✅ **模拟真实数据** - 内置完整的Mock数据  
✅ **响应式设计** - 支持桌面端和移动端  
✅ **实时进度** - 模拟WebSocket实时更新  
✅ **现代化UI** - 基于Element Plus组件库  

## 开发命令

```bash
# 开发模式（热重载）
npm run serve

# 生产构建
npm run build

# 代码检查
npm run lint
```

## 项目结构
```
frontend/
├── src/
│   ├── views/           # 页面组件
│   │   ├── Login.vue    # 登录页
│   │   ├── Layout.vue   # 主布局
│   │   ├── orders/      # 订单模块
│   │   └── tasks/       # 任务模块
│   ├── router/          # 路由配置
│   ├── store/           # 状态管理
│   └── assets/          # 静态资源
├── package.json         # 项目配置
└── vue.config.js       # Vue配置
```

## 技术栈

- **Vue 3** - 现代化前端框架
- **Element Plus** - Vue 3 UI组件库  
- **Vue Router** - 单页面路由
- **Vuex** - 状态管理
- **Day.js** - 日期处理
- **CSS3** - 现代化样式

## 常见问题

### Q: 启动后页面空白？
**A**: 检查控制台错误，确保Node.js版本 >= 16.0.0

### Q: 端口8080被占用？
**A**: 系统会自动选择其他可用端口，或在 `vue.config.js` 中修改端口

### Q: npm install 失败？
**A**: 尝试删除 `node_modules` 和 `package-lock.json`，重新安装：
```bash
rm -rf node_modules package-lock.json
npm install
```

### Q: 如何修改默认端口？
**A**: 编辑 `vue.config.js` 文件中的 `devServer.port` 配置

## 浏览器支持

- Chrome >= 87
- Firefox >= 78  
- Safari >= 14
- Edge >= 88

## 演示账号

| 用户名 | 密码 | 说明 |
|-------|------|------|
| admin | password | 系统管理员 |

## 部署说明

### 构建生产版本
```bash
npm run build
```
构建完成后，将 `dist/` 目录部署到任何Web服务器即可

### 静态部署示例
```bash
# 使用Python简单服务器
cd dist
python3 -m http.server 8000

# 使用Node.js serve
npm install -g serve
serve -s dist
```

---

**🚀 现在就开始体验吧！只需几分钟即可完成项目启动！**
