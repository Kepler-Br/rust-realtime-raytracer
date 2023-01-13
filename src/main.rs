use std::borrow::BorrowMut;
use std::f32::consts::PI;

use bevy::input::mouse::MouseMotion;
use bevy::math::Vec4Swizzles;
use bevy::prelude::*;
use bevy::render::camera::ScalingMode;
use bevy::render::render_resource::{AddressMode, SamplerDescriptor};
use bevy::sprite::{Material2dPlugin, MaterialMesh2dBundle};
use bevy::window::WindowResized;
use bevy::DefaultPlugins;

use crate::materials::CustomMaterial;
use crate::raymarching_camera::RaymarchingCamera;

mod materials;
mod raymarching_camera;
use rand::Rng;

fn keyboard_input(
    keys: Res<Input<KeyCode>>,
    mut query_cam: Query<&mut RaymarchingCamera>,
    material_query: Query<&mut Handle<CustomMaterial>>,
    mut materials: ResMut<Assets<CustomMaterial>>,
    time: Res<Time>,
) {
    let mut cam = query_cam.iter_mut().next().unwrap();

    if keys.pressed(KeyCode::W) || keys.pressed(KeyCode::S) {
        let forward = cam.view.row(2).xyz();

        if keys.pressed(KeyCode::W) {
            cam.position -= forward * 5.0 * time.delta().as_secs_f32();
        } else {
            cam.position += forward * 5.0 * time.delta().as_secs_f32();
        };
    }

    if keys.pressed(KeyCode::A) || keys.pressed(KeyCode::D) {
        let right = cam.view.row(0).xyz();

        if keys.pressed(KeyCode::A) {
            cam.position -= right * 5.0 * time.delta().as_secs_f32();
        } else {
            cam.position += right * 5.0 * time.delta().as_secs_f32();
        };
    }

    if keys.pressed(KeyCode::Space) || keys.pressed(KeyCode::LControl) {
        let up = cam.view.row(1).xyz();

        if keys.pressed(KeyCode::Space) {
            cam.position += up * 5.0 * time.delta().as_secs_f32();
        } else {
            cam.position -= up * 5.0 * time.delta().as_secs_f32();
        };
    }

    for material_handle in material_query.iter() {
        let mut material = materials.get_mut(material_handle).unwrap();

        material.camera_position = cam.position;
    }
}

fn cursor_moved(
    mut events: EventReader<MouseMotion>,
    material_query: Query<&mut Handle<CustomMaterial>>,
    mut materials: ResMut<Assets<CustomMaterial>>,
    mut query_cam: Query<&mut RaymarchingCamera>,
) {
    for cursor_moved in events.iter() {
        let mut cam = query_cam.iter_mut().next().unwrap();

        cam.rotation.y += cursor_moved.delta.x / 180.0 * PI / 10.0;
        cam.rotation.x += cursor_moved.delta.y / 180.0 * PI / 10.0;

        cam.update_view();

        for material_handle in material_query.iter() {
            let mut material = materials.get_mut(material_handle).unwrap();

            material.inverse_projection_view = cam.inversed_projection_view;
            material.rand_float = rand::random();
        }
    }
}

fn window_resized(
    mut events: EventReader<WindowResized>,
    mut materials: ResMut<Assets<CustomMaterial>>,
    query: Query<&mut Handle<CustomMaterial>>,
    mut query_cam: Query<&mut RaymarchingCamera>,
) {
    for e in events.iter() {
        let aspect_ratio = e.width / e.height;
        let mut cam = query_cam.iter_mut().next().unwrap();

        cam.aspect_ratio = aspect_ratio;
        cam.update_projection();

        for material_handle in query.iter() {
            let mut material = materials.get_mut(material_handle).unwrap();

            material.screen_resolution = Vec2::new(e.width, e.height);
            material.inverse_projection_view = cam.inversed_projection_view;
            material.camera_position = cam.position;
        }
    }
}

fn update_material_rand(
    mut materials: ResMut<Assets<CustomMaterial>>,
    query: Query<&mut Handle<CustomMaterial>>,
) {
    for material_handle in query.iter() {
        let mut material = materials.get_mut(material_handle).unwrap();

        material.rand_float = rand::random();
    }
}
fn setup(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<CustomMaterial>>,
    asset_server: Res<AssetServer>,
    mut images: ResMut<Assets<Image>>,
) {
    let resolution = Vec2::new(800.0, 600.0);

    let r_cam = RaymarchingCamera::new(
        Vec3::new(-3.0, 0.0, 0.0),
        Vec3::new(0.0, 45.0/18.00*PI, 0.0),
        70.0 * PI / 180.0,
        resolution.y / resolution.x,
        20.0,
        30.0,
    );

    let mat = MaterialMesh2dBundle {
        mesh: meshes.add(Mesh::from(shape::Quad::default())).into(),
        material: materials.add(CustomMaterial {
            screen_resolution: resolution,
            rand_float: rand::random(),
            inverse_projection_view: r_cam.inversed_projection_view,
            camera_position: r_cam.position,
            random_texture: Some(asset_server.load("textures/random.png")),
        }),
        ..default()
    };

    // images.get_mut(&mat.material).unwrap().sampler_descriptor = ImageSampler::nearest();

    commands.spawn(mat);
    // commands.insert_resource(ImageSettings {
    //     default_sampler: SamplerDescriptor {
    //         address_mode_u: AddressMode::Repeat,
    //         address_mode_v: AddressMode::Repeat,
    //         address_mode_w: AddressMode::Repeat,
    //         ..Default::default()
    //     },
    // });

    commands.spawn(r_cam);

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
        transform: Transform::from_xyz(0.0, 0.0, 10.0).looking_at(Vec3::ZERO, Vec3::Y),
        ..default()
    });
}

fn main() {
    App::new()
        .add_startup_system(setup)
        .add_plugins(DefaultPlugins)
        .add_system(window_resized)
        .add_system(update_material_rand)
        .add_system(cursor_moved)
        .add_system(keyboard_input)
        .add_plugin(Material2dPlugin::<CustomMaterial>::default())
        .run()
}
