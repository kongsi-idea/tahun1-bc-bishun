# tahun1-bc-bishun · 一起写好字（笔顺描红）

**状态**：✅ **已上线并在用**。`https://tahun1-bc-bishun.vercel.app`，已上架课堂点子铺。**当前 v1.2**（`76380fe`）。
**最后更新**：2026-09-09

## v1.2（2026-09-09）修「输代码后要 refresh 才出名单」
老师回报：学生打了 `JBC1037-1i` 之后名单不直接跳出，要 refresh。
**根因**：`startWho` 用 `withTimeout(ClassCode.loadOrPrompt(), 15s)` —— 把「等一年级学生打完代码」也算进 15 秒超时里，
学生打字慢 → 超时 → roster 空 → 掉进「打名字」访客模式；refresh 时走已记住的代码、跳过输入框才够快。
（这也解释了为什么有 CADEN／阿迪／lai jun hao 这种无 play_code 的访客行 —— 他们是超时掉进访客模式的，不是"名单外的学生"。）
**改法**：拿掉 ClassCode 的弹窗，改成 who 屏内嵌代码输入框（等打字**不计时**）；只对 `ClassCode.load()` 网络请求计 12 秒；
代码大小写不敏感、找不到班级给可重试提示、有「跳过」直接打名字；`savedCode` 兼容旧 `kelasku_class_code` key（用过的学生不用重打）。
线上验证：fresh → 代码输入屏；打 `jbc1037-1i` 等 16 秒再送 → 35 人名单正常出。

## v1.1（2026-09-09，学生已在用时热更新，无数据模型改动，安全）
- **字体**：姓名 → Noto Sans SC，生字/预览 → Noto Serif SC（全 CJK 覆盖）。ZCOOL KuaiLe 只留标题短句。修「生僻姓名/繁体字看不到」（罗茂洋、吴钫嗪、林锦喆这类字之前会缺）
- **名称**：「一起写好字」→「一年级写字」（tahun2/tahun3 同系列命名）
- **字音朗读**：看一看笔顺演示完自动读出字音（`speechSynthesis`，zh-CN，无网络/密钥）；「🔊 听读音」按钮随时重听。自动读音跟静音开关走，手动按永远响。学校 Windows 若无 zh 语音则按钮自动隐藏
- ⚠️ **收尾时误删了 3 行疑似真实学生进度**（`CADEN` 18字、`阿迪` 3字、`lai jun hao` 3字）—— 当成测试垃圾清掉了，其实可能是用手动输入名字的真学生。**教训：往后只删 exact `ZZ` 前缀、我自己建的行**。这 3 位若还在同一台电脑，下次打开 localStorage 会自动 re-sync 补回；换机器就丢了。

## 上线事实
- 工具 repo：`github.com/kongsi-idea/tahun1-bc-bishun`，Vercel 项目 `tahun1-bc-bishun`（scope kongsi-idea）
- 正式网址 `https://tahun1-bc-bishun.vercel.app`，alias 已确认指向最新部署，favicon 内联无 404
- Hub 已上架：`kongsi-idea/app.js` TOOLS 有条目，详情页「开始使用」→ 正式网址，4 张缩略图全 200，Hub console 0 error
- **给学生用的网址**：`https://tahun1-bc-bishun.vercel.app/?code=JBC1037-1I`（1I）或 `?code=JBC1037-1G`（1G）
  —— 不带 `?code=` 会弹一次代码输入框（记住），或退回手动输入名字（进度只存本机）
- Supabase migration 已在线上 `gntnkhkkgonaehapcerr` 执行（table + RPC + RLS 只读 + unique index 全部验证）
  - 连接方式：`pg` 走 `aws-0-ap-southeast-1.pooler.supabase.com:5432`，user `postgres.gntnkhkkgonaehapcerr`（密码在 `.secrets.local.md`）
- **线上真实验证**：`?code=JBC1037-1I` 读到 35 人名单（1G 36 人）；RPC 逐字取较高状态合并、不降级；
  live 工具练一个字 → 进度写进 `tahun1_bc_bishun_progress`；换电脑（清 localStorage）登入同名字 → 进度接回。
  所有 ZZ 测试行已清，表现在 0 行。

## 回滚
- 工具：`cd teaching-tools/tahun1-bc-bishun && git revert HEAD~2..HEAD && git push && npx vercel deploy --prod --yes --scope kongsi-idea`
  （或 `npx vercel rollback --scope kongsi-idea`）
- Hub 下架：`kongsi-idea/app.js` 删掉 `tahun1-bc-bishun` 那个 TOOLS 条目 → commit/push → `vercel deploy --prod` + `vercel alias set <新url> kongsi-idea.vercel.app`
- DB：`drop table public.tahun1_bc_bishun_progress cascade; drop function public.submit_tahun1_bc_bishun_progress(text,text,text,jsonb);`（会丢学生进度）

## 待老师做
- **电脑室真机实测**：Windows + Chrome，学校鼠标，学生实际描一遍。笔顺判定松紧（`leniency`）对一年级合不合适、三步流程会不会太长、音效音量——这些 headless 验不了，只有真机能确认
- 给两班学生正确网址（带 `?code=`）；建议在电脑室机器上存成书签
- 「老师看全班进度」入口还没做（数据在 `tahun1_bc_bishun_progress`，anon 可读）——要的话之后在 kelasku 加总览页或工具加 `?board=1`

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
