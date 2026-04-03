# Tour Guide Blog CI/CD 实施总指南（可跨会话续做）

## 1. 文档用途

这是一份“持续实施指南”，用于把本项目 CI/CD 从当前基础能力逐步建设为可审计、可回滚、可扩展的发布系统。

适用场景：

- 你分多次迭代推进，不在一次会话完成
- 新会话中让助手先阅读本文件，再继续执行下一阶段
- 每阶段都要先验证、再推进

---

## 2. 当前状态（基线）

截至当前仓库，已落地：

- 后端单元测试与集成测试基础
- `Makefile` 测试目标
- GitHub Actions `CI` 工作流
- `CD Staging` / `CD Production` 工作流骨架
- 第一阶段实施文档：`docs/ci-cd-test-implementation-plan.zh-CN.md`

关键文件：

- `.github/workflows/ci.yml`
- `.github/workflows/cd-staging.yml`
- `.github/workflows/cd-production.yml`
- `Makefile`

---

## 3. 整体 CI/CD 流程设计

### 3.1 流水线主路径

1. 开发分支提交 PR
2. 触发 `CI`（测试 + 质量门禁）
3. PR 合并到 `main`
4. 触发 Staging 打包/部署（自动或手动）
5. Staging 验证通过
6. 手动触发 Production 发布（带审批）
7. 发布后健康检查与监控
8. 异常时执行回滚

### 3.2 设计原则（为什么这样设计）

- 分层门禁：单元、集成、构建分开，定位问题快
- 分环境发布：先预发再生产，降低线上风险
- 生产手动审批：把“发布动作”从“构建动作”解耦
- 产物化部署：用固定构建产物发布，避免环境漂移
- 可回滚优先：每次发布必须可逆

---

## 4. 分阶段实施计划

## 阶段 A：测试与 CI 门禁稳定化（当前进行中）

目标：PR 合并前自动阻断明显质量问题。

要完成：

- 后端单元测试与基础集成测试稳定运行
- 前端先执行 `lint + build` 作为基础门禁
- CI 在 PR 上强制通过

验收标准：

- PR 必须通过 `CI`
- 默认分支最近 10 次流水线成功率 >= 90%
- 测试执行时间可接受（建议 < 8 分钟）

当前状态：已基本完成，可继续优化覆盖率与测试粒度。

---

## 阶段 B：测试覆盖扩展（推荐下一步）

目标：提升回归能力，让 CI 发现更多业务回归。

要完成：

- 前端引入 Vitest + Testing Library
- 后端集成测试接入 MySQL service + migration
- 关键接口增加成功/失败分支断言

建议优先级：

1. 前端 `lib` 与 `hooks`
2. 后端鉴权与配置类 API
3. 首页与管理后台关键页面链路

验收标准：

- 前端可执行 `npm run test`
- 后端集成测试真实连接测试数据库
- 至少覆盖“登录、鉴权、核心读取接口、核心写入接口”

---

## 阶段 C：覆盖率与质量阈值门禁

目标：把“质量目标”转为“自动化门禁规则”。

要完成：

- 设置后端覆盖率阈值（初始可 40%）
- 设置前端覆盖率阈值（初始可 30%）
- 低于阈值时 CI 失败
- 可上传覆盖率报告 artifact

验收标准：

- 覆盖率结果可追溯
- 阈值策略团队认可
- 不出现“覆盖率门禁长期被跳过”

---

## 阶段 D：Staging 自动部署闭环

目标：合并主干后，自动在预发完成“部署 + 验证”。

要完成：

- 配置 staging 环境 Secrets
- 固化部署脚本（上传、解压、重启）
- 增加 smoke test（健康检查、关键 API 可用性）
- 部署失败自动标红并通知

验收标准：

- main 分支每次成功构建可在 staging 可访问
- smoke test 自动执行
- 失败有明确信号与日志

---

## 阶段 E：Production 审批发布与回滚机制

目标：生产发布可控、可审计、可快速恢复。

要完成：

- GitHub Environment `production` 开启审批
- 发布前检查（tag、构建产物、变更摘要）
- 发布后检查（健康接口、关键页面）
- 回滚脚本（恢复上一版本产物）

验收标准：

- 每次发布有审批记录
- 回滚演练成功（至少一次）
- 生产故障 MTTR 明显下降

---

## 阶段 F：高级发布能力（可选）

目标：进一步降低发布风险。

要完成（按需选择）：

- 蓝绿/灰度发布
- 自动化数据库变更策略（向前兼容 + 分步迁移）
- 安全扫描（依赖漏洞、镜像扫描、SAST）
- 通知与可观测性集成（飞书/Slack/邮件）

---

## 5. 每阶段执行模板（标准作业）

每次只推进一个阶段，按以下顺序：

1. 明确范围（本次只做什么，不做什么）
2. 修改代码/工作流
3. 本地验证
4. CI 验证
5. 文档更新
6. 输出“下一阶段建议”

建议每次提交附带：

- 变更文件列表
- 验证命令与结果
- 风险点
- 回滚方式

---

## 6. 关键配置清单

### 6.1 GitHub Secrets（Staging）

- `STAGING_SSH_HOST`
- `STAGING_SSH_USER`
- `STAGING_SSH_KEY`
- `STAGING_REMOTE_DIR`
- 可选：`STAGING_SSH_PORT`
- 可选：`STAGING_BACKEND_SERVICE`
- 可选：`STAGING_FRONTEND_SERVICE`

### 6.2 GitHub Secrets（Production）

- `PROD_SSH_HOST`
- `PROD_SSH_USER`
- `PROD_SSH_KEY`
- `PROD_REMOTE_DIR`
- 可选：`PROD_SSH_PORT`
- 可选：`PROD_BACKEND_SERVICE`
- 可选：`PROD_FRONTEND_SERVICE`

### 6.3 GitHub Environment

- `staging`：可不强制审批
- `production`：强制审批（推荐）

---

## 7. 风险与控制

常见风险：

- 测试不稳定（flaky）导致门禁失真
- 部署脚本与服务器状态耦合过强
- 缺少回滚演练，线上问题恢复慢

控制措施：

- 先稳定测试，再提高覆盖率阈值
- 产物化部署，避免远程临时构建
- 每个阶段都写清回滚步骤并演练

---

## 8. 新会话接手指令模板（直接复制）

在新会话中可直接发：

```text
请先阅读 docs/ci-cd-master-guide.zh-CN.md 和 docs/ci-cd-test-implementation-plan.zh-CN.md。
先给我一个“当前阶段判断 + 本次只推进一个阶段”的执行方案。
然后直接落地改动，并给出验证结果与剩余风险。
```

---

## 9. 本项目推荐下一步（按优先级）

1. 阶段 B：前端接入 Vitest + Testing Library（先 `lib` 与 `hooks`）
2. 阶段 B：后端集成测试接入 MySQL service + migration
3. 阶段 C：增加覆盖率阈值门禁
4. 阶段 D：完善 staging 的 smoke test 和失败通知

