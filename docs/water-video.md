# SE·34 黑场入水滚动影片

2026-10-04，品牌方提供已完成的 `水视频.mp4`。本次将它用于第二段的连续滚动转场：瓶身展示 → 全黑场 → 入水 → 水下缓慢停稳。电脑与手机使用同一条滚动时间线，页面没有独立播放器、播放条或自动循环。赤色玻璃球弹窗继续使用其原独立短片。

原片为 H.264、1280×720、约 17.02 秒，无音轨，26,259,405 字节。原文件不作覆盖，SHA-256 与网页衍生文件清单见 `water-video-manifest.json`。源片帧率随时间分布不完全均匀，因此抽帧按时间戳采样。本次不调用即梦，不产生新的生成费用。

## 转场与速度

Lead 瓶身展示沿用原站黑色遮罩，最后一段滚动逐渐压暗到全黑。手机同步使用相同的段落衔接几何，避免出现独立横向播放器。

入水段到达视窗顶端前保持在 Lead 下层，到顶时在全黑画面中接管；反向滚动和页面恢复也同步层级，避免出现从底部提前上推的黑色硬边。黑罩直接跟随滚动进度，入水帧保留平滑跟随。

后续入水段落约 420vh，固定一屏展示，以滚动距离推进以下阶段：

| 滚动进度 | 画面 |
| --- | --- |
| 0–5% | 接住上一段全黑场，短暂停留 |
| 5–13% | 入水画面从黑场淡入 |
| 10–87% | 推进 171 帧，用 `power2.out` 曲线，开始快、入水后逐渐慢下来 |
| 87–94% | 保留稳定的水下尾镜 |
| 94–100% | 淡出并衔接下一段 |

滚动跟随平滑约 0.45 秒。速度是画面随滚动的变化速度，不是视频播放器的倍速；向上滚动能够反向回看，停止滚动时画面停留。电脑完整显示原构图并留约 2% 安全边距；手机按瓶身完整高度展示，裁去两侧水面，避免把影片缩成横向小条。

## 运行文件与源码

| 路径 | 用途 |
| --- | --- |
| `dist/brand/water-entry/frames/se34-0000.jpg`–`se34-0170.jpg` | 桌面 1280×720 滚动序列 |
| `dist/brand/water-entry/frames-mobile/se34-0000.jpg`–`se34-0170.jpg` | 手机 640×360 的同时间序列，减少下载与解码负担 |
| `dist/brand/water-entry/poster.jpg` | 首帧参考 |
| `dist/brand/water-entry/water-entry.mp4` | 优化为 24 fps 的影片备份，约 4.13 MB；页面不以 video 元素播放 |
| `dist/brand/water-entry.css` | 全尺寸整屏布局与黑场衔接 |
| `design-source/water-sequence-module.js` | SectionSequence 模块的可维护副本 |
| `scripts/update_water_sequence.py` | 同步序列模块、Lead 黑场衔接、静态结构和缓存版本 |
| `scripts/import_water_video.py` | 从用户成片重建两组帧、参考 MP4 和哈希清单 |

在仓库根目录用 Python 3、ffmpeg、ffprobe 重建媒体：

```sh
python3 scripts/import_water_video.py /实际位置/水视频.mp4
python3 scripts/update_water_sequence.py
python3 scripts/check.py
node scripts/check_water_sequence.cjs
node scripts/check_video_modal.cjs
```

媒体已随仓库交付，日常预览不需要安装 ffmpeg。重新导入其他比例或构图的视频前，应先检查瓶身位置并调整手机裁切，不能直接沿用当前构图假设。修改资源内容后同时更新缓存版本。

发布到 `/ankang/` 仍通过 `scripts/build_ankang_subpath.py` 生成路径适配版本。仅更新独立 `/ankang/` 发布目录，保留现有域名首页。前一版交接文件里的「入水视频尚未生成」属于 2026-10-04 凌晨的历史状态；本次使用用户后来提供的成片，不代表之前失败的即梦任务已恢复或成功。
