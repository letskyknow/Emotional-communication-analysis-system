# 情绪传播分析系统

一个实时社交媒体情绪分析与传播追踪系统，具有赛博朋克风格的用户界面和高级可视化功能。该系统基于深度学习技术，能够实时分析社交媒体上的情绪传播模式，帮助理解公众情绪的演变规律。

## 系统简介

本系统旨在通过大数据和人工智能技术，深入分析社交媒体中的情绪传播现象。通过追踪关键意见领袖（KOL）和重要事件，系统能够：

- 实时监测和分析社交媒体情绪动态
- 揭示情绪在网络中的传播路径和规律
- 预测潜在的舆情风险
- 为决策提供数据支持

详细的理论基础和研究背景请参阅 [研究报告](./RESEARCH_REPORT.md)。

## 🚀 核心功能

- **实时情绪分析**：基于深度学习的8维情绪识别（喜悦、信任、恐惧、惊讶、悲伤、厌恶、愤怒、期待）
- **传播路径追踪**：可视化展示情绪在社交网络中的传播路径
- **KOL管理**：追踪最多50位关键意见领袖的情绪影响力
- **事件监控**：支持同时监控10个事件，通过关键词追踪相关讨论
- **智能预警**：情绪异常自动预警，分级推送通知
- **赛博朋克UI**：炫酷的霓虹灯效果和动态可视化
- **实时更新**：WebSocket驱动的实时数据流
- **情绪报告**：自动生成情绪分析报告

## 🛠️ 技术架构

### 前端技术栈
- Next.js 14 (App Router) - React框架
- TypeScript - 类型安全
- Tailwind CSS - 样式框架
- Framer Motion - 动画效果
- D3.js & Recharts - 数据可视化
- Socket.io Client - 实时通信
- Zustand - 状态管理

### 后端技术栈
- NestJS - Node.js框架
- TypeORM & Mongoose - 数据库ORM
- PostgreSQL - 关系型数据库
- MongoDB - 文档数据库
- Redis - 缓存和消息队列
- Bull Queue - 任务队列
- Socket.io - WebSocket服务

### 数据采集与分析
- Python 3.11 - 数据处理
- Snscrape - 社交媒体数据采集
- Transformers - 情绪分析模型
- BERT/RoBERTa - 预训练模型

## 📋 系统要求

- Docker & Docker Compose（必需）
- 8GB+ 内存
- 20GB+ 磁盘空间

## 🚀 一键启动指南（小白友好版）

### Windows用户

1. **安装Docker Desktop**
   - 访问 https://www.docker.com/products/docker-desktop/
   - 下载并安装Docker Desktop for Windows
   - 安装完成后重启电脑

2. **下载项目代码**
   - 下载项目ZIP文件并解压
   - 或使用Git命令：
   ```bash
   git clone https://github.com/yourusername/emotion-analysis-system.git
   cd emotion-analysis-system
   ```

3. **配置环境变量**
   ```bash
   # Windows用户在PowerShell中执行
   copy .env.example .env
   ```

4. **一键启动系统**
   ```bash
   docker-compose up -d
   ```

5. **访问系统**
   - 等待3-5分钟系统完全启动
   - 打开浏览器访问: http://localhost
   - 默认账号: `admin`
   - 默认密码: `admin`

### Mac/Linux用户

1. **安装Docker**
   - Mac: 安装Docker Desktop for Mac
   - Linux: 使用包管理器安装docker和docker-compose

2. **下载并启动**
   ```bash
   # 下载代码
   git clone https://github.com/yourusername/emotion-analysis-system.git
   cd emotion-analysis-system
   
   # 复制配置文件
   cp .env.example .env
   
   # 一键启动
   docker-compose up -d
   ```

3. **访问系统**
   - 浏览器访问: http://localhost
   - 使用默认账号密码登录

## 💡 使用指南

### 第一步：登录系统
1. 打开浏览器访问 http://localhost
2. 使用默认账号密码登录（admin/admin）
3. 首次登录建议修改密码

### 第二步：添加KOL（关键意见领袖）
1. 进入"KOL管理"页面
2. 点击"添加KOL"按钮
3. 输入KOL的社交媒体账号（如 @username）
4. 选择分类（科技、金融、娱乐等）
5. 系统会自动开始追踪该KOL的发文和情绪

### 第三步：创建事件监控
1. 进入"事件管理"页面
2. 点击"创建事件"
3. 填写事件信息：
   - 事件名称：如"新产品发布"
   - 关键词：相关的搜索关键词
   - 时间范围：监控的起止时间
4. 系统会自动收集相关讨论并分析情绪

### 第四步：查看分析结果
1. **仪表盘**：实时查看整体情绪趋势
2. **情绪分析**：查看8维情绪分布
3. **传播路径**：了解情绪如何在网络中传播
4. **影响力排名**：查看KOL的情绪影响力
5. **预警中心**：查看系统自动识别的异常情绪

### 高级功能
- **批量导入KOL**：支持CSV文件批量导入
- **自定义预警规则**：设置个性化的预警条件
- **数据导出**：导出分析报告和原始数据
- **API接入**：通过API获取分析结果

## 🔧 系统管理

### 查看系统状态
```bash
# 查看所有服务状态
docker-compose ps

# 查看特定服务日志
docker logs emotion-frontend  # 前端日志
docker logs emotion-api       # API日志
docker logs emotion-scraper   # 数据采集日志
```

### 停止和重启系统
```bash
# 停止系统
docker-compose stop

# 重启系统
docker-compose restart

# 完全停止并删除容器
docker-compose down
```

### 更新系统
```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 数据备份
```bash
# 备份PostgreSQL数据
docker exec emotion-postgres pg_dump -U postgres emotion_db > backup.sql

# 备份MongoDB数据
docker exec emotion-mongo mongodump --out /backup
```

## 🐛 常见问题解决

### 1. Docker启动失败
**问题**：运行`docker-compose up -d`时报错

**解决方案**：
```bash
# 确保Docker正在运行
docker --version

# 清理旧容器和镜像
docker system prune -a

# 重新启动
docker-compose up -d
```

### 2. 无法访问系统
**问题**：浏览器无法打开 http://localhost

**解决方案**：
- 检查是否有其他程序占用80端口
- 等待3-5分钟让系统完全启动
- 查看前端服务日志：`docker logs emotion-frontend`

### 3. 登录失败
**问题**：使用admin/admin无法登录

**解决方案**：
```bash
# 重置数据库
docker-compose down -v
docker-compose up -d
```

### 4. 数据采集没有数据
**问题**：添加KOL后没有看到数据

**解决方案**：
- 数据采集需要时间，请等待10分钟
- 检查采集服务状态：`docker logs emotion-scraper`
- 由于Twitter限制，系统会使用模拟数据进行演示

### 5. 系统运行缓慢
**问题**：页面加载慢或卡顿

**解决方案**：
- 确保Docker分配了足够的内存（至少4GB）
- Windows用户：Docker Desktop → Settings → Resources → 增加内存
- 减少同时监控的KOL和事件数量

### 6. 中文显示乱码
**问题**：界面中文显示不正常

**解决方案**：
- 确保浏览器编码设置为UTF-8
- 清除浏览器缓存后刷新页面

## 📝 API文档

完整API文档访问地址：http://localhost/api/docs

### 主要接口
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `GET /kols` - 获取KOL列表
- `POST /kols` - 添加新KOL
- `GET /events` - 获取事件列表
- `POST /events` - 创建新事件
- `GET /emotion/trends` - 获取情绪趋势
- `GET /emotion/heatmap` - 获取情绪热力图
- `WS /socket.io` - WebSocket实时连接

### API调用示例
```javascript
// 登录
const response = await fetch('http://localhost/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin' })
});

// 添加KOL
const response = await fetch('http://localhost/api/kols', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ username: 'elonmusk', category: '科技' })
});
```

## 📊 核心算法说明

### 情绪传播得分算法
```
传播得分 = (转发率 × 0.4 + 评论率 × 0.3 + 点赞率 × 0.2 + 情绪强度 × 0.1) × 10
```

### KOL影响力算法
```
影响力得分 = log(粉丝数) × 活跃系数 × 情绪系数 × 时间衰减因子

其中：
- 活跃系数 = 发文频率 / 平均发文频率
- 情绪系数 = 情绪强度 × 情绪一致性
- 时间衰减因子 = e^(-λt)
```

### 情绪分类维度
系统采用Plutchik情绪轮理论，将情绪分为8个基本维度：
1. **喜悦 (Joy)** - 正面积极情绪
2. **信任 (Trust)** - 安全感和信赖
3. **恐惧 (Fear)** - 担忧和害怕
4. **惊讶 (Surprise)** - 意外和震惊
5. **悲伤 (Sadness)** - 负面消极情绪
6. **厌恶 (Disgust)** - 反感和排斥
7. **愤怒 (Anger)** - 生气和不满
8. **期待 (Anticipation)** - 期望和兴奋

## 🎯 应用场景

1. **品牌监测**：实时了解消费者对品牌的情绪反应
2. **舆情预警**：及时发现负面情绪聚集，预防危机
3. **营销效果评估**：量化营销活动的情绪影响
4. **竞品分析**：对比不同品牌的情绪表现
5. **市场研究**：理解用户需求和情绪偏好
6. **政策评估**：了解公众对政策的情绪反应

## 🔗 相关资源

- [研究报告](./RESEARCH_REPORT.md) - 详细的理论基础和学术背景
- [API文档](http://localhost/api/docs) - 完整的接口文档
- [Docker文档](https://docs.docker.com/) - Docker使用指南
- [项目主页](https://github.com/yourusername/emotion-analysis-system) - 获取最新更新

## 📞 技术支持

如遇到问题，请通过以下方式获取帮助：
1. 查看本文档的常见问题解决部分
2. 访问项目Issues页面
3. 联系技术支持邮箱：support@example.com

---

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>