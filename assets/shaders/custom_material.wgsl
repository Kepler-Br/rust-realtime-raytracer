struct CustomMaterial {
    screen_resolution: vec2<f32>,
};

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
};

@group(1) @binding(0)
var<uniform> material: CustomMaterial;
//@group(1) @binding(2)
//var base_color_sampler: sampler;

@fragment
fn fragment(
    #import bevy_pbr::mesh_vertex_output
    in: VertexOutput,
) -> @location(0) vec4<f32> {

    let uv = vec2(in.position.x/material.screen_resolution.x, in.position.y/material.screen_resolution.y);

//    return vec4(0.5, 0.5, 1.0, 1.0);
//    return vec4(material.screen_resolution.x, material.screen_resolution.y, 0.0, 1.0);
    return vec4(uv.xy/10.0, 0.0, 1.0);
}
