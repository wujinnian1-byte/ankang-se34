/* Replacement for the live bundle's function u(e).
   Existing module aliases: n=jsx runtime, i=useGLTF module, s=useTexture module,
   l=THREE. Paths below assume the root agent copies model assets to this URL.
   Also replace the original useGLTF.preload URL immediately before function u.
   Revision 2: exact original-can height/pivot normalization, and glass compositing
   suitable for a transparent Canvas layered ABOVE HTML/CSS backgrounds.
   Existing FloatingCan transforms/ref wiring remain unchanged.
*/
function u(e) {
  const { flavor = 'blackCherry', scale = 2, ...props } = e;
  const tones = {
    blackCherry:'#819d96', lemonLime:'#769bab', grape:'#a29778',
    strawberryLemonade:'#8d9ba9', watermelon:'#aa8f96', pure:'#8b9ea9'
  };
  const { nodes } = (0, i.L)('/experiences/fizzi/se34/SE34-bottle.gltf');
  const maps = (0, s.mE)({
    badge: '/experiences/fizzi/se34/badge-se34.svg',
    wordmark: '/experiences/fizzi/se34/wordmark-se34.svg'
  });
  maps.badge.colorSpace = l.SRGBColorSpace;
  maps.wordmark.colorSpace = l.SRGBColorSpace;
  maps.badge.flipY = true;
  maps.wordmark.flipY = true;
  maps.badge.anisotropy = maps.wordmark.anisotropy = 8;
  // Scene transmission can only sample WebGL content, not the HTML behind the
  // transparent Canvas. Use a reflective Fresnel-alpha surface here instead of
  // a white transmission buffer. This retains clear centers + solid glass rims.
  const glassShader = shader => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `
      float se34Edge = pow(1.0 - clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0), 2.2);
      diffuseColor.a = mix(0.065, 0.58, se34Edge);
      outgoingLight = mix(outgoingLight, vec3(0.028, 0.055, 0.075), 0.36 * se34Edge);
      #include <opaque_fragment>
      `
    );
  };
  const mesh = (name, kind, material) => (0, n.jsx)('mesh', {
    geometry: nodes[name].geometry,
    castShadow: name === 'cylinder',
    receiveShadow: false,
    renderOrder: name.includes('Decal') ? 20 : name === 'cylinder_1' ? 5 : 0,
    children: (0, n.jsx)(kind, material)
  }, name);
  return (0, n.jsxs)('group', {
    ...props,
    dispose: null,
    scale,
    rotation: [0, -Math.PI, 0],
    // Original can Y bbox [-.349270970,.350070447], center .000399739.
    // Bottle Y bbox [-.45036,.4571264], center .0033832.
    // Uniform normalization preserves the bottle proportions and original poses.
    children: (0, n.jsxs)('group', {
      scale: 0.7706356991784645,
      position: [-0.00001833587885, -0.00220747614727, 0.00039511436023],
      children: [
      mesh('cylinder', 'meshStandardMaterial', { color:'#a8b3bd', metalness:1, roughness:.145, envMapIntensity:.72 }),
      mesh('cylinder_1', 'meshPhysicalMaterial', {
        color:tones[flavor] || tones.pure, metalness:.015, roughness:.075,
        transmission:0, ior:1.46, thickness:0,
        clearcoat:.26, clearcoatRoughness:.06, specularIntensity:.9,
        envMapIntensity:.38, transparent:true, opacity:1,
        depthWrite:false, side:l.FrontSide,
        onBeforeCompile:glassShader,
        customProgramCacheKey:()=> 'se34-fresnel-alpha-v2'
      }),
      mesh('Tab', 'meshStandardMaterial', { color:'#b9c5ce', metalness:1, roughness:.16, envMapIntensity:.7 }),
      mesh('BadgeInset', 'meshBasicMaterial', { color:'#172630', toneMapped:false }),
      mesh('MountainCrystal', 'meshPhysicalMaterial', {
        color:'#6e8799', metalness:.28, roughness:.20, transmission:0,
        ior:1.46, clearcoat:.25, envMapIntensity:.68
      }),
      mesh('BadgeDecal', 'meshBasicMaterial', { map:maps.badge, transparent:true, depthWrite:false, depthTest:false, toneMapped:false, polygonOffset:true, polygonOffsetFactor:-2 }),
      mesh('WordmarkDecal', 'meshBasicMaterial', { map:maps.wordmark, color:'#6c7b87', transparent:true, depthWrite:false, depthTest:false, toneMapped:false, polygonOffset:true, polygonOffsetFactor:-2 })
      ]
    })
  });
}
