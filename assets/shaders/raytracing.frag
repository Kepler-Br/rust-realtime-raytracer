#version 450
#define TABLE_SIZE 9
#define MATERIALS 2
#define SPHERES 2
layout (location = 0) in vec2 v_Uv;

layout (location = 0) out vec4 o_Target;
layout (set = 1, binding = 0) uniform CustomMaterial {
    vec2 screen_resolution;
    mat4 inverse_projection_view;
    vec3 camera_position;
};

layout(set = 1, binding = 1) uniform texture2D CustomMaterial_texture;
layout(set = 1, binding = 2) uniform sampler CustomMaterial_sampler;

#import "shaders/ray.frag"
#import "shaders/hit_record.frag"
#import "shaders/sphere.frag"

struct Material {
    vec3 albedo;
};

vec3 unit_hemisphere(vec3 normal) {
    float x = gl_FragCoord.x / screen_resolution.x/2.0;
    float y = gl_FragCoord.y / screen_resolution.y/2.0;
    vec2 uv = vec2(x, y);

    vec4 outt = texture(sampler2D(CustomMaterial_texture, CustomMaterial_sampler), uv);
    vec3 rand_sphere = outt.xyz * 2.0 - 1.0;

    if (dot(rand_sphere, normal) < 0.0) {
        return -rand_sphere;
    } else {
        return rand_sphere;
    }
}

bool material_scatter(Material material, Ray ray, HitRecord hit_record, out vec3 attenuation, out Ray scattered) {
    vec3 corrected_normal;

    if (dot(ray.direction, hit_record.normal) > 0.0) {
        corrected_normal = -hit_record.normal;
    } else {
        corrected_normal = hit_record.normal;
    }

    vec3 scatter_direction = unit_hemisphere(corrected_normal);

    attenuation = material.albedo;

    scattered = Ray(hit_record.hit_point, normalize(scatter_direction));

    return true;
}

vec3 screen_to_world()
{
    // NORMALISED DEVICE SPACE
    float x = gl_FragCoord.x / screen_resolution.x - 1.0;
    float y = gl_FragCoord.y / screen_resolution.y - 1.0;

    // HOMOGENEOUS SPACE
    vec4 screenPos = vec4(x, -y, -1.0f, 1.0f);

    vec4 worldPos = inverse_projection_view * screenPos;
    return normalize(vec3(worldPos));
}

bool hit_scene(Ray ray, float t_min, float t_max, out HitRecord hit_record, in Sphere spheres[SPHERES]) {
    HitRecord temp_hit_record = default_hit_record();
    bool hit_anything = false;
    float closest = t_max;

    for (int i = 0; i < SPHERES; i++) {
        if (hit_sphere(spheres[i], ray, t_min, t_max, temp_hit_record)) {
            hit_anything = true;

            if (closest > temp_hit_record.distance) {
                closest = temp_hit_record.distance;

                hit_record = temp_hit_record;
            }
        }
    }

    return hit_anything;
}

void main() {
    Material[MATERIALS] materials = Material[](
    Material(vec3(1.0, 0.0, 1.0)),
    Material(vec3(1.0, 0.0, 0.0))
    );

    Sphere[SPHERES] spheres = Sphere[](
    Sphere(vec3(0.0, 1.0, -10.0), 1.0, 1),
    Sphere(vec3(0.0, -10.0, -10.0), 10.0, 0)
    );

    vec3 direction = screen_to_world();


    Ray ray = Ray(
    camera_position,
    direction
    );

    float t_min = 0.001;
    float t_max = 99999.0;

    vec3 albedo = vec3(1.0);
    float closest = t_max;
    HitRecord hit_record;
    //  bool hit_scene(Ray ray, float t_min, float t_max, out HitRecord hit_record, in Material materials[MATERIALS], in Sphere spheres[SPHERES]) {
    for (int bounce_num = 0; bounce_num < 1; bounce_num++) {
        if (hit_scene(ray, t_min, t_max, hit_record, spheres)) {
            Material material = materials[hit_record.material_idx];
            vec3 attenuation;
            Ray scattered;

            material_scatter(material, ray, hit_record, attenuation, scattered);

            ray = scattered;
            albedo = hit_record.normal;
//            albedo *= attenuation;
        } else {
            albedo = vec3(0.5);
            break;
        }
    }

    o_Target = vec4(
    albedo,
    1.0);
}
