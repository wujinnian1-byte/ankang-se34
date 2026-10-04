# 安康硒谷 · SE·34

安康硒谷品牌互动网页，串联山水、玻璃瓶与硒灵盲盒三段体验，支持桌面与手机浏览。

**在线体验：[wutiantian.cn/ankang](https://wutiantian.cn/ankang/)**

## 内容

- 三段连续滚动页面与章节导航。
- 定制玻璃瓶模型与品牌设计展板。
- 六款玻璃珠交互轮播，以及参考盲盒海报制作的七球悬浮展示。
- 蓝白色流动云雾背景，独立悬浮动画与减少动态效果支持。

## 本地预览

```sh
git clone https://github.com/wujinnian1-byte/ankang-se34.git
cd ankang-se34
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

打开 http://127.0.0.1:4173/ 。这是已构建的静态网站，无需安装前端依赖或运行构建。安装了 npm 也可执行 `npm run dev`。

## 目录

| 目录 | 用途 |
| --- | --- |
| `dist/` | 可直接部署的页面和所有运行素材 |
| `dist/integration/` | 三段页面的滚动桥接、导航和高度同步 |
| `dist/brand/` | 品牌样式、图片与盲盒球体素材 |
| `design-source/` | 定制模型与轮播组件的可读源码 |
| `scripts/` | 校验、轮播模块更新与子路径发布工具 |
| `docs/` | 素材记录、生成提示词和部署说明 |

第三方页面运行时为预构建产物，本仓库并非三个参考站的完整源工程。可维护的定制源码位于 `design-source/`、`dist/integration/` 与 `dist/brand/`。

## 修改与检查

修改 `design-source/orb-carousel-module.js` 后同步到运行时：

```sh
python3 scripts/update_orb_carousel.py
```

校验资源路径、JavaScript 语法和轮播交互（需要 Python 3 和 Node.js）：

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python scripts/check.py
node scripts/check_orb_carousel.cjs
```

若部署到 `/ankang/` 子路径：

```sh
python3 scripts/build_ankang_subpath.py
```

将生成的 `output/ankang-site/` 作为该子路径的静态目录。其他路径需调整脚本中的前缀。详见 [部署说明](docs/部署说明.md)。

`scripts/mirror.py`、`import_experiences.py`、`rebrand.py` 保留初始来源与转换过程；重新运行可能覆盖后续定制，不用于日常启动或更新。

## 参与改进

欢迎通过 Issues 提出建议，通过 Pull Request 改进交互、性能、可访问性和移动端展示。提交前请阅读 [贡献说明](CONTRIBUTING.md)。

## 许可与来源

本项目原创定制代码采用 [MIT 许可证](LICENSE)。第三方页面运行时、图片、字体、模型及品牌素材不自动适用 MIT；请阅读 [第三方与素材说明](THIRD_PARTY_NOTICES.md)，并遵守其各自许可。公开仓库不代表授予第三方素材或品牌的商业使用权。

联系表单仅为本地演示，未连接邮件、订单或支付服务。页面未提供未经验证的矿物检测数据或医疗功效声明。

## 赤色玻璃球视频

七款悬浮玻璃球中的赤色玻璃球支持点击、Enter 或 Space 打开页内视频弹窗。右上角“关闭视频”或 Escape 关闭，停止播放并恢复原浏览位置和焦点；连续长页与独立 Fizzi 页面均可使用。

视频和封面来自用户指定的 [SE·34 视频页](https://wutiantian.cn/se34-20261003/)，使用本地部署源的字节一致副本，保存在 `dist/brand/red-orb-video/`，仅在弹窗打开时加载。来源、文件校验与维护位置见 [赤球视频说明](docs/red-orb-video.md)。

## 瓶身入水影片

第二段「山水灵感」已接入品牌方于 2026-10-04 提供的入水成片。电脑与手机都按「瓶身展示 → 黑场 → 入水 → 水下停稳」连续滚动，采用先快后慢的 171 帧序列，保留稳定尾镜；页面不嵌入独立播放器。该片与赤球弹窗视频分别维护。

媒体来源、重建命令与节奏参数见 [入水影片接入说明](docs/water-video.md)。
