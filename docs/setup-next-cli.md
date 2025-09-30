# Next CLI 安装指南

为了在本地运行本项目的 `next dev`、`next build` 等命令，需要保证 `next` CLI 已经安装并且可用。以下提供两种常见方式：

## 方式一：使用 `npm` 本地安装
1. 进入项目根目录。
2. 执行 `npm install`（或 `pnpm install`/`yarn install`），这一步会根据 `package.json` 安装 `next` 以及其它依赖。
3. 安装完成后，可通过 `npx next --version` 检查是否安装成功。由于 `npx` 会优先使用当前项目的 `node_modules/.bin/next`，无需额外配置就能执行 `npm run dev`、`npm run build`、`npm run lint` 等脚本。

> **建议**：本仓库已经包含 `package-lock.json`/`pnpm-lock.yaml`，为了确保依赖版本一致，推荐优先使用项目约定的包管理器（通常是 `npm`）。

## 方式二：全局安装（可选）
如果希望在任何目录下都能直接使用 `next` 命令，可以进行全局安装：

```bash
npm install -g next
```

安装完成后执行 `next --version` 验证即可。需要注意的是，全局安装的版本可能与项目锁定的版本不同，通常仅在需要快速运行示例项目或脚手架时使用。实际开发仍建议使用项目本地依赖。

## 常见问题
- **提示找不到 `next` 命令**：请确认已经执行依赖安装，或使用 `npx next` 运行。
- **权限不足**：在部分系统上进行全局安装时可能需要管理员权限，可使用 `sudo npm install -g next` 或配置 `npm` 的全局目录。
- **Node.js 版本过低**：Next.js 15 需要 Node.js 18.18 及以上版本，请先升级 Node.js。

按照以上步骤操作后，即可在本地顺利运行 Next CLI，配合现有代码完成登录、注册等页面的开发和调试。
