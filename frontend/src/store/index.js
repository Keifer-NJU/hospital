import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    token: localStorage.getItem('token') || null,
    orders: [],
    tasks: [],
    currentTask: null
  },
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    allOrders: state => state.orders,
    allTasks: state => state.tasks,
    getCurrentTask: state => state.currentTask
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    SET_USER(state, user) {
      state.user = user
    },
    CLEAR_AUTH(state) {
      state.token = null
      state.user = null
      localStorage.removeItem('token')
    },
    SET_ORDERS(state, orders) {
      state.orders = orders
    },
    SET_TASKS(state, tasks) {
      state.tasks = tasks
    },
    ADD_TASK(state, task) {
      state.tasks.unshift(task)
    },
    SET_CURRENT_TASK(state, task) {
      state.currentTask = task
    },
    UPDATE_TASK_PROGRESS(state, { taskId, progress }) {
      const task = state.tasks.find(t => t.id === taskId)
      if (task) {
        Object.assign(task, progress)
      }
      if (state.currentTask && state.currentTask.id === taskId) {
        Object.assign(state.currentTask, progress)
      }
    }
  },
  actions: {
    login({ commit }, { username, password }) {
      // 模拟登录验证
      if (username === '18916836260' && password === 'mXDK52un') {
        const token = 'mock-token-' + Date.now()
        const user = { username, name: '管理员' }
        commit('SET_TOKEN', token)
        commit('SET_USER', user)
        return Promise.resolve({ success: true })
      }
      return Promise.reject(new Error('用户名或密码错误'))
    },
    logout({ commit }) {
      commit('CLEAR_AUTH')
    },
    fetchOrders({ commit }, params = {}) {
      // 模拟获取订单数据
      const mockOrders = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        orderNo: `RK${String(20240800 + index).padStart(8, '0')}`,
        materialName: `医用耗材${index + 1}`,
        specification: `规格型号${index + 1}`,
        brand: `品牌${index + 1}`,
        auditStatus: ['PENDING', 'APPROVED', 'REJECTED'][index % 3],
        supplierName: `供应商${index + 1}`,
        quantity: Math.floor(Math.random() * 1000) + 1,
        plannedPrice: (Math.random() * 1000 + 100).toFixed(2),
        createTime: new Date(2024, 7, Math.floor(Math.random() * 30) + 1).toISOString()
      }))

      // 简单的筛选逻辑
      let filteredOrders = mockOrders
      if (params.orderNo) {
        filteredOrders = filteredOrders.filter(order =>
          order.orderNo.includes(params.orderNo)
        )
      }
      if (params.materialName) {
        filteredOrders = filteredOrders.filter(order =>
          order.materialName.includes(params.materialName)
        )
      }
      if (params.auditStatus) {
        filteredOrders = filteredOrders.filter(order =>
          order.auditStatus === params.auditStatus
        )
      }

      commit('SET_ORDERS', filteredOrders)
      return Promise.resolve(filteredOrders)
    },
    fetchTasks({ commit }) {
      // 模拟获取任务数据
      const mockTasks = [
        {
          id: 1,
          name: '批量填报任务001',
          description: '8月20日批量填报任务',
          status: 'COMPLETED',
          totalCount: 20,
          successCount: 18,
          failedCount: 2,
          currentStep: 'UPLOAD',
          progress: 100,
          operator: '张三',
          createTime: new Date(2024, 7, 20).toISOString()
        },
        {
          id: 2,
          name: '批量填报任务002',
          description: '8月21日批量填报任务',
          status: 'RUNNING',
          totalCount: 15,
          successCount: 8,
          failedCount: 1,
          currentStep: 'VALIDATE',
          progress: 60,
          operator: '李四',
          createTime: new Date(2024, 7, 21).toISOString()
        },
        {
          id: 3,
          name: '批量填报任务003',
          description: '8月22日批量填报任务',
          status: 'PENDING',
          totalCount: 25,
          successCount: 0,
          failedCount: 0,
          currentStep: 'VALIDATE',
          progress: 0,
          operator: '王五',
          createTime: new Date(2024, 7, 22).toISOString()
        },
        {
          id: 4,
          name: '批量填报任务004',
          description: '8月19日批量填报任务',
          status: 'FAILED',
          totalCount: 30,
          successCount: 12,
          failedCount: 18,
          currentStep: 'UPLOAD',
          progress: 40,
          operator: '赵六',
          createTime: new Date(2024, 7, 19).toISOString()
        }
      ]
      commit('SET_TASKS', mockTasks)
      return Promise.resolve(mockTasks)
    },
    createTask({ commit }, orders) {
      const task = {
        id: Date.now(),
        name: `批量填报任务${Date.now()}`,
        status: 'PENDING',
        totalCount: orders.length,
        successCount: 0,
        failedCount: 0,
        currentStep: 'VALIDATE',
        progress: 0,
        createTime: new Date().toISOString(),
        orders: orders.map(order => ({
          ...order,
          productId: `P${Math.random().toString(36).substr(2, 8)}`,
          validateStatus: 'PENDING',
          uploadStatus: 'PENDING',
          settlementType: Math.random() > 0.5 ? 1 : 2,
          type: Math.random() > 0.5 ? 1 : 2
        }))
      }
      commit('ADD_TASK', task)
      commit('SET_CURRENT_TASK', task)
      return Promise.resolve(task)
    }
  }
})
