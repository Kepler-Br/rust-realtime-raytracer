use bevy::core_pipeline::CorePipelinePlugin;
use bevy::DefaultPlugins;
use bevy::diagnostic::DiagnosticsPlugin;
use bevy::input::InputPlugin;
use bevy::log::LogPlugin;
use bevy::prelude::*;
use bevy::scene::ScenePlugin;
use bevy::time::TimePlugin;

#[derive(Component)]
pub struct AsciiPoint(pub char);

#[derive(Resource)]
pub struct AsciiBuffer {
    resolution: UVec2,
    buffer: Vec<char>,
}


impl AsciiBuffer {
    pub fn new(resolution: UVec2) -> Self {
        let total_symbols: usize = (resolution.x * resolution.y) as usize;

        Self {
            resolution,
            buffer: vec![' '; total_symbols],
        }
    }
}

impl AsciiBuffer {
    fn put_point(&mut self, position: UVec2, character: char) {
        if position.x >= self.resolution.x || position.y >= self.resolution.y {
            return;
        }

        let position_1d = position.x + self.resolution.x * position.y;

        self.buffer[position_1d as usize] = character;
    }
}

// System
pub fn put_ascii(query: Query<(&AsciiPoint, &Transform)>, mut buffer: ResMut<AsciiBuffer>) {
    for (ascii, transform) in query.iter() {
        let position_2d = (
            transform.translation.x as u32,
            transform.translation.y as u32,
        )
            .into();

        buffer.put_point(position_2d, ascii.0);
    }

    println!("===========================================");

    for y in 0..buffer.resolution.y {
        print!("|");
        for x in 0..buffer.resolution.x {
            let i = (x + buffer.resolution.x * y) as usize;
            print!("{}", buffer.buffer[i]);
        }
        println!("|");
    }

    buffer.buffer.fill(' ');
}
