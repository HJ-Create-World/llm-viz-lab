# Git 推送配置说明（Windows / 多环境通用）

> 适用场景：WorkBuddy、Trae、命令行、任何会执行 `git push` 的环境
> 环境快照时间：2026-09-16
> 维护者：HJ（账号 `HJ-Create-World`）

---

## 一、结论先行

**在这台机器上，推送命令就是最朴素的一条，不需要任何额外参数：**

```powershell
git push origin main
```

**唯一的强制前提**：推送前必须清空代理环境变量。

```powershell
$env:HTTP_PROXY=""; $env:HTTPS_PROXY=""; $env:ALL_PROXY=""
$env:http_proxy=""; $env:https_proxy=""; $env:all_proxy=""
```

**凭证不需要每次输入，也不需要配 SSH** —— 已通过 `~/.gitconfig` 的 `url.insteadOf`
自动注入，任何项目、任何工具都通用。

**新项目只需三步**，无需再碰凭证配置：

```powershell
git init -b main
git remote add origin https://github.com/HJ-Create-World/<仓库名>.git
git push -u origin main
```

---

## 二、当前环境实况

### 2.1 Git 本体

| 项目 | 值 |
|---|---|
| 实际执行的 git | `C:\Program Files\Git\cmd\git.exe`（**系统 Git**） |
| 版本 | `git version 2.53.0.windows.2` |
| exec-path | `C:/Program Files/Git/mingw64/libexec/git-core` |
| WorkBuddy 便携版 Git | 目录存在，但**`bin\git.exe` 不存在**，且不在 PATH 中 —— 未启用 |

> 结论：这台机器上**只有系统 Git 在工作**，WorkBuddy 的 PortableGit 是空壳。

### 2.2 可用的 credential helper

exec-path 目录下仅有一个 helper：

```
git-credential-wincred.exe     ← 唯一存在
```

**不存在**（这是关键）：

| helper | 状态 | 影响 |
|---|---|---|
| `git-credential-store` | ❌ 缺失 | 所以 `credential.helper=store` 会失败 |
| `git-credential-manager` (GCM) | ❌ 缺失 | 所以 `credential.helper=manager` 会失败 |

> 系统 Git 是**精简安装**，把 `git-credential-store`（shell 脚本形式）裁掉了。

### 2.3 配置层级

| 层级 | 文件 | 内容 |
|---|---|---|
| system | `C:\Program Files\Git\etc\gitconfig` | `credential.helper=manager`（**失效**，GCM 没装）<br>`init.defaultbranch=master` |
| global | `C:\Users\15056\.gitconfig` | 见下方 2.4 |

### 2.4 global 配置（`~/.gitconfig`）

```ini
[windows]
	appendAtomically = false
[user]
	name = HJ-Create-World
	email = 323451877+HJ-Create-World@users.noreply.github.com
[init]
	defaultBranch = main
[credential]
	helper =
	helper =
[url "https://HJ-Create-World:<你的PAT>@github.com/"]
	insteadOf = https://github.com/
```

**逐段说明：**

- `[user]` —— 提交署名。用 GitHub noreply 邮箱，不暴露真实邮箱，同时能让 GitHub
  把提交正确关联到账号
- `[credential]` **两行空 `helper =`** —— 这是**必须的**。git 的 helper 是**列表**，
  global 的值会**追加**在 system 之后；写一个空值可以**清空已继承的列表**。
  不写这两行，system 的 `manager` 就会生效并导致推送静默失败（详见第四节）
- `[url ...insteadOf]` —— **核心**。把干净的 `https://github.com/` 在运行时重写为
  带 token 的 URL，**完全绕过 credential helper 机制**

### 2.5 代理环境变量（坑的根源）

```
HTTP_PROXY  = http://127.0.0.1:56480
HTTPS_PROXY = http://127.0.0.1:56480
ALL_PROXY   = (空)
```

⚠️ **端口每次启动都会变**。曾观察到 `62327`、`56480` 两个值，说明它是随机分配的。
所以**不能靠"记住端口"来规避，只能每次推送前清空**。

### 2.6 其他

- `gh` CLI：**未安装**
- 仓库位置：`D:\01_HJ_Work\00_Person\04_Project\NN_项目名`

---

## 三、凭证是什么 / 存在哪

### 3.1 用的是 fine-grained PAT

- 类型：**Fine-grained personal access token**（前缀 `github_pat_`，长度 93）
- 名称：`workbuddy-auto-push`
- 需要的权限：
  - **Contents: Read and write** —— 推代码必需
  - **Administration: Read and write** —— 建/删仓库需要（可选，想自动建仓库才要）
  - Repository access: **All repositories**

> 如果想缩小范围，把 "All repositories" 改成 "Only select repositories" 也可以，
> 但那样每开一个新仓库都要回来改一次 token 授权，反而更麻烦。

### 3.2 token 存在三个地方（冗余，但都有用）

| 位置 | 用途 | 是否含明文 token |
|---|---|---|
| `~/.gitconfig` 的 `insteadOf` | **实际生效的凭证来源** | ✅ 有 |
| `~/.git-credentials` | 备用存储（helper=store 用，当前失效） | ✅ 有 |
| `.git/config` 的 remote url | 远程地址 | ❌ **没有**（干净 URL） |

> ✅ 好消息：**项目目录里的 `.git/config` 不含 token**，token 只在用户主目录，
> 不会被误提交，也不会随项目目录拷贝而泄漏。

### 3.3 安全提醒

`~/.gitconfig` 含 token 明文。风险点：

- 不要把这个文件分享、截图、贴给别人
- 执行 `git config --list` 或 `--show-origin` 时**会打印 token 明文**，别直接截图
- 想检查配置但不想暴露 token，用这条：

```powershell
git config --list --show-origin | Select-String 'credential|url\.' | ForEach-Object { $_ -replace ':github_pat_[A-Za-z0-9_]+@', ':***@' }
```

如果 token 泄漏了：去 GitHub → Settings → Developer settings → Personal access tokens
→ Fine-grained tokens 里 Revoke，然后重新生成 + 更新 `~/.gitconfig`。

---

## 四、为什么不能直接用 `credential.helper=store`（踩坑记录）

这是**最容易重犯的坑**，换环境后很可能又踩一遍。

### 4.1 现象

```powershell
git push origin main
# EXIT=128，没有任何输出。什么错都不报，就是失败。
```

最迷惑的地方：**退出码 128 且零输出**，看起来像网络问题或权限问题，实际都不是。

### 4.2 真实原因链

1. git 发起推送，服务器返回 `401`
2. git 需要凭据，于是按 helper 列表依次调用
3. 系统 gitconfig 有 `credential.helper=manager` → 调 `git credential-manager`
4. **GCM 没安装** → 调用失败 → **git 静默退出**（不打印任何错误）

即使你在 global 配了 `credential.helper=store`，**git 会先试 system 的 `manager`**（列表追加，
manager 在前）。而 `store` 本身也因为 `git-credential-store` 被裁掉而不可用。**两个都失败。**

### 4.3 定位方法（下次遇到照做）

```powershell
$env:GIT_TRACE=1
$env:GIT_TRACE_CURL=1
git push origin main 2> trace.txt
```

在 `trace.txt` 里搜 `run_command`，能直接看到 git 调了哪个 helper：

```
run_command.c:674  trace: run_command: 'git credential-store'   ← 就是它
```

配合 `Recv header: HTTP/2 401` 出现的位置，就能确认"认证失败 → 调 helper → 失败退出"这条链。

### 4.4 为什么不修 helper，而是绕过它

试过的无效路径（**别再试了**）：

| 尝试 | 结果 |
|---|---|
| `credential.helper=store` | ❌ `git-credential-store` 文件不存在 |
| 修 GCM | ❌ 需要装 GCM，且系统配置目录要管理员权限 |
| `git credential approve` 写入 | ❌ wincred 下写不进去 |
| `git credential reject` + 重填 | ❌ 把凭据删了，问题更大 |
| 改系统 `gitconfig` | ❌ `C:\Program Files\Git\etc\gitconfig` 属 `BUILTIN\Administrators`，要提权 |

**最终选择 `url.insteadOf`**：不修任何 helper，直接让 URL 自带凭证。
零外部依赖，一次配好永久生效。

---

## 五、代理这个大坑

### 5.1 现象

不清代理时，`git push` 会：

- **GET 请求能成功**（`info/refs` 返回 200）
- **POST 请求根本不发出**（push 的数据传输用的是 POST）
- 表现为 `EXIT=128`、零输出

### 5.2 为什么

环境变量里的 `HTTP_PROXY` / `HTTPS_PROXY` 指向的本地代理**不支持 git 的 POST 推送**。
GET 走通了，让人误以为代理没问题。

### 5.3 解法

每次推送前清空（**这是硬性步骤，不能省**）：

```powershell
$env:HTTP_PROXY=""; $env:HTTPS_PROXY=""; $env:ALL_PROXY=""
$env:http_proxy=""; $env:https_proxy=""; $env:all_proxy=""
```

> 注意：这些环境变量在**新开的终端里会重新出现**，因为是父进程注入的。
> 所以不能"设一次就完事"，每次会话都要设。

### 5.4 怎么确认是代理问题

带 trace 看请求：

```
$env:GIT_CURL_VERBOSE=1
git push origin main 2> v.txt
```

搜 `Connected to`，如果看到 `127.0.0.1:<port>`，就是在走代理。

---

## 六、日常操作手册

### 6.1 推送（每次都用这个）

**PowerShell：**

```powershell
$env:HTTP_PROXY=""; $env:HTTPS_PROXY=""; $env:ALL_PROXY=""
$env:http_proxy=""; $env:https_proxy=""; $env:all_proxy=""
git add -A
git commit -m "feat: 做了什么"
git push origin main
```

**Git Bash / bash：**

```bash
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
git add -A && git commit -m "feat: 做了什么" && git push origin main
```

### 6.2 新项目初始化

```powershell
cd D:\01_HJ_Work\00_Person\04_Project\<NN_新项目>
git init -b main
```

然后手动创建 `.gitignore` 和 `.gitattributes`（内容见 6.3、6.4），再：

```powershell
git add -A
git commit -m "chore: 初始化项目"
git remote add origin https://github.com/HJ-Create-World/<仓库名>.git
git push -u origin main
```

如果仓库还没创建，两种方式：

- **网页手动建**：https://github.com/new → 仓库名填好 → **不要勾任何初始化选项**
  （不要 README、不要 .gitignore、不要 License），建出来是空仓库，能直接推
- **token 自动建**：token 有 `Administration` 权限就能自动建（见附录 A）

### 6.3 `.gitignore` 模板

```gitignore
node_modules
dist
build
.DS_Store
*.local
.vite
.env
.env.*
!.env.example
```

### 6.4 `.gitattributes` 模板

```gitattributes
* text=auto eol=lf

*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
```

> 作用：统一换行符为 LF。不配的话 Windows 上 diff 会全是换行噪音，
> 每次提交都显示整个文件被改。

---

## 七、验证配置是否正常

换环境后（比如新装了 Trae、换了电脑），按这个顺序自查：

### 步骤 1：确认 git 在哪、helper 有哪些

```powershell
git --version
git --exec-path
Get-ChildItem ((git --exec-path) -replace '/','\') -Filter "git-credential-*"
```

看 `git-credential-*` 里有什么。**如果没有 `git-credential-store` 或 `manager`，
说明你也得走 `insteadOf` 方案。**

### 步骤 2：确认配置生效

```powershell
git config --list --show-origin | Select-String 'credential|url\.'
```

应该看到（token 部分会显示明文，注意场合）：

```
file:C:/Users/<你>/.gitconfig  credential.helper=
file:C:/Users/<你>/.gitconfig  credential.helper=
file:C:/Users/<你>/.gitconfig  url.https://<用户>:<PAT>@github.com/.insteadof=https://github.com/
```

如果**只看到 system 的 `credential.helper=manager`**，说明 global 没生效或被覆盖。

### 步骤 3：端到端测试推送

```powershell
$env:HTTP_PROXY=""; $env:HTTPS_PROXY=""; $env:ALL_PROXY=""
$env:http_proxy=""; $env:https_proxy=""; $env:all_proxy=""
git push origin main
```

期望：`EXIT=0`，输出 `Everything up-to-date` 或正常的推送进度。

### 步骤 4（可选）：验证建仓库权限

```powershell
$pat = (Select-String -Path "$env:USERPROFILE\.gitconfig" -Pattern 'https://[^:]+:([^@]+)@').Matches.Groups[1].Value
Invoke-RestMethod -Uri "https://api.github.com/user" -Headers @{ Authorization = "Bearer $pat"; "User-Agent" = "check" } | Select-Object login
```

返回你的用户名就说明 token 有效。

---

## 八、故障速查表

| 现象 | 最可能原因 | 处理 |
|---|---|---|
| `EXIT=128` **零输出** | 代理没清 / helper 调用失败 | ① 清代理 ② `GIT_TRACE=1` 看调了哪个 helper |
| `EXIT=128` + `could not read Username` | 凭证没注入成功 | 检查 `insteadOf` 是否配好、token 是否过期 |
| `401` / `No anonymous write access` | token 无效或权限不足 | 重新生成 PAT，确认含 `Contents: Read and write` |
| `403 Resource not accessible by integration` | **用的是 GitHub 连接器，不是本地 git** | 连接器不能写，改用本地 git + PAT |
| 推送成功但退出码非 0 | 退出码被 helper 崩溃掩盖 | **用 GitHub API 反查**，别只看退出码 |
| `Everything up-to-date` 但远程没变 | 没 commit，或分支名不对 | `git status` / `git log` / `git branch -vv` |
| 中文提交信息乱码 | 终端编码 | 用 UTF-8 终端；已提交的乱码只能重写历史 |

---

## 九、给 AI 助手（WorkBuddy / Trae Copilot 等）的约束

把这段直接给 AI，能省掉它重新排查的时间：

> **本机 git 推送约束（请严格遵守）**
>
> 1. 推送前**必须**清空代理环境变量：
>    `$env:HTTP_PROXY=""; $env:HTTPS_PROXY=""; $env:ALL_PROXY=""; $env:http_proxy=""; $env:https_proxy=""; $env:all_proxy=""`
>    该端口每次启动随机变化，不可硬编码规避
> 2. 推送命令就用 `git push origin main`，**不要**加 `-c credential.helper=`
>    （加了会禁用凭证读取，反而失败），**不要**往 URL 里塞 token
> 3. 本机 git 是**系统 Git 精简安装**，**没有**可用的 `credential-store` / `credential-manager`；
>    凭证靠 `~/.gitconfig` 的 `url.insteadOf` 注入 —— **不要试图"修复" helper**
> 4. 遇到 `EXIT=128` 零输出，先用 `GIT_TRACE=1` 定位，不要盲目重试
> 5. **退出码非 0 不代表操作没生效** —— 用 GitHub API 反查真实状态
> 6. PowerShell 捕获 git 输出不可靠，用 `Set-Content -Encoding UTF8` 落盘再读
> 7. 提交信息用 Conventional Commits：`feat:` `fix:` `docs:` `refactor:` `style:`
>    `chore:` `perf:` `test:`

---

## 附录 A：用 token 自动建仓库

```powershell
$pat = (Select-String -Path "$env:USERPROFILE\.gitconfig" -Pattern 'https://[^:]+:([^@]+)@').Matches.Groups[1].Value
$hdr = @{ Authorization = "Bearer $pat"; Accept = "application/vnd.github+json"; "User-Agent" = "setup" }
$body = @{ name = "仓库名"; private = $true; auto_init = $false } | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Headers $hdr -Method Post `
  -Body $body -ContentType "application/json"
```

需要 token 有 **Administration: Read and write** 权限。
`auto_init = $false` 很重要 —— 建空仓库才能直接 push 本地已有历史。

## 附录 B：在某台新机器上从零配好

1. 安装 Git for Windows（**建议选完整安装**，别精简，省掉本文一半的坑），或下载
   PortableGit 并确保 `bin\git.exe` 存在且加入 PATH
2. 生成 fine-grained PAT：GitHub → Settings → Developer settings →
   Personal access tokens → Fine-grained tokens → Generate new token
   - Repository access: All repositories
   - Permissions: Contents = Read and write（+ Administration = Read and write 可选）
   - Expiration: 建议 1 年
3. 写 `~/.gitconfig`（用下方脚本，替换 `<PAT>`）：

```powershell
$pat = "<你的PAT>"
$content = @"
[user]
	name = HJ-Create-World
	email = 323451877+HJ-Create-World@users.noreply.github.com
[init]
	defaultBranch = main
[credential]
	helper =
	helper =
[url "https://HJ-Create-World:$pat@github.com/"]
	insteadOf = https://github.com/
"@
[System.IO.File]::WriteAllText("$env:USERPROFILE\.gitconfig", $content, (New-Object System.Text.UTF8Encoding($false)))
```

4. 按第七节验证

## 附录 C：清空 credential helper 列表的正确写法

**踩过的坑**：`git config --global credential.helper ""` 在 PowerShell 里会被吃掉空参数，
实际执行成设成别的东西。**必须直接改配置文件**：

```powershell
$content = @"
[credential]
	helper =
	helper =
"@
[System.IO.File]::WriteAllText("$env:USERPROFILE\.gitconfig", $content, (New-Object System.Text.UTF8Encoding($false)))
```

两行 `helper =` 是**故意的**：第一行清空继承的列表，第二行留作占位（保持结构清晰）。
只写一行空值也行，但两行更明确。

---

*最后更新：2026-09-16*
