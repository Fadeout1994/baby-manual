# 交接说明（HANDOFF）

> **最后更新：2026-11-05**
> 面向：后续接手本项目的开发者，或下一次 Claude Code 会话。

## 1. 项目概览

- **名称**：宝宝使用说明书 · 成长时间轴
- **形态**：纯静态单页网页，无框架、无构建步骤、无第三方运行时依赖。
- **用途**：按宝宝出生日期动态生成 0—3 岁成长时间轴，覆盖衣、食、住、行、社交、医疗、疫苗、学习，重点展开疫苗对比、行为习惯培养、饮食与营养补充。
- **分享定位**：部署在公开仓库，供其他家庭使用；页面默认资料为匿名示例，用户可自行修改性别、生日、称呼。

## 2. 线上地址

- **站点**：https://fadeout1994.github.io/baby-manual/
- **仓库**：https://github.com/Fadeout1994/baby-manual （`main` 分支）
- **Pages 配置**：Settings → Pages → Deploy from a branch → `main` / `(root)`
- **参考项目**：https://github.com/Fadeout1994/kids-docs

## 3. 当前状态

- 已部署并通过线上校验：站点返回 HTTP 200，线上 `index.html` / `styles.css` / `script.js` 与本地脱敏版本逐字节一致。
- 基线提交：`19d18aa`（本次 HANDOFF 更新在其之后）。
- 本地 `main` 与 `origin/main` 一致，工作区干净。
- 无自动化测试；验证方式见第 7 节。

## 4. 文件结构

| 文件 | 职责 |
| --- | --- |
| `index.html` | 页面结构、疫苗对比表、预算计算器、资料来源 |
| `styles.css` | 柔和“蒙特利”配色、纵向时间轴、响应式布局（断点 620px） |
| `script.js` | 时间节点数据、动态月龄、勾选存储、备份导入导出、预算逻辑 |
| `README.md` | 使用与部署说明 |
| `HANDOFF.md` | 本交接文件 |

## 5. 关键实现

### 5.1 动态月龄与节点日期

- `getMilestoneDate(item)`：`month-N` 节点用 `addMonthsClamped(BIRTH_DATE, N)` 做月偏移（月末自动钳制到当月最后一天）；`day-N` 节点用固定天数偏移：`birth=0`、`day-4=+3`、`day-8=+7`、`day-15=+14`、`day-43=+42`。
- `milestones` 数据中**不存硬编码日期**，修改生日后整条时间轴自动重算。
- 每次打开页面以 `todayAtNoon()`（本地当天正午，避免时区/夏令时边界）重新定位：当前节点、下一节点、月龄、出生天数、轮状疫苗周龄提醒。

### 5.2 时间轴数据模型（`script.js` 的 `milestones`）

- 共 19 个节点：`birth`、`day-4`、`day-8`、`day-15`、`month-1`、`day-43`、`month-2`、`month-3`、`month-4`、`month-5`、`month-6`、`month-8`、`month-9`、`month-12`、`month-15`、`month-18`、`month-24`、`month-30`、`month-36`。
- **每日事项（`daily`）只出现在阶段起点**：`birth`、`month-1`、`month-6`、`month-12`、`month-24`，避免同一提醒在多个节点重复。
- 任务可以是普通字符串，也可以是 `{ female, male }` 对象（例如 `month-2` 的私处护理），由 `getTaskText()` 按当前性别取文案。

### 5.3 性别适配

- `SEX_PROFILE` 常量：
  - `female`：默认称呼「小棉袄」，图标 🎀 / 🌸 / 🌷
  - `male`：默认称呼「小盔甲」，图标 🧸 / 🌿 / 🌱
- 切换性别时，若当前昵称仍是默认值或旧默认值（`宝宝`、`小公主`），自动替换为对应性别的默认称呼；自定义昵称保持不变。
- `loadProfile()` 负责旧数据迁移：旧默认昵称会被替换，非法生日回退到匿名示例。

### 5.4 本地存储（localStorage）

| Key | 内容 |
| --- | --- |
| `baby-manual-profile-v1` | `{ birthDate, sex, nickname }` |
| `baby-manual-timeline-checks-v1-${birthDate}` | 已完成任务 id 数组，**按生日隔离** |

- 勾选记录按生日分 key 保存，换生日不会串记录；换回原生日可恢复。
- `saveProfile()` / `saveCompletedTasks()` 返回布尔值：浏览器禁用存储时页面仍可正常使用，仅本次打开期间有效。

### 5.5 导出 / 导入备份

- 备份格式：`{ app: 'baby-manual', version: 1, exportedAt, profile: { birthDate, sex, nickname }, completedTasks: string[] }`
- 导入校验：应用名与版本、生日格式且不晚于今天、性别枚举、昵称非空且 ≤12 字、任务 id 白名单（无法识别的旧版事项会被忽略并在状态栏提示）。
- 导入前 `window.confirm` 确认；只覆盖**本机同生日**的勾选记录，其他生日不受影响。
- 文件大小上限 1MB；导出文件名为 `宝宝使用说明书-${昵称}-${生日}.json`。

### 5.6 疫苗对比与预算

- `index.html` 内含国产/进口对比表：13 价肺炎球菌结合疫苗、轮状病毒疫苗、百白破/脊灰/Hib（免费方案与进口五联）。
- 广州价格口径：广东省现行非免疫规划疫苗服务费 **21 元/剂次**；疫苗费为公开样例价，页面已注明“以门诊报价为准”。
- 预算计算器（`initBudget()`）默认按 4 剂 PCV13、4 剂五联、3 剂轮状方案估算，支持“其他自费疫苗预留”输入。
- `rotaAlert` 根据当前周龄动态提示轮状疫苗首剂时间窗。
- 页面显示的“资料核对至 2026.11.05”与来源卡片需在更新资料时同步修改。

## 6. 更新与部署流程

1. 修改 `index.html` / `styles.css` / `script.js`。
2. 本地验证：浏览器直接打开 `index.html`；或执行 `node --check script.js` 检查语法。
3. 提交并推送：
   ```bash
   git add -A
   git commit -m "说明本次改动"
   git push origin main
   ```
4. GitHub Pages 会自动重建，通常 1—2 分钟内生效。

## 7. 验证建议（当前无自动化测试）

- 打开页面核对：月龄、出生天数、当前节点、下一节点是否与系统日期一致。
- 修改性别/生日/称呼：时间轴重算、默认昵称与图标切换、勾选记录按生日隔离。
- 导出后清空 localStorage 或换设备导入：资料与勾选恢复；损坏/错误版本文件被拒绝；取消确认框不产生覆盖。
- 移动端窄屏（≤620px）：表单、备份按钮、预算控件均为单列布局。
- 如需自动化：可用 Node `vm` 沙盒加载 `script.js`（需模拟 DOM/localStorage），或引入 Playwright。

## 8. 隐私与脱敏约束（重要）

- 仓库与站点均为**公开**，任何人都能读取全部文件。
- 默认资料已脱敏为匿名示例：生日 `2026-01-01`、称呼「宝宝」。
- **禁止**在代码、提交信息、README、本文件中写入真实姓名、准确生日、住址、就诊医院、证件号等隐私信息。
- 用户资料只保存在各自浏览器的 localStorage，不上传服务器。
- 备份 JSON 含宝宝生日与称呼，传输时应走可信渠道并妥善保管。
- 旧版脱敏占位符已从代码中清理；如后续发现残留，应删除而非保留。

## 9. 已知边界与后续可做

- **时效性**：疫苗程序与价格会变。页面核对日期为 2026-11-05，更新内容时务必同步修改 `index.html` 中的核对日期与来源链接。
- **单宝宝模型**：资料只保存一份；若需多宝宝，可扩展 `PROFILE_KEY` 与勾选 key 的命名。
- **无后端**：不能跨设备自动同步，备份文件就是迁移方案。
- **时间窗为估算**：轮状疫苗等按周龄粗算，最终以接种门诊判断为准。
- **本地存储隔离**：同浏览器不同域名（如本地 `file://` 与 GitHub Pages）记录不互通。

## 10. 关键函数索引（`script.js`）

| 函数 | 作用 |
| --- | --- |
| `loadProfile()` / `saveProfile()` | 读取/保存宝宝资料，含旧数据迁移 |
| `addMonthsClamped()` | 月偏移并钳制月末日期 |
| `getMilestoneDate()` | 由节点 id 计算具体日期 |
| `calculateAge()` | 计算月龄、天数、周岁 |
| `locateTimeline()` | 定位当前节点与下一节点 |
| `getTaskText()` | 按性别解析任务文案 |
| `renderTimeline()` | 渲染时间轴与进度 |
| `updateSummary()` | 更新顶部摘要、问候、图标 |
| `loadCompletedTasks()` / `saveCompletedTasks()` | 按生日读写勾选记录 |
| `getValidTaskIds()` | 生成合法任务 id 白名单 |
| `createBackup()` / `parseBackup()` / `applyBackup()` | 备份导出、校验与恢复 |
| `initProfile()` / `initBackup()` / `initBudget()` | 表单、备份、预算的事件绑定 |
