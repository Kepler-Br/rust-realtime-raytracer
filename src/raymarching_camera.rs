use bevy::core::Zeroable;
use bevy::prelude::*;

#[derive(Component)]
pub struct RaymarchingCamera {
    pub position: Vec3,
    pub rotation: Vec3,
    pub projection: Mat4,
    pub view: Mat4,
    pub inversed_projection_view: Mat4,
    pub fov: f32,
    pub aspect_ratio: f32,
    pub near: f32,
    pub far: f32,
}

impl RaymarchingCamera {
    fn calc_perspective_mat(fov: f32, aspect_ratio: f32, near: f32, far: f32) -> Mat4 {
        Mat4::perspective_infinite_reverse_rh(fov, aspect_ratio, near)
    }

    fn calc_view(rotation: Vec3) -> Mat4 {
        Mat4::from_rotation_translation(
            Quat::from_euler(EulerRot::XYZ, rotation.x, rotation.y, rotation.z),
            Vec3::zeroed(),
        )
    }

    fn calc_inverse(view: Mat4, projection: Mat4) -> Mat4 {
        (projection*view).inverse()
    }

    pub fn new(position: Vec3, rotation: Vec3, fov: f32, aspect_ratio: f32, near: f32, far: f32) -> Self {
        let projection = Self::calc_perspective_mat(fov, aspect_ratio, near, far);
        let view = Self::calc_view(rotation);
        let inversed_projection_view = (projection * view).inverse();

        Self {
            position,
            rotation,
            projection,
            view,
            inversed_projection_view,
            fov,
            aspect_ratio,
            near,
            far,
        }
    }

    pub fn update_projection(&mut self) {
        self.projection = Self::calc_perspective_mat(self.fov, self.aspect_ratio, self.near, self.far);
        self.inversed_projection_view = Self::calc_inverse(self.view, self.projection);
    }

    pub fn update_view(&mut self) {
        self.view = Self::calc_view(self.rotation);
        self.inversed_projection_view = Self::calc_inverse(self.view, self.projection);
    }
}
