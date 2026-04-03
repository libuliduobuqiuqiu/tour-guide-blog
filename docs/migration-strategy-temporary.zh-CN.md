# 数据库迁移策略（暂行方案）

## 背景

当前项目同时存在两种数据库结构演进方式：

- GORM `AutoMigrate`（服务启动时自动调整结构）
- SQL migration 文件（`backend/migrations/*.sql`）

在多环境 + dump 导入场景下，SQL migration 的执行记录同步容易产生偏差，短期优先保证发布稳定与无感部署。

## 当前决策（临时）

1. 暂停在 `Makefile` 中提供 migration 执行入口（`migrate` / `remote-migrate` 已移除）。
2. 短期以 `AutoMigrate` 为主，保障迭代速度与部署连续性。
3. 保留 `backend/migrations` 目录用于历史归档与后续策略升级。

## 适用范围

- 当前阶段：功能快速迭代、风险可控的小结构变更。
- 不适合：高风险 DDL（删列、改类型、复杂数据回填）。

## 风险与控制

风险：

- `AutoMigrate` 对复杂变更不可控。
- 长期缺少明确版本化迁移链路。

控制措施：

- 重大结构变更前，先在测试环境演练。
- 发布前保留数据库备份（`mysqldump`）。
- 后续引入统一迁移工具时，再恢复严格 migration 流程。

## 后续计划（待排期）

1. 选型迁移工具（如 `goose` 或 `atlas`）。
2. 定义“开发环境与生产环境不同策略”（开发可 AutoMigrate，生产走 migration）。
3. 增加迁移一致性检查和回滚流程。

