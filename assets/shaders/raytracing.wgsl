// Order is IMPORTANT
#import "shaders/ray.wgsl"
#import "shaders/hit_record.wgsl"
#import "shaders/sphere.wgsl"

struct UniformIn {
    screen_resolution: vec2<f32>,
    inverse_projection_view: mat4x4<f32>,
    camera_position: vec3<f32>,
};

struct VertexOutput {
    @builtin(position)
    position: vec4<f32>,
};


@group(1) @binding(0)
var<uniform> uniform_in: UniformIn;

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
    let TOTAL_SPHERES: i32 = 2;
    let spheres = array<Sphere, 2>(
        Sphere(vec3<f32>(-10.0, 1.0, 0.0), 1.0),
        Sphere(vec3<f32>(-10.0, -5.0, 0.0), 5.0),
    );
    let direction = screen_to_world(in.position);

    let ray: Ray = Ray(
        uniform_in.camera_position,
        direction,
    );

    let t_min = 0.0001;
    let t_max = 9999.0;


    var hit_record = default_hit_record();

    for (var i: i32 = 0; i < 2; i+=1) {
        if (i == 0){
            let sphere: Sphere = spheres[0];
            let new_hit_record = hit_sphere(sphere, ray, t_min, t_max, hit_record);

            if (new_hit_record.hit) {
                hit_record = new_hit_record;
            }
        }
        if (i == 1) {
            let sphere: Sphere = spheres[1];
            let new_hit_record = hit_sphere(sphere, ray, t_min, t_max, hit_record);

            if (new_hit_record.hit) {
                hit_record = new_hit_record;
            }
        }
//        let new_hit_record = hit_sphere(sphere, ray, t_min, t_max, hit_record);
//
//        if (new_hit_record.hit) {
//            hit_record = new_hit_record;
//        }
    }



//    let frag_position = in.position;
//    let uv = get_uv(frag_position);
//    let cross =
//        max(
//            step(fract(clamp(uv.y, -0.9, 0.9)), 0.005),
//            step(fract(clamp(uv.x, -0.9, 0.9)), 0.005)
//        );

    if (hit_record.hit == true) {
        return vec4(
                direction/2.0,
                1.0);
    }
    return vec4(
            direction,
            1.0);

//    return vec4(0.5, 0.5, 1.0, 1.0);
//    return vec4(material.screen_resolution.x, material.screen_resolution.y, 0.0, 1.0);
//    let uv = vec2(in.position.x/uniform_in.screen_resolution.x, in.position.y/uniform_in.screen_resolution.y);
//    return vec4(uv, 0.0, 1.0);
}
