use std::borrow::{Borrow, BorrowMut};
use std::cell::Cell;

use bevy::core_pipeline::CorePipelinePlugin;
use bevy::diagnostic::DiagnosticsPlugin;
use bevy::input::InputPlugin;
use bevy::log::LogPlugin;
use bevy::prelude::*;
use bevy::scene::ScenePlugin;
use bevy::time::TimePlugin;
use bevy::DefaultPlugins;

use crate::ascii::AsciiPoint;

#[derive(Component)]
pub struct Name(pub String);

#[derive(Component)]
pub struct SpaceObject(
    // Velocity
    pub Vec3,
    // Mass
    pub f32,
);

// Systems

// pub fn space_object_velocity_system(mut query: Query<(&SpaceObject, &mut Transform)>) {
//     for (ent, mut e) in query.iter_mut() {
//         e.translation += ent.0 / ent.1;
//     }
// }

pub fn space_object_gravity_system(mut query: Query<(&mut SpaceObject, &mut Transform)>) {
    let mut v = Vec::new();
    const GRAV_CONST: f32 = 6.67430 * 0.0001;

    for q in query.iter_mut() {
        v.push(q);
    }

    for i in 0..v.len() {
        for j in 0..v.len() {
            if i == j {
                continue;
            }
            let mass1 = &v[i].0 .1;
            let mass2 = &v[j].0 .1;

            let tr1 = &v[i].1;
            let tr2 = &v[j].1;

            // let dist = tr1.translation.distance(tr2.translation);
            let direction = (tr1.translation - tr2.translation).normalize();
            let dist_squared = tr1.translation.distance_squared(tr2.translation);

            let result = -GRAV_CONST * (mass2) / (dist_squared) * direction;

            // println!("{}; {}; {}", tr1.translation, tr2.translation, direction);

            // v[i].1.translation += direction * result;
            v[i].0 .0 += result;
            // v[i].1.translation = Vec3::new(0.0, 0.5, 0.0);
        }

        for e in v.iter_mut() {
            let (so, tr) = e;

            tr.translation += so.0;
        }
    }
}
