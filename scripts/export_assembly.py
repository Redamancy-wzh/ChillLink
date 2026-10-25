"""Build a web-optimized GLB from the current visible cooler assembly.
The source .blend is never changed. Geometry is baked into controller-local space;
controller empties receive an explicit closed/open animation for Three.js.
"""
import bpy, json, math
from pathlib import Path
from mathutils import Vector, Matrix
OUT = Path(__file__).resolve().parents[1] / 'public'
source = bpy.context.scene
allowed = {'01_Body_and_Liner','02_Lid_and_Seal','03_Carry_Handles','04_Latches_and_Hinges','COL_Internal_Retrofit','COL_ControlBox_Final'}
source.frame_set(35)
bpy.context.view_layer.update()
deps = bpy.context.evaluated_depsgraph_get()
# The visible design includes the current lid cooling/control-box parts only.
originals = [o for o in source.objects if o.type in {'MESH','FONT','CURVE'} and not o.hide_render and o.visible_get() and any(c.name in allowed for c in o.users_collection)]
control_src = {o.name:o for o in source.objects if o.name.startswith('CTRL_') and o.type=='EMPTY'}
# Preserve the controller hierarchy using local transforms, with stable export names.
scene = bpy.data.scenes.new('CryoDrive_Web_Assembly')
scene.frame_start, scene.frame_end, scene.render.fps = 1, 90, 30
bpy.context.window.scene = scene
clones = {}
for name in sorted(control_src, key=lambda n: len(control_src[n].parent.name) if control_src[n].parent and control_src[n].parent.name in control_src else 0):
    o=control_src[name]; n=bpy.data.objects.new(name,None); scene.collection.objects.link(n); clones[name]=n
    if o.parent and o.parent.name in clones: n.parent=clones[o.parent.name]
    n.matrix_local=o.matrix_local.copy()
bpy.context.view_layer.update()
# Bake mesh vertices into the nearest exported controller's local space.
def nearest_export_parent(o):
    p=o.parent
    while p and p.name not in clones:p=p.parent
    return clones[p.name] if p else clones['CTRL_Cooler']
buckets={}
for o in originals:
    ev=o.evaluated_get(deps)
    mesh=bpy.data.meshes.new_from_object(ev, depsgraph=deps)
    p=nearest_export_parent(o)
    # Geometry is transformed from object local to controller-local coordinates.
    mesh.transform(p.matrix_world.inverted() @ o.matrix_world)
    n=bpy.data.objects.new('WEB_'+o.name,mesh); scene.collection.objects.link(n); n.parent=p; n.matrix_local=Matrix.Identity(4)
    cat='control_box' if o.name.startswith('CTRLBOX_') else ('cooling_module' if 'LidCooling' in o.name or 'Bowl_Limit' in o.name else 'assembly')
    # Keep rotor pieces separate so the web viewer can animate the fan while
    # still merging the many static cooling parts for a smaller GLB.
    fan_piece = 'fan_120mm_' in o.name and any(token in o.name for token in ('Blade', 'Spindle', 'Rotor hub', 'Hub face disc'))
    key=(p.name,cat,tuple(m.name if m else '' for m in mesh.materials), o.name if fan_piece else '')
    buckets.setdefault(key,[]).append(n)
# Merge same-parent/category/material objects to keep frame rate high.
for (parent,cat,mats,source_name),objects in buckets.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1:bpy.ops.object.join()
    suffix = source_name if source_name else str(len(objects))+'_'+(mats[0] if mats else 'material')
    objects[0].name='SM_'+cat+'_'+suffix
# Explicit open/close animation. These values match the source's evaluated poses.
for n in clones.values():
    n.animation_data_clear()
# local rotation values from source at closed frame 35 and open frame 70
for frame, source_frame in [(1,35),(45,52),(70,70),(90,35)]:
    source.frame_set(source_frame); bpy.context.view_layer.update()
    for key in ['CTRL_Lid_Hinge','CTRL_Latch_Lever_L','CTRL_Latch_Lever_R','CTRL_Top_Carry_Handle']:
        o=control_src[key]; n=clones[key]; n.rotation_mode=o.rotation_mode; n.rotation_euler=o.rotation_euler.copy(); n.keyframe_insert('rotation_euler',frame=frame)
# Make the action easy for AnimationMixer to discover.
for n in clones.values():
    if n.animation_data and n.animation_data.action:
        n.animation_data.action.name='CryoDrive_Open_Close'
scene.frame_set(1)
bpy.context.view_layer.update()
meshes=[o for o in scene.objects if o.type=='MESH']
for o in meshes:o.data.calc_loop_triangles()
pts=[o.matrix_world@Vector(c) for o in meshes for c in o.bound_box]
bounds=[[round(fn(p[i] for p in pts),5) for i in range(3)] for fn in [min,max]]
tris=sum(len(o.data.loop_triangles) for o in meshes)
path=OUT/'model/cooler_33L_control_box_assembly.glb'; path.parent.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_animations=True,export_frame_range=True,export_cameras=False,export_lights=False,export_extras=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6)
report={'source':bpy.data.filepath,'export':path.name,'source_visible_objects':len(originals),'export_meshes':len(meshes),'triangles':tris,'bounds_blender_m':bounds,'bytes':path.stat().st_size,'animation':'CryoDrive_Open_Close (1 closed → 70 open → 90 closed)','opening_degrees':105,'excluded':'hidden objects, references, cutters, studio, old optional retrofit parts'}
(OUT/'model/assembly-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('WEB_EXPORT',json.dumps(report,ensure_ascii=False))
