
import bpy
from pathlib import Path
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
bpy.ops.wm.obj_import(filepath='D:\\营地 3D大赛\\website\\assets\\model\\camp-real.obj')
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        try:
            bpy.ops.object.shade_smooth()
        except Exception:
            pass
bpy.ops.wm.save_as_mainfile(filepath='D:\\营地 3D大赛\\website\\assets\\model\\camp-real.blend')
bpy.ops.export_scene.gltf(filepath='D:\\营地 3D大赛\\website\\assets\\model\\camp-real.glb', export_format='GLB', export_yup=True)
