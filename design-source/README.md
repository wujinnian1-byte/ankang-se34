# SE·34 — 安康硒谷 bottle model

Created from the two supplied bottle references using procedural geometry only. The references guided the proportions; their image pixels are not embedded. No image-generation tool was used. Lettering is outlined vector SVG so the Chinese brand and Se/34 emblem do not depend on runtime fonts.

## Deliverables

- `SE34-bottle.gltf` + `SE34-bottle.bin`: uncompressed glTF 2.0, no Draco decoder required.
- `badge-se34.svg`: transparent silver-white Se / 34 emblem lettering.
- `wordmark-se34.svg`: transparent SE·34 / 安康硒谷 / NATURAL MINERAL WATER typography.
- `component-fragment.js`: ready reference replacement for the existing Fizzi bundle's `function u(e)`, retaining the parent FloatingCan transforms and animations.
- `build_model.py`: repeatable procedural source; Python standard library only.
- `build_decals.py`: SVG text-to-outline source; uses FontTools and local system fonts at build time only.
- `model-stats.json`: geometry bounds/counts and BIN SHA-256.

## Model proportions

The total model height is 0.9074864 units, maximum diameter 0.230592 units (height/diameter 3.94), matching the reference's slender, bottom-full teardrop silhouette. Silver cap extends from y=0.3347 to 0.4571264; bottle foot reaches y=-0.45036. At the existing `scale=2`, total displayed world height is 1.81497 and maximum diameter 0.46118. The original can was about 0.70 high × 0.40 diameter before scale, so this bottle is taller and much narrower, as required by the reference.

Use the original scale 2 to emphasize the bottle shape. If a specific scene needs the exact original can height to prevent overlap, use bottle scale 1.542 instead (and leave FloatingCan parent positions/rotations unchanged). All node transforms are identity and the geometry positions are baked, because the deployed SodaCan accesses `nodes.NAME.geometry` directly. The bottle's front is **local -Z**, which becomes camera-facing +Z under the existing group `rotation={[0,-Math.PI,0]}`. Front texture UVs have already been mirrored in U for this orientation; do not mirror them again.

## Nodes

| Name | Geometry | Suggested material |
| --- | --- | --- |
| `cylinder` | Smooth tapered polished cap, oblique top, narrow collar ring | MeshStandardMaterial, metalness 1, roughness .17, color #e0e8f0, envMapIntensity 1.6 |
| `cylinder_1` | Closed lathed glass shell: outer surface, inner wall, open-mouth lip and thick shallow-concave base | MeshPhysicalMaterial, transmission .96, ior 1.46, roughness .065–.08, thickness .35, metalness 0, clearcoat 1, clearcoatRoughness .04 |
| `Tab` | Circular emblem rim, inner highlight ring, extremely fine foot seam | Same polished metal, roughness .16 |
| `BadgeInset` | Slightly convex dark metal center, conforming to bottle taper | MeshStandardMaterial, color #18212a, metalness .86, roughness .20 |
| `MountainCrystal` | Seven-peak faceted mountain ridgeline inside the lower bottle | MeshPhysicalMaterial, color #9daebc, transmission .42, ior 1.46, roughness .18, metalness .15, thickness .10 |
| `BadgeDecal` | Convex front surface for Se/34 SVG text | MeshBasicMaterial, map badge-se34.svg, transparent true, depthWrite false, toneMapped false |
| `WordmarkDecal` | Curved front patch around the lower-middle bottle | MeshBasicMaterial, map wordmark-se34.svg, transparent true, depthWrite false, toneMapped false |

For glass use `attenuationColor='#e6f5ff'`, `attenuationDistance=3`, `envMapIntensity=1.6`. Keep opacity 1 and use physical transmission; applying opacity .1 would weaken the reference's strong glass edges. Use the existing HDR environment and key lights. Mountain transmission is deliberately lower to keep the internal ridgeline visible through the bottle shell.

Textures loaded through Three's TextureLoader/useTexture should have `colorSpace=THREE.SRGBColorSpace`, `flipY=true`, `anisotropy=8`. SVGs contain only path outlines and no external dependencies. The glTF materials for decal meshes are intentionally fully transparent placeholders; an unmodified generic viewer will display the complete bottle/emblem/mountains but not lettering until the SVG maps are assigned. The supplied component fragment does this.

## Component integration

Copy the five runtime assets (GLTF, BIN, two SVGs, plus the desired component replacement) under a local static directory such as `/experiences/fizzi/se34/`. `component-fragment.js` assumes that URL. Replace both `useGLTF.preload('/Soda-can.gltf')` and the component's useGLTF call with the new path. The old five flavor texture loads should be removed, since this bottle uses clear glass and the two new decals. The existing `flavor` prop may remain accepted but is unused, allowing all intro, dive, carousel and alternating-scene animation call sites to remain intact.

The first three compatibility nodes render through the original component, but complete fidelity requires adding the other four nodes as in the provided fragment. Keep GLTF and BIN adjacent, since the buffer URI is relative. No changes to the main website project were made by this subtask.

## Verification

90,984 triangles, 2,724,192-byte geometry buffer. Index ranges, finite positions/normals, buffer sizes, normalized normals and triangle winding were checked; no faces have normals opposite their winding. Axis-center triangulation includes standard zero-area cap-center triangles, which are harmless. The geometry is smooth at 128 radial segments; mountain faces deliberately use independent flat normals. Real browser lighting/composition still needs the root agent's scene preview, especially for the five-bottle hero.
