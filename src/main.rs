use bevy::render::camera::ScalingMode;
use bevy::sprite::{Material2d, Material2dPlugin, MaterialMesh2dBundle};
use bevy::window::WindowResized;
use bevy::DefaultPlugins;
use bevy::{
    prelude::*,
    reflect::TypeUuid,
    render::render_resource::{AsBindGroup, ShaderRef},
};

use crate::components::{space_object_gravity_system, SpaceObject};
use crate::identity_project_matrix::IdentityProjectionMatrix;

mod ascii;
mod components;
mod identity_project_matrix;

// pub struct HelloPlugin;
//
// impl Plugin for HelloPlugin {
//     fn build(&self, app: &mut App) {
//         app.insert_resource(AsciiBuffer::new((40, 10).into()))
//             .add_system(put_ascii);
//     }
// }

// fn spawn_ascii_points(mut commands: Commands) {
//     let body1 = (
//         Transform::from_xyz(2.0, 1.0, 0.0),
//         AsciiPoint('*'),
//         SpaceObject(Vec3::new(0.1, 0.06, 0.0), 1.0),
//     );
//
//     let body2 = (
//         Transform::from_xyz(10.0, 7.0, 0.0),
//         AsciiPoint('*'),
//         SpaceObject(Vec3::new(0.0, 0.0, 0.0), 1.0),
//     );
//
//     commands.spawn(body1);
//     commands.spawn(body2);
// }
fn resize_notificator(
    mut events: EventReader<WindowResized>,
    mut materials: ResMut<Assets<CustomMaterial>>,
    query: Query<&mut Handle<CustomMaterial>>,
) {
    // let mut reader = resize_event.get_reader();
    for e in events.iter() {

        println!("width = {} height = {}", e.width, e.height);
    }
}
fn setup(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<CustomMaterial>>,
) {
    // cube
    // commands.spawn(MaterialMeshBundle {
    //     mesh: meshes.add(Mesh::from(shape::Cube { size: 1.0 })),
    //     transform: Transform::from_xyz(0.0, 0.5, 0.0),
    //     material: materials.add(CustomMaterial {
    //         screen_resolution: Vec2::new(800.0, 600.0),
    //     }),
    //     ..default()
    // });

    commands.spawn(MaterialMesh2dBundle {
        mesh: meshes.add(Mesh::from(shape::Quad::default())).into(),
        material: materials.add(CustomMaterial {
            screen_resolution: Vec2::new(800.0, 600.0),
        }),
        ..default()
    });

    // camera
    commands.spawn(Camera2dBundle {
        projection: OrthographicProjection {
            scaling_mode: ScalingMode::None,
            left: -0.5,
            right: 0.5,
            top: 0.5,
            bottom: -0.5,
            ..default()
        },
        transform: Transform::from_xyz(0.0, 0.0, 1.0).looking_at(Vec3::ZERO, Vec3::Y),
        ..default()
    });
}

fn main() {
    App::new()
        .add_startup_system(setup)
        .add_plugins(DefaultPlugins)
        .add_system(space_object_gravity_system)
        // .add_system(material_update)
        .add_system(resize_notificator)
        .add_plugin(Material2dPlugin::<CustomMaterial>::default())
        .run()
}

fn material_update(
    mut materials: ResMut<Assets<CustomMaterial>>,
    query: Query<&mut Handle<CustomMaterial>>,
) {
    for material_handle in query.iter() {
        let mut material = materials.get_mut(material_handle).unwrap();

        material.screen_resolution = Vec2::new(800.0, 600.0);
    }
}

/// The Material trait is very configurable, but comes with sensible defaults for all methods.
/// You only need to implement functions for features that need non-default behavior. See the Material api docs for details!
impl Material2d for CustomMaterial {
    fn fragment_shader() -> ShaderRef {
        "shaders/custom_material.wgsl".into()
    }

    // fn alpha_mode(&self) -> AlphaMode {
    //     self.alpha_mode
    // }
}

// This is the struct that will be passed to your shader
#[derive(AsBindGroup, TypeUuid, Debug, Clone)]
#[uuid = "f690fdae-d598-45ab-8225-97e2a3f056e0"]
pub struct CustomMaterial {
    #[uniform(0)]
    screen_resolution: Vec2,
    // alpha_mode: AlphaMode,
}
