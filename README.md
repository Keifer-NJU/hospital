# 采购订单智能上报系统

## 项目简介

采购订单智能上报系统是一个基于Vue 3 + Spring Boot的全栈Web应用，专为医院采购订单的智能化管理和上报而设计。系统提供数据校验、批量填报、任务管理等功能。

## 项目架构

```
├── frontend/           # Vue 3前端项目
│   ├── src/
│   │   ├── views/      # 页面组件
│   │   ├── router/     # 路由配置
│   │   ├── store/      # Vuex状态管理
│   │   └── assets/     # 静态资源
│   └── package.json
├── src/                # Spring Boot后端项目
│   └── main/
│       ├── java/       # Java源码
│       └── resources/  # 配置文件
└── pom.xml            # Maven配置
```

## 技术栈

### 前端技术栈
- **Vue 3**: 渐进式JavaScript框架
- **Element Plus**: Vue 3组件库
- **Vue Router 4**: 官方路由管理器
- **Vuex 4**: 状态管理模式
- **Axios**: HTTP客户端
- **Day.js**: 轻量级日期处理库

### 后端技术栈
- **Spring Boot**: Java企业级应用框架
- **Maven**: 项目构建工具
- **Java**: 编程语言

## 环境要求

### 必需环境
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0 (随Node.js安装)
- **Java**: >= 8
- **Maven**: >= 3.6.0

### 推荐开发工具
- **VS Code**: 前端开发
- **IntelliJ IDEA**: 后端开发
- **Git**: 版本控制

## 环境安装指南

### 1. Node.js 安装

#### macOS (推荐使用Homebrew)
```bash
# 安装Homebrew (如果未安装)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装Node.js
brew install node

# 验证安装
node --version
npm --version
```

#### 直接下载安装
访问 [Node.js官网](https://nodejs.org/) 下载LTS版本并安装

### 2. Java 安装

#### macOS
```bash
# 使用Homebrew安装
brew install openjdk@11

# 验证安装
java -version
```

#### 手动安装
访问 [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) 或 [OpenJDK](https://openjdk.org/) 下载并安装

### 3. Maven 安装

#### macOS
```bash
# 使用Homebrew安装
brew install maven

# 验证安装
mvn -version
```

#### 手动安装
1. 访问 [Maven官网](https://maven.apache.org/download.cgi) 下载
2. 解压到指定目录
3. 配置环境变量 `PATH`

## 项目启动指南

### 1. 克隆项目
```bash
git clone https://github.com/Keifer-NJU/hospital.git
cd hospital
```

### 2. 启动后端服务

```bash
# 编译项目
mvn clean compile

# 启动Spring Boot应用 (端口: 8081)
mvn spring-boot:run

# 或者打包后运行
mvn clean package
java -jar target/hospital-1.0-SNAPSHOT.jar
```

### 3. 启动前端服务

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器 (端口: 8080)
npm run serve
```

### 4. 访问系统

- **前端地址**: http://localhost:8080
- **后端API**: http://localhost:8081/api

## 开发模式

### 前端开发
```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器 (热重载)
npm run serve

# 代码检查
npm run lint

# 构建生产版本
npm run build
```

### 后端开发
```bash
# 编译
mvn compile

# 运行测试
mvn test

# 打包
mvn package

# 启动应用
mvn spring-boot:run
```

## 主要功能

### 1. 用户认证
- 登录/登出功能
- 用户会话管理

### 2. 采购订单管理
- 订单列表查看
- 订单详情展示
- 订单状态跟踪

### 3. 填报任务管理
- 批量数据校验
- 智能填报处理
- 任务进度追踪
- 任务状态控制（开始/停止/继续）

### 4. 系统管理
- 系统配置管理
- 帮助文档

## 项目配置

### 前端配置
- **开发端口**: 8080 (可在 `vue.config.js` 中修改)
- **API代理**: 自动代理 `/api` 请求到后端服务
- **构建输出**: `dist/` 目录

### 后端配置
- **服务端口**: 8081 (可在 `application.properties` 中修改)
- **API前缀**: `/api`

## 常见问题

### Q: 前端启动时出现端口占用
**A**: 修改 `frontend/vue.config.js` 中的端口号，或关闭占用端口的进程

### Q: 后端启动失败
**A**: 检查Java版本和Maven配置，确保端口8081未被占用

### Q: API请求失败
**A**: 确认后端服务已启动，检查代理配置是否正确

### Q: npm install 速度慢
**A**: 使用淘宝镜像源
```bash
npm config set registry https://registry.npmmirror.com
```

## 部署指南

### 生产环境部署

#### 前端部署
```bash
cd frontend
npm run build
# 将 dist/ 目录部署到Web服务器
```

#### 后端部署
```bash
mvn clean package
java -jar target/hospital-1.0-SNAPSHOT.jar --spring.profiles.active=prod
```

## 版本信息

- **项目版本**: 1.0.0
- **创建日期**: 2024年8月
- **最后更新**: 2024年8月29日

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/新功能`)
3. 提交更改 (`git commit -am '添加新功能'`)
4. 推送到分支 (`git push origin feature/新功能`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

如有问题，请通过以下方式联系：
- GitHub Issues: [项目Issues](https://github.com/Keifer-NJU/hospital/issues)
- Email: your-email@example.com

---

**注意**: 首次启动前请确保所有依赖环境已正确安装，并按照上述步骤逐步操作。
