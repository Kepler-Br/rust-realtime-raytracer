struct UniformIn {
    screen_resolution: vec2<f32>,
    inverse_projection_view: mat4x4<f32>,
    camera_position: vec3<f32>,
};

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
};

@group(1) @binding(0)
var<uniform> uniform_in: UniformIn;

fn sphere_sdf(scene_point: vec3<f32>, sphere_position: vec3<f32>, radius: f32) -> f32 {
    return length(scene_point - sphere_position) - radius;
}

fn scene_sdf(scene_point: vec3<f32>) -> f32 {
    return sphere_sdf(scene_point, vec3<f32>(-10.0, 0.0, 0.0), 0.9);
}

fn march(source_point: vec3<f32>,
         direction: vec3<f32>,
         max_steps: i32,
         min_hit_distance: f32,
         max_dist: f32) -> f32 {
    var distance_marched: f32 = 0.0;

    for (var i: i32 = 0; i < max_steps; i+=1) {
        let current_position = source_point + direction * distance_marched;

        let scene_distance = scene_sdf(current_position);

        distance_marched += scene_distance;

        if (scene_distance < min_hit_distance) {
            break;
        }

        if (distance_marched > max_dist) {
            break;
        }
    }

    return distance_marched;
}

fn get_uv(frag_position: vec4<f32>) -> vec2<f32> {
    return vec2(frag_position.x/uniform_in.screen_resolution.x, frag_position.y/uniform_in.screen_resolution.y) - 1.0;
}

fn screen_to_world(frag_position: vec4<f32>) -> vec3<f32> {
    let uv = get_uv(frag_position);
    let screen_pos = vec4<f32>(uv.x, -uv.y, -1.0, 1.0);
    let world_pos = uniform_in.inverse_projection_view*screen_pos;

    return normalize(world_pos.xyz);
}



@fragment
fn fragment(
    #import bevy_pbr::mesh_vertex_output
    in: VertexOutput,
) -> @location(0) vec4<f32> {

    let direction = screen_to_world(in.position);
    let max_steps = 100;
    let max_dist = 100.0;
    let min_dist = 0.001;

    let distance = march(uniform_in.camera_position, direction, max_steps, min_dist, max_dist);
//    let distance = length(distance_vec3);
    var color: vec4<f32> = vec4(1.0);

    if (distance < max_dist) {
        color = vec4(0.1, 0.1, 0.1, 1.0);
    }

    if (distance > max_dist) {
        let normalized = direction.xyz + 1.0 / 2.0;


        color = vec4(
            vec3(
            max(
                step(fract(normalized.x*20.0), 0.008),
                step(fract(normalized.y*20.0), 0.008)
                )),
            1.0);
    }

    let frag_position = in.position;
    let uv = get_uv(frag_position);
    let cross =
        max(
            step(fract(clamp(uv.y, -0.9, 0.9)), 0.005),
            step(fract(clamp(uv.x, -0.9, 0.9)), 0.005)
        );


    return vec4(
        max(vec3(cross), color.xyz),
        1.0);

//    return vec4(0.5, 0.5, 1.0, 1.0);
//    return vec4(material.screen_resolution.x, material.screen_resolution.y, 0.0, 1.0);
//    let uv = vec2(in.position.x/uniform_in.screen_resolution.x, in.position.y/uniform_in.screen_resolution.y);
//    return vec4(uv, 0.0, 1.0);
}
