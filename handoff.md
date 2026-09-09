# tahun1-bc-bishun · 一起写好字（笔顺描红）

**状态**：开发中 —— 首版完成并通过浏览器端到端测试；**卡在「学生名单」需求**（见文末），待老师给资料 + 定隐私方案后才继续，然后本机实测 → 部署。
**最后更新**：2026-09-09

## 已验证（Playwright 真实鼠标输入，1470 与 1024 视口）
- 首页 27 单元卡渲染、进度环、overall 计数
- 练习三步：看一看（笔顺动画）→ 描一描（沿线描，onComplete 正确）→ 写一写（凭记忆，★ + 朱砂印章 + localStorage 保存）
- 「下一个字」推进、返回单元时字格状态更新、返回首页 overall 更新
- 小考：多题、逐题 onComplete、结果页「写对 N/N」
- console 干净（仅 favicon 404）
- 注：合成 PointerEvent 不触发 Hanzi Writer 判定，必须真实鼠标；学校鼠标环境没问题

## 学生名单：已接 kelasku 机制（2026-09-09）

用的是 kongsi-idea 既有的共享机制（不是新造）：
- `index.html` 引入 `supabase-js` + `kongsi-idea.vercel.app/data/supabase-client.js` + `.../class-code-client.js`
- 开场「选名字」screen：`ClassCode.loadOrPrompt()` 读班级名单 → 学生点自己的名字
  - 网址带 `?code=JBC1037-1I` 就直接读；没带会弹一次代码输入框（记在浏览器，下次免打）
  - 读不到名单 → 退回「打上你的名字」手动输入（访客模式，纯本机）
- 进度 per-student：localStorage key `bishun_prog__<playCode|guest>__<姓名>`
- 有班级代码时同步到 Supabase：table `tahun1_bc_bishun_progress` + RPC `submit_tahun1_bc_bishun_progress`
  - 学生换电脑登入自己名字 → 拉服务器 chars_json 跟本机逐字取较高状态合并
  - 只有 solo 模式（笔顺描红是个人练习，不做课堂对垒）
- 已通过浏览器测试：选名字、per-student 进度隔离、换人不重复弹代码框、手动输入 fallback
  （Supabase 往返在 Playwright sandbox 里 DNS 被挡测不了，代码照抄 masa 的成熟 pattern，失败静默降级）

### 🔴 硬阻塞（2026-09-09 发现）：kongsi-idea 的 Supabase project 已暂停

`gntnkhkkgonaehapcerr.supabase.co` 在公共 DNS（Google DoH）回 **NXDOMAIN**；
线上 `kongsi-idea.vercel.app` 首页 console 也是 `ERR_NAME_NOT_RESOLVED`
（`get_teacher_count` / `tool_stats` / `tool_like_votes` 全挂）。
= Supabase 免费版闲置 7 天以上自动暂停，子域名 DNS 被撤。

**影响范围不只这个工具**：kelasku 管不了名单、Hub 的老师数与喜欢数、
masa 时刻大对决的排行榜 —— 从项目暂停起就一直静默坏着。

**只有老师能解**：登入 supabase.com（Google 帐号）→ 找 kongsi-idea 项目 → Restore/Resume（约 2 分钟回来）。

本机尝试并失败的路径（铁律 8）：无 psql / 无 supabase CLI / `.supabase.co` 公共 DNS 已死 /
REST fetch 失败 / `.secrets.local.md` 没有 Personal Access Token。

### 恢复 Supabase 后，agent 要做的（不用再问老师）
1. 跑 migration：`kongsi-idea/supabase/migration-2026-09-09-tahun1-bc-bishun-progress.sql`
   （老师在 Dashboard SQL Editor 贴，或给一个 `sbp_` PAT 让 agent 用 Management API 跑）
2. 确认 `JBC1037-1I` 与 `JBC1037-1G` 名册在 kelasku 里（老师说两个都建好了 —— 用 anon key 查一次 `classes?play_code=in.(JBC1037-1I,JBC1037-1G)`）
3. 真实一轮：`?code=JBC1037-1I` → 选名字 → 写字 → 换台电脑登入同名字 → 进度接回来
4. 老师本机实测确认 → 部署到 kongsi-idea org（git init → gh repo create → vercel deploy）
5. Hub 登记：`app.js` TOOLS + 截图 + `published-tools-coverage.md` + `status:sync`
   `prep` 写「电脑室个人练习；网址带 ?code= 班级代码可记录个人进度」
6. DSKP 索引：中文课本已核对（3.1.1 / 5.1.2），马来文官方用词未查证 → 先不进 `dskp-index.js`，coverage 备注标注

### 「老师看全班进度」——老师答「先check」
数据在 `tahun1_bc_bishun_progress`（anon 可读）。之后在 kelasku 加总览页，或工具加 `?board=1`。不阻塞上线。

## 是什么
一年级华文「习写生字」的笔顺描红练习。282 个习写生字，按 27 个单元
（识字一~五 + 第1~22单元）分类，学生自己选单元、选字。
每个字三步：看一看（笔顺动画）→ 描一描（沿淡线描）→ 写一写（凭记忆写，写对得 ★）。
每单元有「小考」（随机抽最多 8 字凭记忆写）。全单元写完 → 单元卡盖「优」印章。

## 教学依据
- DSKP 3.1.1 笔画笔顺、田字格正楷（现有工具零覆盖）
- DSKP 5.1.2 笔画结构 · 4.1.1 有趣形式积累词汇
- 学生困难假设（老师 2026-09-09）：对笔顺不熟，凭感觉写 → 工具核心就是把笔顺练熟

## 技术
- 纯前端，无 build。浏览器直接开 index.html 就能跑。
- 笔画引擎：Hanzi Writer 3.7.0（`vendor/hanzi-writer.min.js`，MIT）
- 笔画数据：`js/char-data.js`（282 字，来自 hanzi-writer-data@2.0.1，离线打包，511KB）
  重新生成：`node build-data.mjs`（需先 `npm i`）
- 单元字表：`js/units.js`（来源课本第153-154页习写生字表，逐格核对，共 282 格）
- 声音：WebAudio 生成式，右上角可静音（教室公共喇叭环境）
- 无后端、无排行榜、无学生资料。进度存 localStorage。

## 视觉皮肤
「文房 / 米字格」——宣纸米白 + 朱砂印红 + 竹青 + 黄铜金。本工具新抽一套，
未与 tahun1-bc-juxing（信号旗撞色）、tahun1-mt-masa（木头软胶）重复。
定案后回填 `_style-lab/STYLES.md` 或 memory `design-aesthetic-preferences.md`。

## 待办
- [ ] 老师本机实测：笔顺判定松紧对一年级是否合适、三步流程会不会太长、音效音量
- [ ] 部署 Vercel（org=kongsi-idea，repo=slug）→ 截图 → Hub 登记 → status:sync
- [ ] DSKP 索引马来文用词未查证，暂不进 dskp-index.js（先在 coverage 备注）
