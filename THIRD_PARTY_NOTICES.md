# 第三方来源与许可说明

本仓库包含安康 SE·34 的原创定制代码、第三方页面的本地化运行时、用户提供的品牌素材及生成图片。根目录 MIT 许可仅适用于本项目有权授权的原创代码，具体范围见 `LICENSE_SCOPE.md`。不能将整个 `dist/`、第三方字体、照片、视频、商标或镜像页面视为 MIT 软件或自由素材。

以下来源说明不代表原作者为安康品牌背书，也不构成对第三方内容的再许可。**公开访问、署名和本文件本身都不能代替第三方的授权。** 未确认许可的内容，不授予复制、修改、再分发或商用权利；如需再利用，应取得相应权利人的许可或替换为许可明确的内容。

## 页面与项目来源

| 来源 | 本地范围 | 许可状态与处理 |
| --- | --- | --- |
| [Água Serrana](https://www.aguaserrana.pt/) | `dist/experiences/serrana/`、`dist/assets/` 中相应页面资源，以及 `dist/sobre-nos/`、`dist/agua-serrana/`、`dist/contactos/`、`dist/politica-de-privacidade/`、`dist/projeto/` 中的衍生页面 | 原站页面、设计和素材的再分发许可未确认。其[官方页面](https://www.aguaserrana.pt/politica-de-privacidade)标有 © Água Serrana / Todos os Direitos Reservados。本项目不为这些内容授予开源许可。该目录内可独立识别的开源依赖仍遵循各自许可。 |
| [BAIKAL430 / BAIKALSEA](https://baikal430.ru/en) | `dist/experiences/baikal/`，包括 `_next/` 预构建包、图片、帧序列、视频、字体、外部资料及 PDF | 原站页面、设计和素材的再分发许可未确认。原站标有 BAIKALSEA Company 版权信息。本项目不为这些内容授予开源许可，也不将原站产品资料或认证解释为安康产品的资料或认证。 |
| [Prismic course-fizzi-next](https://github.com/prismicio-community/course-fizzi-next)；采集入口 [fizzi-demo.vercel.app](https://fizzi-demo.vercel.app/) | `dist/experiences/fizzi/` 内可归属于课程的页面和应用代码；`design-source/orb-carousel-module.js` 中沿用的波纹、箭头等课程组件内容 | 上游课程源码采用 Apache License 2.0，作者信息为 Prismic；许可全文见 [`licenses/fizzi-Apache-2.0.txt`](licenses/fizzi-Apache-2.0.txt)。其依赖、字体及非代码素材需要分别按各自许可处理，不能仅因打包在课程中就视为 Apache-2.0。 |

本项目对参考体验进行了路径本地化、品牌及文案替换、滚动桥接、瓶模型和图像替换、轮播及悬浮展示调整。Fizzi 派生的可读模块和运行时已被修改，并非 Prismic 的原始发行版。上游课程许可允许在满足其条款的情况下分发派生代码；应保留 Apache-2.0 许可、原有归属信息与修改标记。不能把本地镜像中的任意其他文件一概归入这一许可。

逐文件来源映射保存在 `asset-manifest.json`、`baikal-asset-manifest.json` 与 `fizzi-asset-manifest.json`。这些清单记录来源，不是授权证明。

## 已识别的软件依赖

本地静态包中保留了以下依赖的版权或许可标记。提供的许可副本取自相应项目；版本依据本地文件头或课程上游依赖信息。下表不是完整的软件物料清单，预构建运行时还可能包含其他间接依赖。

| 组件 | 许可与来源 |
| --- | --- |
| React / React DOM | MIT；[官方源码](https://github.com/facebook/react)，[`licenses/react-MIT.txt`](licenses/react-MIT.txt)。 |
| Next.js | MIT；[官方源码](https://github.com/vercel/next.js)，[`licenses/nextjs-MIT.txt`](licenses/nextjs-MIT.txt)。 |
| Three.js | MIT；[官方源码](https://github.com/mrdoob/three.js)，[`licenses/Threejs-MIT.txt`](licenses/Threejs-MIT.txt)。本地 Fizzi 包保留 Three.js Authors 的版权标记。 |
| jQuery 3.5.1 | MIT；[官方源码](https://github.com/jquery/jquery)，[`licenses/jquery-MIT.txt`](licenses/jquery-MIT.txt)。 |
| jquery.ripples | MIT；[官方源码](https://github.com/sirxemic/jquery.ripples)，[`licenses/jquery-ripples-MIT.txt`](licenses/jquery-ripples-MIT.txt)。 |
| Swiper 8 | MIT；[官方源码](https://github.com/nolimits4web/swiper)，[`licenses/swiper-MIT.txt`](licenses/swiper-MIT.txt)。 |
| Tailwind CSS 3.4.10 | MIT；[官方源码](https://github.com/tailwindlabs/tailwindcss)，[`licenses/Tailwindcss-MIT.txt`](licenses/Tailwindcss-MIT.txt)。 |
| GSAP 3.12.5、@gsap/react 2.1.1 与相关插件 | **独立 GSAP 许可，不是 MIT 或 Apache-2.0。** Fizzi 文件头保留 © 2008–2024 GreenSock 及许可链接；适用条款见文件内链接和 [GSAP 官方许可](https://gsap.com/standard-license/)。当前网页条款与历史发行版条款可能不同，不应抹除原文件中的许可标记。 |
| Typr.ts、fflate 及字体处理代码 | Fizzi 包内有归属标记；应保留这些标记及其链接：[Typr.ts](https://github.com/fredli74/Typr.ts/blob/master/LICENSE)、[fflate](https://github.com/101arrowz/fflate/blob/master/LICENSE)。不能用本项目 MIT 许可替代它们各自的许可。 |

其他库或代码片段，以对应文件中的版权、许可证及官方上游条款为准。镜像运行时不是完整原始工程，仓库没有声称已完成其全部间接依赖的许可审计。

## 字体与视觉素材

- `dist/assets/` 中来自 Google Fonts 的 Lato、Poppins、Lexend Zetta，以及 Baikal 中的 Roboto Flex，分别保留 SIL Open Font License 1.1。许可和版权声明已保存为 `licenses/Lato-OFL.txt`、`Poppins-OFL.txt`、`LexendZetta-OFL.txt`、`RobotoFlex-OFL.txt`。字体不得重新标为本项目的 MIT 许可。
- Fizzi 的 Alpino 字体（含 `_next/static/media/` 中的优化副本）来自 Indian Type Foundry / [Fontshare](https://www.fontshare.com/)。它不由 Prismic 的课程许可或本项目 MIT 许可重新授权；使用或分发字体前应核对 [Fontshare 字体许可](https://www.fontshare.com/licenses)。
- Baikal 的 `fonts/Faberge-Regular.woff2` 未附带可验证的开放许可；本项目不授予其复用或分发权。
- 参考网站中的照片、背景、纹理、视频、HDR 环境、原有模型和品牌标识不自动继承 JavaScript 库或课程源码的许可。不能确认独立授权的素材均排除在本项目 MIT 许可之外。
- `dist/brand/`、`design-source/orbs/` 中的品牌图片、原始设计展板、参考图及衍生生成图，来源为用户提供素材或基于其参考生成的图像，参见 `docs/image-generation.json`、`docs/orb-asset-manifest.json`、`docs/seven-orbs-generation.md` 和生成提示词。生成来源记录不证明底层品牌、人物或参考作品的权利归属。上述视觉素材、安康 / SE·34 名称和商标不由代码的 MIT 许可授予商标使用或独立素材再许可。

## 许可文件来源

`licenses/sources.json` 记录本仓库附带许可文本的下载来源。保留已有版权与许可标记，尤其不要在压缩、复制或二次打包时删除第三方声明。准备分发完整派生站点时，需要自行确认未获许可确认的第三方内容，或者换用已取得许可的替代资源。
