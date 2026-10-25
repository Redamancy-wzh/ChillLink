#!/bin/bash
# 双击即可检查、提交并推送当前网站。也可在终端传入提交说明。
set -euo pipefail
cd "$(dirname "$0")"

finish() {
  result=$?
  if [ "$result" -ne 0 ]; then
    echo
    echo "更新未完成，请查看上面的错误。你的本地文件和已有提交都已保留。"
  fi
  if [ -t 0 ] && [ "${GITHUB_PUSH_NO_PAUSE:-0}" != 1 ]; then
    read -r -p "按回车关闭…" || true
  fi
}
trap finish EXIT

for node_dir in "$HOME/.local/node/bin" /opt/homebrew/bin /usr/local/bin "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin"; do
  if [ -x "$node_dir/node" ]; then
    export PATH="$node_dir:$PATH"
    break
  fi
done
command -v node >/dev/null || { echo "没有找到 Node.js，请先安装 Node.js。"; exit 1; }
git rev-parse --is-inside-work-tree >/dev/null
branch=$(git symbolic-ref --quiet --short HEAD) || { echo "当前没有处于分支，请先切回 main。"; exit 1; }
if [ "$branch" != main ]; then
  echo "当前分支为 $branch。请切回 main 后再更新网站。"
  exit 1
fi
if [ -n "$(git diff --name-only --diff-filter=U)" ]; then
  echo "仓库存在尚未解决的合并冲突，请先处理。"
  exit 1
fi

# 优先沿用环境代理，否则读取 macOS 已开启的 HTTPS 代理；不改全局设置。
git_network=(git -c http.connectTimeout=15 -c http.lowSpeedLimit=100 -c http.lowSpeedTime=60)
if [ -z "${HTTPS_PROXY:-}${https_proxy:-}${ALL_PROXY:-}${all_proxy:-}" ] && command -v scutil >/dev/null; then
  proxy_settings=$(scutil --proxy)
  proxy_enabled=$(printf '%s\n' "$proxy_settings" | awk '/HTTPSEnable :/ {print $3}')
  proxy_host=$(printf '%s\n' "$proxy_settings" | awk '/HTTPSProxy :/ {print $3}')
  proxy_port=$(printf '%s\n' "$proxy_settings" | awk '/HTTPSPort :/ {print $3}')
  if [ "$proxy_enabled" = 1 ] && [ -n "$proxy_host" ] && [ -n "$proxy_port" ]; then
    git_network+=(-c "http.proxy=http://$proxy_host:$proxy_port")
    echo "使用系统网络代理连接 GitHub。"
  fi
fi

echo "[1/4] 检查 GitHub 最新版本…"
"${git_network[@]}" fetch origin
if ! git merge-base --is-ancestor origin/main HEAD; then
  echo "GitHub 上有本地尚未合并的更新。本次已停止，请先同步远端改动后重试。"
  exit 1
fi

echo "[2/4] 检查网站并生成正式版本…"
if [ ! -f node_modules/vite/bin/vite.js ] || [ ! -f node_modules/typescript/bin/tsc ]; then
  echo "缺少网站依赖，请先在网站目录安装依赖后重试。"
  exit 1
fi
node node_modules/typescript/bin/tsc --noEmit
node scripts/i18n-check.mjs
node node_modules/vitest/vitest.mjs run
node node_modules/vite/bin/vite.js build

echo "[3/4] 保存网站修改…"
git add -A
git diff --cached --check
if ! git diff --cached --quiet; then
  message="${1:-更新网站 $(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M')}"
  git commit -m "$message"
else
  echo "没有新的文件修改，继续检查是否有待推送的提交。"
fi

echo "[4/4] 推送到 GitHub…"
"${git_network[@]}" push origin main
remote_head=$("${git_network[@]}" ls-remote origin refs/heads/main | awk '{print $1}')
if [ "$remote_head" != "$(git rev-parse HEAD)" ]; then
  echo "远端版本核对未通过，请重新运行此脚本。"
  exit 1
fi
echo
echo "更新成功！GitHub 已收到最新网站。"
echo "提交版本：$(git rev-parse --short HEAD)"
echo "仓库：https://github.com/Redamancy-wzh/ChillLink"
echo "网站发布进度：https://github.com/Redamancy-wzh/ChillLink/actions"
echo "GitHub Pages 会自动发布，推送成功不代表线上发布已经完成。"
