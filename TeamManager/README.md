# TeamManager

团队成员与项目实现周期管理系统。

- **前端**：Vue 3 + Vite  
- **后端**：Node.js + Express  
- **数据库**：服务器端 SQLite 文件（全员共用同一份数据）

## 开发

```sh
pnpm install
pnpm rebuild better-sqlite3
pnpm dev
```

- 前端：http://localhost:5173（自动代理 `/api` → 后端）  
- 后端：http://localhost:3000  
- 数据库文件：`data/teammanager.sqlite`

默认管理员口令：`admin`

## 生产部署

```sh
pnpm install
pnpm rebuild better-sqlite3
pnpm build
pnpm start
```

浏览器访问 `http://服务器IP:3000`。  
数据统一保存在服务器的 `data/teammanager.sqlite`。

可用环境变量：

- `PORT`：端口，默认 `3000`
- `TM_DB_PATH`：自定义 SQLite 路径
- `TM_SESSION_SECRET`：会话密钥（上线务必修改）

## 清空数据库

停止服务后删除 `data/teammanager.sqlite`（以及同目录的 `-wal` / `-shm` 文件），再启动服务会自动建表并写入种子数据。

## 角色

- **管理员**：管理成员、项目、阶段、周负责人
- **普通成员**：查看分配阶段、填写周完成情况与交付物
