#version 450
#define TABLE_SIZE 9
#define LAMBERTIAN_MATERIALS 3
#define EMISSION_MATERIALS 3
#define SPHERES 1
#define XZ_PLANES 2
#define XY_PLANES 4
#define YZ_PLANES 1
#define LAMBERTIAN_MATERIAL_TYPE 0
#define EMISSION_MATERIAL_TYPE 1
layout (location = 0) in vec2 v_Uv;

layout (location = 0) out vec4 o_Target;
layout (set = 1, binding = 0) uniform CustomMaterial {
    vec2 screenResolution;
    float rand_float;
    mat4 inverseProjectionView;
    vec3 cameraPosition;
};

layout(set = 1, binding = 1) uniform texture2D CustomMaterial_texture;
layout(set = 1, binding = 2) uniform sampler CustomMaterial_sampler;

#import "shaders/ray.frag"
#import "shaders/hit_record.frag"
#import "shaders/sphere.frag"
#import "shaders/xy_plane.frag"
#import "shaders/xz_plane.frag"
#import "shaders/yz_plane.frag"

struct LambertianMaterial {
    vec3 albedo;
};

struct EmissionMaterial {
    vec3 color;
    float power;
};

struct Scene {
    int totalLambertianMaterials;
    int totalEmissionMaterials;
    int totalSpheres;
    int totalXZPlanes;
    int totalXYPlanes;
    int totalYZPlanes;

    LambertianMaterial[LAMBERTIAN_MATERIALS] lambertianMaterials;
    EmissionMaterial[EMISSION_MATERIALS] emissionMaterials;
    Sphere[SPHERES] spheres;
    XyPlane[XY_PLANES] xyPlanes;
    XzPlane[XZ_PLANES] xzPlanes;
    YzPlane[YZ_PLANES] yzPlanes;
};

Scene constructScene() {
    LambertianMaterial[LAMBERTIAN_MATERIALS] lambertianMaterials = LambertianMaterial[](
        LambertianMaterial(vec3(0.5, 0.5, 0.3)),
        LambertianMaterial(vec3(1.0, 0.0, 0.0)),
        LambertianMaterial(vec3(0.0, 1.0, 0.0))
    );
    EmissionMaterial[EMISSION_MATERIALS] emissionMaterials = EmissionMaterial[](
        EmissionMaterial(vec3(1.0, 1.0, 1.0), 5.0),
        EmissionMaterial(vec3(1.0, 1.0, 0.8), 1.0),
        EmissionMaterial(vec3(0.8, 1.0, 1.0), 1.0)
    );
    Sphere[SPHERES] spheres = Sphere[](
        Sphere(vec3(0.0, -(1.0-0.5), 0.0), 0.5, 1, LAMBERTIAN_MATERIAL_TYPE)
    );

    XyPlane[XY_PLANES] xyPlanes = XyPlane[](
        XyPlane(vec2(-1.0, -1.0), vec2(1.0, 1.0),  1.0, 2, LAMBERTIAN_MATERIAL_TYPE),
        XyPlane(vec2(-1.0, -1.0), vec2(1.0, 1.0), -1.0, 1, LAMBERTIAN_MATERIAL_TYPE),

        XyPlane(vec2(-0.9, -0.9), vec2(0.9, 0.9), -(1.0-0.01), 1, EMISSION_MATERIAL_TYPE),
        XyPlane(vec2(-0.9, -0.9), vec2(0.9, 0.9), (1.0-0.01), 2, EMISSION_MATERIAL_TYPE)
    );

    XzPlane[XZ_PLANES] xzPlanes = XzPlane[](
        XzPlane(vec2(-1.0, -1.0), vec2(1.0, 1.0), 1.0,          0, LAMBERTIAN_MATERIAL_TYPE),
//        XzPlane(vec2(-0.9, -0.9), vec2(0.9, 0.9), (1.0-0.01),   0, EMISSION_MATERIAL_TYPE),
        XzPlane(vec2(-1.0, -1.0), vec2(1.0, 1.0), -1.0,         0, LAMBERTIAN_MATERIAL_TYPE)
    );

    YzPlane[YZ_PLANES] yzPlanes = YzPlane[](
        YzPlane(vec2(-1.0, -1.0), vec2(1.0, 1.0), 1.0, 0, LAMBERTIAN_MATERIAL_TYPE)
    );

    return Scene(
        LAMBERTIAN_MATERIALS,
        EMISSION_MATERIALS,
        SPHERES,
        XZ_PLANES,
        XY_PLANES,
        YZ_PLANES,

        lambertianMaterials,
        emissionMaterials,

        spheres,
        xyPlanes,
        xzPlanes,
        yzPlanes
    );
}

vec3 unitHemisphere(vec3 normal) {
    float x = gl_FragCoord.x / screenResolution.x / 2.0;
    float y = gl_FragCoord.y / screenResolution.y / 2.0;
    vec2 uv = vec2(x, y)*5.0+rand_float;

    vec4 outt = texture(sampler2D(CustomMaterial_texture, CustomMaterial_sampler), fract(uv));
    vec3 randSphere = normalize(outt.xyz - 0.5);

    if (dot(randSphere, normal) < 0.0) {
        return -randSphere;
    } else {
        return randSphere;
    }
}

bool lambertianMaterialScatter(LambertianMaterial material,
    Ray ray,
    HitRecord hitRecord,
    out vec3 attenuation,
    out Ray scattered) {

    vec3 correctedNormal;

    if (dot(ray.direction, hitRecord.normal) > 0.0) {
        correctedNormal = -hitRecord.normal;
    } else {
        correctedNormal = hitRecord.normal;
    }

    // Raytracing ray direction bias towards left because of bad random picture
    vec3 scatterDirection = unitHemisphere(correctedNormal);

    attenuation = material.albedo;

    scattered = Ray(hitRecord.hitPoint, scatterDirection);

    return true;
}

bool emissionMaterialScatter(EmissionMaterial material,
    Ray ray,
    HitRecord hitRecord,
    out vec3 attenuation,
    out Ray scattered) {
    attenuation = material.color * material.power;

    return false;
}

vec3 screenToWorld()
{
    // NORMALISED DEVICE SPACE
    float x = gl_FragCoord.x / screenResolution.x - 1.0;
    float y = gl_FragCoord.y / screenResolution.y - 1.0;

    // HOMOGENEOUS SPACE
    vec4 screenPos = vec4(x, -y, -1.0f, 1.0f);

    vec4 worldPos = inverseProjectionView * screenPos;
    return normalize(vec3(worldPos));
}

bool hitScene(Ray ray, float tMin, float tMax, out HitRecord hitRecord, in Scene scene) {
    HitRecord tempHitRecord;
    bool hitAnything = false;
    float closest = tMax;

    for (int i = 0; i < scene.totalSpheres; i++) {
        if (hitSphere(scene.spheres[i], ray, tMin, tMax, tempHitRecord)) {
            if (closest > tempHitRecord.distance) {
                closest = tempHitRecord.distance;

                hitRecord = tempHitRecord;
                hitAnything = true;
            }
        }
    }

    for (int i = 0; i < scene.totalXYPlanes; i++) {
        if (hitXyPlane(scene.xyPlanes[i], ray, tMin, tMax, tempHitRecord)) {
            if (closest > tempHitRecord.distance) {
                closest = tempHitRecord.distance;

                hitRecord = tempHitRecord;
                hitAnything = true;
            }
        }
    }

    for (int i = 0; i < scene.totalXZPlanes; i++) {
        if (hitXzPlane(scene.xzPlanes[i], ray, tMin, tMax, tempHitRecord)) {
            if (closest > tempHitRecord.distance) {
                closest = tempHitRecord.distance;

                hitRecord = tempHitRecord;
                hitAnything = true;
            }
        }
    }

    for (int i = 0; i < scene.totalYZPlanes; i++) {
        if (hitYzPlane(scene.yzPlanes[i], ray, tMin, tMax, tempHitRecord)) {
            if (closest > tempHitRecord.distance) {
                closest = tempHitRecord.distance;

                hitRecord = tempHitRecord;
                hitAnything = true;
            }
        }
    }

    return hitAnything;
}



void main() {
    Scene scene = constructScene();

    vec3 direction = screenToWorld();

    Ray ray = Ray(
        cameraPosition,
        direction
    );

    float tMin = 0.0001;
    float tMax = 99999.0;

    vec3 albedo = vec3(1.0);
    float closest = tMax;
    bool absorbed = false;
    vec3 worldColor = vec3(0.0);
    for (int bounceNum = 0; bounceNum < 2; bounceNum++) {
        HitRecord hitRecord;
        if (hitScene(ray, tMin, tMax, hitRecord, scene)) {
            if (hitRecord.materialType == LAMBERTIAN_MATERIAL_TYPE) {
                LambertianMaterial material = scene.lambertianMaterials[hitRecord.materialIdx];
                vec3 attenuation;
                Ray scatteredRay;

                lambertianMaterialScatter(material, ray, hitRecord, attenuation, scatteredRay);
                hitRecord.normal = -hitRecord.normal;

                ray = scatteredRay;
                albedo *= attenuation;
            } else if (hitRecord.materialType == EMISSION_MATERIAL_TYPE) {
                EmissionMaterial material = scene.emissionMaterials[hitRecord.materialIdx];
                vec3 attenuation;
                Ray scatteredRay;

                emissionMaterialScatter(material, ray, hitRecord, attenuation, scatteredRay);

                albedo *= attenuation;

                absorbed = true;
            }
        } else {
            albedo *= worldColor;
            absorbed = true;
            break;
        }
    }

    if (!absorbed) {
        albedo = albedo * 0.0;
    }

    o_Target = vec4(
        albedo,
        1.0);
}
