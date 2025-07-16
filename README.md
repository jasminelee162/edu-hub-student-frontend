# Edu Hub 学生端前端

本项目为 Edu Hub 教育平台的学生端前端，旨在为学生用户提供便捷、直观的学习与管理体验。项目基于现代前端技术栈开发，实现了与后端及管理端的高效联动。

---

## 项目简介

Edu Hub 是一个面向教育场景的一站式学习与管理平台，覆盖学生、教师、管理员三类角色。  
本仓库为**学生端前端**，主要实现学生相关的各类功能。

- 教师/管理端前端仓库：[edu-hub-admin-frontend](https://github.com/jasminelee162/edu-hub-admin-frontend)
- 后端仓库：[edu-hub-backend](https://github.com/jasminelee162/edu-hub-backend)

---

## 功能特性

- 学生注册与登录
- 个人信息管理
- 课程浏览与报名
- 在线学习与作业提交
- 成绩查询与反馈
- 通知公告查看
- 与教师、同学的互动交流

---

## 技术栈

- **框架**：Vue
- **UI 组件库**：Element Plus
- **网络请求**：Axios / Fetch API

---

## 快速开始

1. **克隆仓库**

   ```bash
   git clone https://github.com/jasminelee162/edu-hub-student-frontend.git
   cd edu-hub-student-frontend
   ```

2. **安装依赖**

   ```bash
   npm install
   # 或者
   yarn install
   ```

3. **启动本地开发环境**

   ```bash
   npm run dev
   # 或者
   yarn dev
   ```

4. **访问项目**

   打开浏览器，访问 [http://localhost:3000](http://localhost:3000)（端口号请根据实际配置修改）。

---

## 目录结构

```
├── public              # 静态资源
├── src
│   ├── assets          # 图片、样式等静态文件
│   ├── components      # 公共组件
│   ├── pages           # 页面组件
│   ├── services        # API 请求
│   ├── store           # 状态管理
│   └── utils           # 工具函数
├── package.json        # 项目信息及依赖
└── README.md
```

---

## 项目相关仓库

- 学生端前端（本仓库）：https://github.com/jasminelee162/edu-hub-student-frontend
- 教师/管理端前端：[edu-hub-admin-frontend](https://github.com/jasminelee162/edu-hub-admin-frontend)
- 后端接口：[edu-hub-backend](https://github.com/jasminelee162/edu-hub-backend)

---

## 贡献指南

欢迎参与项目开发与优化！

1. Fork 本仓库
2. 创建新分支：`git checkout -b feature/xxx`
3. 提交更改：`git commit -m 'feat: xxx'`
4. 推送分支并发起 Pull Request

---

## License

本项目采用 MIT License，详情请参见 [LICENSE](./LICENSE) 文件。
````
