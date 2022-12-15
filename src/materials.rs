use bevy::{
    prelude::*,
    reflect::TypeUuid,
    render::render_resource::{AsBindGroup, ShaderRef},
};
use bevy::pbr::{MaterialPipeline, MaterialPipelineKey};
use bevy::render::mesh::MeshVertexBufferLayout;
use bevy::render::render_resource::{RenderPipelineDescriptor, SpecializedMeshPipelineError};
use bevy::sprite::{Material2d, Material2dKey};

// This is the struct that will be passed to your shader
#[derive(AsBindGroup, TypeUuid, Debug, Clone)]
#[uuid = "f690fdae-d598-45ab-8225-97e2a3f056e0"]
pub struct CustomMaterial {
    #[uniform(0)]
    pub screen_resolution: Vec2,
    #[uniform(0)]
    pub inverse_projection_view: Mat4,
    #[uniform(0)]
    pub camera_position: Vec3,
    // alpha_mode: AlphaMode,
}

/// The Material trait is very configurable, but comes with sensible defaults for all methods.
/// You only need to implement functions for features that need non-default behavior. See the Material api docs for details!
// impl Material2d for CustomMaterial {
//     fn fragment_shader() -> ShaderRef {
//         "shaders/raytracing.wgsl".into()
//     }
//
//     // fn alpha_mode(&self) -> AlphaMode {
//     //     self.alpha_mode
//     // }
// }

impl Material2d for CustomMaterial {
    fn fragment_shader() -> ShaderRef {
        "shaders/raytracing.frag".into()
    }
    fn vertex_shader() -> ShaderRef {
        "shaders/vert.vert".into()
    }
    fn specialize(
        descriptor: &mut RenderPipelineDescriptor,
        _layout: &MeshVertexBufferLayout,
        _key: Material2dKey<Self>,
    ) -> Result<(), SpecializedMeshPipelineError> {
        descriptor.vertex.entry_point = "main".into();
        descriptor.fragment.as_mut().unwrap().entry_point = "main".into();
        Ok(())
    }
}
