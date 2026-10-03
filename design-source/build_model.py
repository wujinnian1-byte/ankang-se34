"""Generate the SE·34 bottle as a self-contained, uncompressed glTF 2.0 asset.

All geometry transforms are baked: consumers may safely use nodes.NAME.geometry.
The local front is -Z to match the existing SodaCan group's rotation [0,-PI,0].
No reference image pixels or generated raster artwork are used.
"""
from pathlib import Path
import math
import json
import struct
import hashlib

ROOT = Path(__file__).parent
TAU = 2 * math.pi


class Mesh:
    def __init__(self):
        self.p, self.n, self.uv, self.i = [], [], [], []

    def vertex(self, p, n, uv):
        self.p.extend(p)
        self.n.extend(n)
        self.uv.extend(uv)
        return len(self.p) // 3 - 1

    def tri(self, a, b, c):
        self.i.extend((a, b, c))

    def merge(self, other):
        offset = len(self.p) // 3
        self.p.extend(other.p)
        self.n.extend(other.n)
        self.uv.extend(other.uv)
        self.i.extend(i + offset for i in other.i)
        return self


def normalize(p):
    length = math.sqrt(sum(x*x for x in p)) or 1
    return tuple(x / length for x in p)


def cross(a, b):
    return (a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0])


def sample_curve(points, steps=5):
    """Cubic Hermite sampling; end tangents constrained at the revolution axis."""
    output = []
    for i in range(len(points)-1):
        prev, a, b, nxt = points[max(0, i-1)], points[i], points[i+1], points[min(len(points)-1, i+2)]
        ma = tuple((b[d]-prev[d]) / 2 for d in range(2))
        mb = tuple((nxt[d]-a[d]) / 2 for d in range(2))
        if i == 0:
            ma = (b[0]-a[0], 0)
        if i == len(points)-2:
            mb = (b[0]-a[0], 0)
        for j in range(steps):
            t = j / steps
            p = tuple((2*t**3-3*t*t+1)*a[d] + (t**3-2*t*t+t)*ma[d] + (-2*t**3+3*t*t)*b[d] + (t**3-t*t)*mb[d] for d in range(2))
            derivative = tuple((6*t*t-6*t)*a[d] + (3*t*t-4*t+1)*ma[d] + (-6*t*t+6*t)*b[d] + (3*t*t-2*t)*mb[d] for d in range(2))
            output.append((max(0, p[0]), p[1], derivative))
    output.append((points[-1][0], points[-1][1], (points[-1][0]-points[-2][0], 0)))
    return output


def lathe(points, radial=128, steps=5, y_slope=0, slope_start=0.0):
    samples = sample_curve(points, steps)
    mesh = Mesh()
    total = len(samples)
    for k, (r, y, (dr, dy)) in enumerate(samples):
        for j in range(radial+1):
            theta = j / radial * TAU
            c, s = math.cos(theta), math.sin(theta)
            factor = max(0, min(1, (y-slope_start) / .07)) if y_slope else 0
            adjusted_y = y + y_slope * r * c * factor
            # Exact smooth derivatives for the slanted upper cap.
            df = 1/.07 if y_slope and slope_start < y < slope_start+.07 else 0
            dp = (dr*c, dy+y_slope*c*(dr*factor+r*df*dy), dr*s)
            dt = (-s, -y_slope*s*factor, c)
            normal = normalize(cross(dp, dt))
            mesh.vertex((r*c, adjusted_y, r*s), normal, (j/radial, k/(total-1)))
    for k in range(total-1):
        for j in range(radial):
            a=k*(radial+1)+j; b=a+radial+1
            mesh.tri(a, b, a+1)
            mesh.tri(a+1, b, b+1)
    return mesh


def torus(radius, tube, center, plane="xy", major=128, minor=20):
    m = Mesh()
    for i in range(major+1):
        a=i/major*TAU
        for j in range(minor+1):
            b=j/minor*TAU
            ca,sa,cb,sb=math.cos(a),math.sin(a),math.cos(b),math.sin(b)
            if plane == "xy":
                p=((radius+tube*cb)*ca,(radius+tube*cb)*sa,tube*sb)
                n=(cb*ca,cb*sa,sb)
            else:
                p=((radius+tube*cb)*ca,tube*sb,(radius+tube*cb)*sa)
                n=(cb*ca,sb,cb*sa)
            m.vertex(tuple(p[d]+center[d] for d in range(3)),n,(i/major,j/minor))
    for i in range(major):
        for j in range(minor):
            a=i*(minor+1)+j;b=a+minor+1
            if plane == "xy":
                m.tri(a,b,a+1);m.tri(a+1,b,b+1)
            else:
                m.tri(a,a+1,b);m.tri(a+1,b+1,b)
    return m


def front_disc(radius, center, depth=.0018, radial=128):
    """Convex circular badge face, front normal -Z."""
    m=Mesh()
    rings=16
    for k in range(rings+1):
        t=k/rings; r=radius*t
        for j in range(radial+1):
            a=j/radial*TAU;c,s=math.cos(a),math.sin(a)
            bulge=depth*(1-t*t)
            n=normalize((2*depth*r/(radius*radius)*c,2*depth*r/(radius*radius)*s,-1))
            m.vertex((center[0]+r*c,center[1]+r*s,center[2]-bulge),n,(.5-.5*t*c,.5+.5*t*s))
    for k in range(rings):
        for j in range(radial):
            a=k*(radial+1)+j;b=a+radial+1
            m.tri(a,a+1,b);m.tri(a+1,b+1,b)
    return m


def conform_badge(mesh, center_y, slope=.165):
    """Follow the bottle's tapered tangent plane instead of floating vertically."""
    for i in range(0, len(mesh.p), 3):
        mesh.p[i+2] += slope * (mesh.p[i+1]-center_y)
        mesh.n[i:i+3] = normalize((mesh.n[i], mesh.n[i+1]-slope*mesh.n[i+2], mesh.n[i+2]))
    return mesh


def label_patch(width, height, y, radius, z_offset=.001, columns=32, rows=8):
    """Cylindrical transparent-label patch facing -Z; no opaque backing plane."""
    m=Mesh()
    for j in range(rows+1):
        yy=y+(j/rows-.5)*height
        for i in range(columns+1):
            xx=(i/columns-.5)*width
            zz=-math.sqrt(max(.0001,radius*radius-xx*xx))-z_offset
            m.vertex((xx,yy,zz),normalize((xx,0,zz)),(1-i/columns,j/rows))
    for j in range(rows):
        for i in range(columns):
            a=j*(columns+1)+i;b=a+columns+1
            m.tri(a,b,a+1);m.tri(a+1,b,b+1)
    return m


def mountains():
    """Triangulated ridgeline with independent faceted normals, not circular cones."""
    m=Mesh()
    # x, z, height, footprint-x, footprint-z. Front is negative Z.
    peaks=[(-.067,.010,.044,.033,.038),(-.052,-.016,.072,.034,.038),
           (-.020,.025,.058,.033,.035),(.001,-.020,.069,.028,.040),
           (.033,.018,.051,.031,.043),(.061,-.003,.088,.035,.040),
           (.073,.032,.041,.027,.030)]
    def height(x,z):
        h=.002
        for px,pz,peak,sx,sz in peaks:
            dist=math.sqrt(((x-px)/sx)**2+((z-pz)/sz)**2)
            h=max(h,peak*max(0,1-dist)**.82)
        ridge=.0020*math.sin(351*x+114*z)*math.sin(278*z-97*x)
        edge=max(0,1-(x/.092)**2-(z/.057)**2)
        return -.319+(h+ridge)*min(1,edge*4)
    cells_x,cells_z=44,26
    def pos(i,j):
        x=-.094+i/cells_x*.188;z=-.059+j/cells_z*.118
        return (x,height(x,z),z)
    for j in range(cells_z):
        for i in range(cells_x):
            pts=[pos(i,j),pos(i+1,j),pos(i,j+1),pos(i+1,j+1)]
            if any((p[0]/.094)**2+(p[2]/.059)**2>1 for p in pts):continue
            order=[(0,2,1),(1,2,3)] if (i+j)%2 else [(0,2,3),(0,3,1)]
            for ids in order:
                a,b,c=(pts[k] for k in ids)
                n=normalize(cross(tuple(b[d]-a[d] for d in range(3)),tuple(c[d]-a[d] for d in range(3))))
                verts=[m.vertex(p,n,((p[0]+.094)/.188,(p[2]+.059)/.118)) for p in (a,b,c)]
                m.tri(*verts)
    return m


# The curved wall is a closed revolution profile with a thick, shallow concave foot.
outer=[(0,-.433),(.018,-.436),(.036,-.447),(.047,-.450),(.058,-.440),
       (.071,-.415),(.086,-.380),(.099,-.335),(.109,-.280),(.115,-.220),
       (.114,-.150),(.110,-.080),(.100,0),(.086,.080),(.070,.150),
       (.055,.210),(.044,.260),(.036,.300),(.033,.326),(.033,.344)]
inner=[(.028,.344),(.028,.326),(.031,.300),(.039,.260),(.050,.210),
       (.065,.150),(.081,.080),(.095,0),(.105,-.080),(.109,-.150),
       (.110,-.220),(.104,-.280),(.094,-.330),(.083,-.371),(.066,-.401),
       (.049,-.412),(.032,-.415),(.014,-.412),(0,-.409)]
glass=lathe(outer+inner,128,5)
cap_profile=[(0,.344),(.029,.344),(.035,.344),(.037,.349),(.037,.355),
             (.038,.367),(.040,.390),(.043,.416),(.047,.438),(.0475,.444),
             (.045,.448),(.035,.449),(.018,.449),(0,.449)]
cap=lathe(cap_profile,128,5,y_slope=.20,slope_start=.36)
cap.merge(torus(.034,.0023,(0,.337,0),plane="xz",minor=16))

badge_y=-.005
badge_z=-.1035
trim=torus(.024,.0030,(0,badge_y,badge_z))
trim.merge(torus(.0205,.0008,(0,badge_y,badge_z-.0010),major=128,minor=12))
conform_badge(trim,badge_y)
# Delicate signature seam around the foot: subtle geometry, not a heavy base ring.
trim.merge(torus(.0475,.0009,(0,-.447,0),plane="xz",minor=12))
badge=conform_badge(front_disc(.0218,(0,badge_y,badge_z-.0002),.002),badge_y)
badge_decal=conform_badge(front_disc(.0198,(0,badge_y,badge_z-.0024),.0008),badge_y)
wordmark=label_patch(.073,.048,-.188,.1145,.0018)
crystals=mountains()

materials=[
 {"name":"Polished Silver","pbrMetallicRoughness":{"baseColorFactor":[.88,.91,.94,1],"metallicFactor":1,"roughnessFactor":.17}},
 {"name":"Clear Bottle Glass","pbrMetallicRoughness":{"baseColorFactor":[.96,.985,1,1],"metallicFactor":0,"roughnessFactor":.065},"extensions":{"KHR_materials_transmission":{"transmissionFactor":.96},"KHR_materials_ior":{"ior":1.46},"KHR_materials_volume":{"thicknessFactor":.35,"attenuationColor":[.90,.96,1],"attenuationDistance":3}}},
 {"name":"Badge Inset","pbrMetallicRoughness":{"baseColorFactor":[.075,.10,.125,1],"metallicFactor":.86,"roughnessFactor":.20}},
 {"name":"Mountain Crystal","pbrMetallicRoughness":{"baseColorFactor":[.63,.71,.76,1],"metallicFactor":.15,"roughnessFactor":.18},"extensions":{"KHR_materials_transmission":{"transmissionFactor":.42},"KHR_materials_ior":{"ior":1.46},"KHR_materials_volume":{"thicknessFactor":.10,"attenuationColor":[.84,.93,1],"attenuationDistance":1}}},
 {"name":"Decal Placeholder Hidden","pbrMetallicRoughness":{"baseColorFactor":[1,1,1,0],"metallicFactor":0,"roughnessFactor":1},"alphaMode":"BLEND"},
]

items=[("cylinder",cap,0),("cylinder_1",glass,1),("Tab",trim,0),
       ("BadgeInset",badge,2),("MountainCrystal",crystals,3),
       ("BadgeDecal",badge_decal,4),("WordmarkDecal",wordmark,4)]
blob=bytearray();views=[];accessors=[];meshes=[];nodes=[]

def buffer(values, component, dims, target):
    while len(blob)%4:blob.append(0)
    start=len(blob);fmt={5126:"f",5125:"I"}[component]
    blob.extend(struct.pack('<'+fmt*len(values),*values))
    view=len(views);views.append({"buffer":0,"byteOffset":start,"byteLength":len(blob)-start,"target":target})
    ac={"bufferView":view,"componentType":component,"count":len(values)//dims,"type":{1:"SCALAR",2:"VEC2",3:"VEC3"}[dims]}
    if target==34962 and dims==3:
        ac['min']=[min(values[d::dims]) for d in range(dims)];ac['max']=[max(values[d::dims]) for d in range(dims)]
    index=len(accessors);accessors.append(ac);return index

stats={}
for name,m,material in items:
    attrs={"POSITION":buffer(m.p,5126,3,34962),"NORMAL":buffer(m.n,5126,3,34962),"TEXCOORD_0":buffer(m.uv,5126,2,34962)}
    indices=buffer(m.i,5125,1,34963)
    meshes.append({"name":name,"primitives":[{"attributes":attrs,"indices":indices,"material":material,"mode":4}]})
    nodes.append({"name":name,"mesh":len(meshes)-1})
    stats[name]={"vertices":len(m.p)//3,"triangles":len(m.i)//3,"min":accessors[attrs['POSITION']]['min'],"max":accessors[attrs['POSITION']]['max']}

doc={"asset":{"version":"2.0","generator":"SE34 procedural lathe bottle builder; baked transforms"},
     "scene":0,"scenes":[{"name":"SE34 Ankang Selenium Valley","nodes":list(range(len(nodes)))}],
     "nodes":nodes,"meshes":meshes,"materials":materials,"buffers":[{"uri":"SE34-bottle.bin","byteLength":len(blob)}],
     "bufferViews":views,"accessors":accessors,
     "extensionsUsed":["KHR_materials_transmission","KHR_materials_ior","KHR_materials_volume"]}
(ROOT/'SE34-bottle.gltf').write_text(json.dumps(doc,separators=(',',':')))
(ROOT/'SE34-bottle.bin').write_bytes(blob)
summary={"front":"negative Z (existing group rotates Y=-PI)","height":max(v['max'][1] for v in stats.values())-min(v['min'][1] for v in stats.values()),"max_body_diameter":stats['cylinder_1']['max'][0]-stats['cylinder_1']['min'][0],"nodes":stats,"triangles":sum(s['triangles'] for s in stats.values()),"bin_bytes":len(blob),"bin_sha256":hashlib.sha256(blob).hexdigest()}
(ROOT/'model-stats.json').write_text(json.dumps(summary,indent=2))
print(json.dumps(summary,indent=2))
