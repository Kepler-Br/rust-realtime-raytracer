use bevy::core_pipeline::tonemapping::Tonemapping;
use bevy::math::Mat4;
use bevy::render::camera::ScalingMode;
use bevy::render::camera::{Camera, CameraProjection};
use bevy::render::primitives::Frustum;
use bevy::render::view::VisibleEntities;
use bevy::DefaultPlugins;
use bevy::{
    prelude::*,
    reflect::TypeUuid,
    render::render_resource::{AsBindGroup, ShaderRef},
};

#[derive(Component, Debug, Clone, Reflect)]
#[reflect(Component, Default)]
pub struct IdentityProjectionMatrix {}

impl CameraProjection for IdentityProjectionMatrix {
    fn get_projection_matrix(&self) -> Mat4 {
        Mat4::default()
    }

    fn update(&mut self, width: f32, height: f32) {}

    fn far(&self) -> f32 {
        1.0
    }
}

impl Default for IdentityProjectionMatrix {
    fn default() -> Self {
        Self {}
    }
}
