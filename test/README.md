# 测试指南

本目录包含情感传播分析系统的完整测试套件。

## 测试文件说明

### 1. `system-check.sh` - 系统健康检查
快速检查所有服务是否正常运行。

```bash
bash test/system-check.sh
```

**检查项目：**
- Docker和Docker Compose安装
- 所有服务运行状态
- 端口可访问性
- 数据库连接
- API健康端点
- WebSocket连接

### 2. `api.test.js` - API集成测试
测试所有API端点的功能。

```bash
node test/api.test.js
```

**测试内容：**
- 健康检查
- 用户认证
- KOL管理（创建、列表）
- 事件管理
- 情感统计
- WebSocket连接

### 3. `frontend.test.js` - 前端UI测试
使用Puppeteer进行自动化UI测试。

```bash
node test/frontend.test.js
```

**测试内容：**
- 页面加载
- 赛博朋克样式
- 动画效果
- 页面导航
- 响应式设计
- 性能指标

### 4. `load-test.js` - 负载测试
模拟多用户并发访问，测试系统性能。

```bash
node test/load-test.js
```

**测试配置：**
- 10个并发用户
- 每用户100个请求
- 30秒测试时长
- 性能指标统计

### 5. `run-tests.sh` - 完整测试套件
运行所有测试，生成完整报告。

```bash
bash test/run-tests.sh
```

## 快速开始

### 1. 确保系统正在运行
```bash
docker-compose up -d
```

### 2. 运行快速健康检查
```bash
bash test/system-check.sh
```

### 3. 运行完整测试套件
```bash
bash test/run-tests.sh
```

## 测试环境准备

### 安装测试依赖
```bash
npm install --save-dev axios socket.io-client puppeteer ws
```

### 设置测试数据库（可选）
```bash
docker-compose -f test/docker-compose.test.yml up -d
```

## 故障排查

### 常见问题

1. **服务未启动**
   ```bash
   docker-compose ps
   docker-compose up -d
   ```

2. **端口被占用**
   ```bash
   # 检查端口占用
   lsof -i :3000
   lsof -i :3001
   ```

3. **测试依赖缺失**
   ```bash
   npm install
   ```

4. **权限问题**
   ```bash
   chmod +x test/*.sh
   ```

## 测试报告

### 截图
前端测试会在 `test/screenshots/` 目录生成截图：
- `homepage-final.png` - 主页完整截图
- `error-*.png` - 错误时的截图

### 日志
查看服务日志：
```bash
docker-compose logs -f [service_name]
```

## 性能基准

预期性能指标：
- API响应时间: < 200ms (P95)
- 页面加载时间: < 3s
- 并发用户支持: 50+
- 吞吐量: > 100 req/s

## CI/CD集成

### GitHub Actions示例
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Start services
        run: docker-compose up -d
      - name: Wait for services
        run: sleep 30
      - name: Run tests
        run: bash test/run-tests.sh
```

### Jenkins Pipeline示例
```groovy
pipeline {
    agent any
    stages {
        stage('Setup') {
            steps {
                sh 'docker-compose up -d'
                sh 'sleep 30'
            }
        }
        stage('Test') {
            steps {
                sh 'bash test/run-tests.sh'
            }
        }
        stage('Cleanup') {
            steps {
                sh 'docker-compose down'
            }
        }
    }
}
```

## 测试最佳实践

1. **定期运行测试**
   - 每次部署前运行完整测试
   - 每日运行健康检查

2. **监控测试结果**
   - 跟踪性能指标变化
   - 记录失败的测试

3. **保持测试更新**
   - 新功能添加相应测试
   - 更新测试数据

4. **测试环境隔离**
   - 使用独立的测试数据库
   - 避免影响生产数据

## 贡献指南

添加新测试时：
1. 在相应的测试文件中添加测试用例
2. 更新本README文档
3. 确保测试可独立运行
4. 提供清晰的错误信息