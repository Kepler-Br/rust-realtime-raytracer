#version 450
layout(location = 0) in vec2 v_Uv;

layout(location = 0) out vec4 o_Target;
layout(set=1, binding = 0) uniform CustomMaterial {
    vec2 screen_resolution;
    mat4 inverse_projection_view;
    vec3 camera_position;
};

#import "shaders/ray.frag"
#import "shaders/hit_record.frag"
#import "shaders/sphere.frag"

struct Material {
    vec3 albedo;
};

vec3 unit_hemisphere(vec3 normal, vec3[] random_table, int table_size, int seed) {
    vec3 rand_sphere = random_table[seed * 42323 % table_size];

    if (dot(rand_sphere, normal) > 0.0) {
        return rand_sphere;
    } else {
        return -random_sphere;
    }
}

vec3 material_scatter(
    Ray ray, HitRecord hit_record, out vec3 attenuation, out Ray scattered, vec3[] random_table, int table_size, int seed) {
    vec3 corrected_normal;

    if (dot(ray.direction, hit_record.normal) > 0.0) {
        corrected_normal = -hit_record.normal;
    } else {
        corrected_normal = hit_record.normal;
    }

    vec3 target = unit_hemisphere();

    //        let vec = self.unit_sphere();
    //
    //        return if Vec3::dot(&vec, normal) > 0.0 {
    //            vec
    //        } else {
    //            -vec
    //        };
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

void main() {
    int table_size = 10;
    vec3[10] random_table = vec3[](
    vec3(0.5899, 0.2031, 0.412), vec3(0.3294, 0.5736, 0.4213), vec3(0.03949, 0.1774, 0.666), vec3(0.1883, 0.06493, 0.5508), vec3(0.1685, 0.7326, 0.458),
    vec3(0.1614, 0.1179, 0.8803), vec3(0.09585, 0.4914, 0.2236), vec3(0.2391, 0.3019, 0.2581), vec3(0.06951, 0.7236, 0.335), vec3(0.5408, 0.4961, 0.3179)
    );

    vec3 arr[2] = vec3[](
    vec3(1.0),
    vec3(0.5)
    );


    Material[2] materials = Material[](
    Material(vec3(1.0, 1.0, 1.0)),
    Material(vec3(1.0, 0.0, 0.0))
    );

    Sphere[2] spheres =  Sphere[](
    Sphere(vec3(-10.0, 1.0, 0.0), 1.0, 1),
    Sphere(vec3(-10.0, -10.0, 0.0), 10.0, 0)
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

    for (int bounce_num = 0; bounce_num < 2; bounce_num++) {
        HitRecord hit_record = default_hit_record();
        Material material;
        bool hit = false;

        for (int i = 0; i < 2; i++) {
            Sphere sphere = spheres[i];
            HitRecord new_hit_record = hit_sphere(sphere, ray, t_min, t_max, hit_record);

            if (new_hit_record.hit && closest > new_hit_record.distance) {
                closest = new_hit_record.distance;
                hit_record = new_hit_record;
                material = materials[sphere.material_idx];
                hit = true;
            }
        }

        if (!hit && bounce_num == 0) {
            albedo = vec3(0.1);
            break;
        } else if (!hit) {
            albedo *= vec3(0.1);
            break;
        }

        vec3 new_direction = normalize(hit_record.normal + random_table[int(direction * 10.0)%table_size]/50.0);

        ray = Ray(hit_record.hit_point, new_direction);
        //        ray = Ray(hit_record.hit_point, hit_record.normal);

        albedo *= material.albedo;
    }
    //    if (hit) {
    o_Target= vec4(
    albedo,
    1.0);
    //    }
    //    else {
    //        o_Target= vec4(
    //        vec3(0.01),
    //        1.0);
    //    }

}
