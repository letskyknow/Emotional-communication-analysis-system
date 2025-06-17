# 🚀 快速启动指南

## 一键启动（无需配置）

系统已经包含所有必要的默认配置，您可以直接启动：

```bash
# 进入项目目录
cd emotion-analysis-system

# 一键启动（推荐）
./start.sh

# 或者使用 docker compose
docker compose up -d
```

就这么简单！系统会自动：
- ✅ 创建所有必要的数据库
- ✅ 自动初始化数据库表结构
- ✅ 创建默认用户账号（admin/admin123, demo/demo123）
- ✅ 配置JWT认证（已生成安全密钥）
- ✅ 启动所有服务

## 完全重新构建

如果您需要清除所有数据和缓存，完全重新构建：

```bash
# 完全清理并重建（会删除所有数据！）
./clean-restart.sh
```

这会：
- 🗑️ 删除所有容器和数据卷
- 🧹 清理所有Docker镜像缓存
- 🔨 重新构建所有服务
- 🚀 全新启动系统

## 访问系统

启动后等待约30秒，然后访问：

- 🌐 **前端界面**: http://localhost
- 📡 **API接口**: http://localhost/api
- 📚 **API文档**: http://localhost/api/docs

## 默认登录凭据

**管理员账号：**
- 👤 **用户名**: admin
- 🔑 **密码**: admin123

**演示账号：**
- 👤 **用户名**: demo
- 🔑 **密码**: demo123

## 关于JWT密钥

系统已经在 `.env` 文件中配置了一个安全的JWT密钥：
```
JWT_SECRET=xK9$mP2@nL5#qR8*tU3&vW6^yZ1!aB4%cD7(eF0)gH3-jK6_mN9+pQ2=sT5?uV8@wX1#zA4$
```

这个密钥是随机生成的，包含：
- 大小写字母
- 数字
- 特殊字符
- 足够的长度（80个字符）

**注意**: 在生产环境中，请更换为您自己的密钥！

## 常用命令

```bash
# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f

# 停止系统
docker compose down

# 重启系统
docker compose restart

# 完全清理（包括数据）
docker compose down -v
```

## 故障排查

如果系统无法启动：

1. **检查端口占用**
   ```bash
   # 检查80端口（前端）
   lsof -i :80
   # 检查3000端口（API）
   lsof -i :3000
   ```

2. **查看详细日志**
   ```bash
   docker compose logs api
   docker compose logs frontend
   ```

3. **重新构建镜像**
   ```bash
   docker compose build --no-cache
   docker compose up -d
   ```

## 生产环境部署

在生产环境部署前，请：

1. **更改JWT密钥**
   ```bash
   # 生成新的JWT密钥
   openssl rand -base64 64
   ```
   将生成的密钥更新到 `.env` 文件的 `JWT_SECRET`

2. **更改默认密码**
   登录后立即修改admin密码

3. **配置真实的数据库密码**
   更新 `.env` 中的数据库密码

4. **启用HTTPS**
   配置Nginx使用SSL证书

## 需要帮助？

- 📖 查看完整文档: [USER_GUIDE.md](docs/USER_GUIDE.md)
- 🧪 运行测试: `bash test/run-tests.sh`
- 💬 提交问题: GitHub Issues