"""
把 cooler_33L_base_copy（= cooler_33L_photo_reference.glb，两者 .blend 字节一致）
处理成网站用的 public/model/cryodrive.glb：
  1. 删除棚拍地面、参考照片、尺寸包络盒、布尔刀具
  2. 按拆解分组重排为 GRP_<key> 节点，组节点为单位矩阵，网格烘焙为世界坐标
  3. 同组同材质合并网格，减少 draw call
用法：python3 scripts/prepare_model.py <源 glb> <输出 glb>
"""
import json, re, struct, sys
import numpy as np

SRC, DST = sys.argv[1], sys.argv[2]

HIDE = re.compile(r'^(REF_|SM_Studio|SM_Blockout|SM_Tool_)')
# 首个命中即归组；CTRL_* 节点会把组传给全部子孙
GROUPS = [
    ('handle',    r'^(CTRL_Top_Carry_Handle|SM_Top_Handle_|SM_Top_U_Carry)'),
    ('gasket',    r'^SM_Lid_Continuous_Compression_Gasket'),
    ('lid',       r'^CTRL_Lid_Hinge$'),
    ('latchL',    r'^CTRL_Latch_Lever_L$'),
    ('latchR',    r'^CTRL_Latch_Lever_R$'),
    ('sideL',     r'^CTRL_Side_Handle_Left$'),
    ('sideR',     r'^CTRL_Side_Handle_Right$'),
]

raw = open(SRC, 'rb').read()
jlen = struct.unpack('<I', raw[12:16])[0]
gltf = json.loads(raw[20:20 + jlen])
binstart = 20 + jlen + 8
BIN = raw[binstart:]
N = gltf['nodes']

def read_acc(i):
    a = gltf['accessors'][i]; bv = gltf['bufferViews'][a['bufferView']]
    comp = {5126: np.float32, 5123: np.uint16, 5125: np.uint32}[a['componentType']]
    ncomp = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3}[a['type']]
    off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    arr = np.frombuffer(BIN, comp, a['count'] * ncomp, off)
    return arr.reshape(-1, ncomp) if ncomp > 1 else arr

def local(n):
    t = np.array(n.get('translation', [0, 0, 0]), float)
    x, y, z, w = n.get('rotation', [0, 0, 0, 1])
    s = np.array(n.get('scale', [1, 1, 1]), float)
    R = np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)],
                  [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)],
                  [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])
    M = np.eye(4); M[:3, :3] = R * s; M[:3, 3] = t
    return M

buckets = {}   # (group, material) -> [pos, nrm, idx]
counts = {}
def walk(i, P, group):
    n = N[i]; name = n.get('name', '')
    if HIDE.match(name): return
    for key, rx in GROUPS:
        if re.match(rx, name): group = key; break
    M = P @ local(n)
    if 'mesh' in n:
        counts[group] = counts.get(group, 0) + 1
        R = M[:3, :3]; Rn = np.linalg.inv(R).T
        for p in gltf['meshes'][n['mesh']]['primitives']:
            pos = read_acc(p['attributes']['POSITION']).astype(np.float64)
            nrm = read_acc(p['attributes']['NORMAL']).astype(np.float64)
            idx = read_acc(p['indices']).astype(np.uint32)
            pos = pos @ R.T + M[:3, 3]
            nrm = nrm @ Rn.T
            nrm /= np.maximum(np.linalg.norm(nrm, axis=1, keepdims=True), 1e-9)
            b = buckets.setdefault((group, p.get('material', 0)), [[], [], [], 0])
            b[0].append(pos); b[1].append(nrm); b[2].append(idx + b[3]); b[3] += len(pos)
    for c in n.get('children', []): walk(c, M, group)

for r in gltf['scenes'][0]['nodes']:
    walk(r, np.eye(4), 'body')

# ---- 写出新 glb ----
out_bin = bytearray(); views = []; accs = []
def push(arr, target, comp, typ, minmax=False):
    while len(out_bin) % 4: out_bin.append(0)
    off = len(out_bin); data = arr.tobytes(); out_bin.extend(data)
    views.append({'buffer': 0, 'byteOffset': off, 'byteLength': len(data), 'target': target})
    a = {'bufferView': len(views) - 1, 'componentType': comp, 'count': int(arr.shape[0]), 'type': typ}
    if minmax:
        a['min'] = arr.min(0).tolist(); a['max'] = arr.max(0).tolist()
    accs.append(a); return len(accs) - 1

mat_keep = sorted({m for (_, m) in buckets})
mat_map = {m: k for k, m in enumerate(mat_keep)}
meshes = []; nodes = [{'name': 'CryoDrive_Base_33L', 'children': []}]
group_nodes = {}
tri_total = 0
for (group, m), (P, Nn, I, _) in sorted(buckets.items()):
    pos = np.concatenate(P).astype(np.float32); nrm = np.concatenate(Nn).astype(np.float32)
    idx = np.concatenate(I)
    tri_total += len(idx) // 3
    ia = push(idx.astype(np.uint16) if pos.shape[0] < 65536 else idx.astype(np.uint32),
              34963, 5123 if pos.shape[0] < 65536 else 5125, 'SCALAR')
    pa = push(pos, 34962, 5126, 'VEC3', True); na = push(nrm, 34962, 5126, 'VEC3')
    meshes.append({'name': f'{group}_{gltf["materials"][m]["name"]}',
                   'primitives': [{'attributes': {'POSITION': pa, 'NORMAL': na}, 'indices': ia, 'material': mat_map[m]}]})
    if group not in group_nodes:
        nodes.append({'name': f'GRP_{group}', 'children': []}); group_nodes[group] = len(nodes) - 1
        nodes[0]['children'].append(group_nodes[group])
    nodes.append({'name': meshes[-1]['name'], 'mesh': len(meshes) - 1})
    nodes[group_nodes[group]]['children'].append(len(nodes) - 1)

materials = []
for m in mat_keep:
    mm = dict(gltf['materials'][m]); mm['name'] = mm['name'].replace('.001', '')
    materials.append(mm)

out = {'asset': {'version': '2.0', 'generator': 'CryoDrive prepare_model.py'},
       'scene': 0, 'scenes': [{'name': 'CryoDrive', 'nodes': [0]}], 'nodes': nodes,
       'meshes': meshes, 'materials': materials, 'accessors': accs, 'bufferViews': views,
       'buffers': [{'byteLength': len(out_bin)}]}
js = json.dumps(out, separators=(',', ':')).encode()
js += b' ' * ((4 - len(js) % 4) % 4)
while len(out_bin) % 4: out_bin.append(0)
total = 12 + 8 + len(js) + 8 + len(out_bin)
with open(DST, 'wb') as f:
    f.write(struct.pack('<III', 0x46546C67, 2, total))
    f.write(struct.pack('<II', len(js), 0x4E4F534A)); f.write(js)
    f.write(struct.pack('<II', len(out_bin), 0x004E4942)); f.write(out_bin)

print('源网格节点按组：', counts)
print(f'输出：{len(meshes)} 个网格（draw call），{tri_total} 个三角面，{total/1024/1024:.2f} MB')
print('材质：', [m['name'] for m in materials])
