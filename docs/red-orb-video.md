# 赤色玻璃球视频来源与交互

用户指定的公开页面：<https://wutiantian.cn/se34-20261003/>。

在工作区的独立制作项目 `se34-bottle-20261003/SE34_细节加强版/video_site/index.html` 中核对了该页面源码：视频为同目录的 `se34.mp4`，封面为 `poster.jpg`。两份文件以字节一致的副本保存到本站 `dist/brand/red-orb-video/`，不依赖公网播放链路，也没有重新生成、剪辑或转码。

视频尺寸为 1280 × 960，时长约 11.08 秒。两份文件均低于 GitHub 的 100 MiB 单文件限制。

| 文件 | 字节数 | SHA-256 |
| --- | ---: | --- |
| `se34.mp4` | 2,265,796 | `4716660a79e4f00571ea05d1fe5eb85ccbe863c72b0f1ef7f5941ee32a0b7026` |
| `poster.jpg` | 127,907 | `bb827a9ff812ec5cadb0182a73f435aa53d97a777ec646690b7d225b47f6cd9c` |

仅 `.blindbox-position-2` 的赤色玻璃球是视频按钮，辅助名称为“播放赤色玻璃球视频”。点击、Enter 或 Space 在当前页打开原生对话框；右上角“关闭视频”按钮及 Escape 关闭。原生对话框管理焦点范围和背景不可交互状态。关闭时暂停视频、卸载其地址并重置播放，下次打开从头开始；视频和封面仅在打开时赋予地址。

连续长页由父页面承载弹窗。子页通过已有同源 iframe 桥接请求打开，父页校验消息来源与赤球标识，冻结滚动同步并暂存高度变化；关闭后恢复原章节内滚动位置，再把焦点还给赤球。独立 Fizzi 页面使用同一弹窗组件，不依赖父页面。

实现位于 `dist/integration/video-modal.js`、`video-modal.css`，滚动协调位于 `journey.js` 与 `bridge.js`；赤球按钮的可读源码位于 `design-source/orb-carousel-module.js`。静态部署子路径应运行现有 `scripts/build_ankang_subpath.py`，让本地资源路径一并带上部署前缀。
