#version 450
#define TABLE_SIZE 9
#define LAMBERTIAN_MATERIALS 3
#define EMISSION_MATERIALS 3
#define REFLECTIVE_MATERIALS 1
#define REFRACTIVE_MATERIALS 1
#define SPHERES 1
#define XZ_PLANES 2
#define XY_PLANES 4
#define YZ_PLANES 1
#define LAMBERTIAN_MATERIAL_TYPE 0
#define EMISSION_MATERIAL_TYPE 1
#define REFLECTIVE_MATERIAL_TYPE 2
#define REFRACTIVE_MATERIAL_TYPE 3
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

struct ReflectiveMaterial {
    vec3 color;
    float reflectiveness;
};

struct RefractiveMaterial {
    vec3 color;
    float indexOfRefraction;
};

struct Scene {
    int totalLambertianMaterials;
    int totalEmissionMaterials;
    int totalReflectiveMaterials;
    int totalRefractiveMaterials;
    int totalSpheres;
    int totalXZPlanes;
    int totalXYPlanes;
    int totalYZPlanes;

    LambertianMaterial[LAMBERTIAN_MATERIALS] lambertianMaterials;
    EmissionMaterial[EMISSION_MATERIALS] emissionMaterials;
    ReflectiveMaterial[REFLECTIVE_MATERIALS] reflectiveMaterials;
    RefractiveMaterial[REFRACTIVE_MATERIALS] refractiveMaterials;
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

    ReflectiveMaterial[REFLECTIVE_MATERIALS] reflectiveMaterials = ReflectiveMaterial[](
        ReflectiveMaterial(vec3(1.0, 1.0, 1.0), 90.1)
    );

    RefractiveMaterial[REFRACTIVE_MATERIALS] refractiveMaterials = RefractiveMaterial[](
        RefractiveMaterial(vec3(1.0, 1.0, 1.0), 1.0)
    );

    EmissionMaterial[EMISSION_MATERIALS] emissionMaterials = EmissionMaterial[](
        EmissionMaterial(vec3(1.0, 1.0, 1.0), 5.0),
        EmissionMaterial(vec3(1.0, 1.0, 0.8), 1.0),
        EmissionMaterial(vec3(0.8, 1.0, 1.0), 1.0)
    );

    Sphere[SPHERES] spheres = Sphere[](
        Sphere(vec3(0.0, -(1.0-0.5), 0.0), 0.5, 0, REFRACTIVE_MATERIAL_TYPE)
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
        YzPlane(vec2(-1.0, -1.0), vec2(1.0, 1.0), 1.0, 0, REFLECTIVE_MATERIAL_TYPE)
    );

    return Scene(
        LAMBERTIAN_MATERIALS,
        EMISSION_MATERIALS,
        REFLECTIVE_MATERIALS,
        REFRACTIVE_MATERIALS,

        SPHERES,
        XZ_PLANES,
        XY_PLANES,
        YZ_PLANES,

        lambertianMaterials,
        emissionMaterials,
        reflectiveMaterials,
        refractiveMaterials,

        spheres,
        xyPlanes,
        xzPlanes,
        yzPlanes
    );
}

float randCallCount = 1.0;

vec3 unitHemisphere(vec3 normal) {
    float x = gl_FragCoord.x / screenResolution.x / 2.0;
    float y = gl_FragCoord.y / screenResolution.y / 2.0;
    randCallCount *= 1.7465321;
    vec2 uv = vec2(x, y)*5.0+rand_float+randCallCount;


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
//fn refract(uv: &Vec3, n: &Vec3, etai_over_etat: f32) -> Vec3 {
//    let cos_theta = f32::min(Vec3::dot(&-uv, n), 1.0);
//    let r_out_perp = etai_over_etat * (uv + cos_theta * n);
//    let r_out_parallel = -f32::sqrt(f32::abs(1.0 - r_out_perp.magnitude_squared())) * n;
//
//    return r_out_perp + r_out_parallel;
//}
vec3 refract_my(vec3 uv, vec3 n, float etaiOverAtat) {
    float cosTheta = min(dot(-uv, n), 1.0);
    vec3 rOutPerp = etaiOverAtat * (uv + cosTheta * n);
    vec3 rOutParallel = -sqrt(abs(1.0 - length(rOutPerp)*length(rOutPerp))) * n;

    return rOutPerp + rOutParallel;
}

bool refractiveMaterialScatter(RefractiveMaterial material,
    Ray ray,
    HitRecord hitRecord,
    out vec3 attenuation,
    out Ray scattered) {
    float refractionRatio;

    if (hitRecord.isFrontFace) {
        refractionRatio = 1.0 / material.indexOfRefraction;
    } else{
        refractionRatio = material.indexOfRefraction;
    }
//        let refraction_ratio = if !hit_record.get_is_front_face() {
    //            1.0 / self.index_of_refraction
    //        } else {
    //            self.index_of_refraction
    //        };
    vec3 unitDirection = ray.direction;
    vec3 refracted = refract_my(unitDirection, hitRecord.normal, refractionRatio);
    //        let unit_direction = ray.get_direction();
    //        let refracted = refract(unit_direction, hit_record.get_normal(), refraction_ratio);
    attenuation = material.color;
    //        *attenuation = self.albedo;
    if (0 > 0.85) {
        scattered = Ray(
            hitRecord.hitPoint,
            reflect(ray.direction, hitRecord.normal)
        );
    } else {
        scattered = Ray(
            hitRecord.hitPoint,
            refracted
        );
    }

    return true;
    //        if RefCell::borrow_mut(&self.rand_generator).uniform() > 0.85 {
    //            *scattered = Ray::new(
    //                *hit_record.get_point(),
    //                reflect_vec(ray.get_direction(), hit_record.get_normal()),
    //            );
    //        } else {
    //            *scattered = Ray::new(*hit_record.get_point(), refracted);
    //        }
    //
    //        return true;
}

bool reflectiveMaterialScatter(ReflectiveMaterial material,
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
    //         let corrected_normal = if Vec3::dot(ray.get_direction(), hit_record.get_normal()) > 0.0 {
    //            -*hit_record.get_normal()
    //        } else {
    //            *hit_record.get_normal()
    //        };
    vec3 reflection = reflect(ray.direction, correctedNormal);
    vec3 target = unitHemisphere(correctedNormal);

    vec3 scatterDirection = normalize(target + reflection * material.reflectiveness);

    scattered = Ray(hitRecord.hitPoint, scatterDirection);
    attenuation = material.color;

    return true;

    //        let reflection = reflect_vec(ray.get_direction(), &corrected_normal);
    //        let target = RefCell::borrow_mut(&self.rand_generator).unit_hemisphere(&corrected_normal);
    //
    //        let scatter_direction = (target + reflection * self.reflectiveness).normalize();
    //        *scattered = Ray::new(*hit_record.get_point(), scatter_direction);
    //        *attenuation = self.get_attenuation();
    //
    //        return true;
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
    vec3 worldColor = vec3(0.01);
    for (int bounceNum = 0; bounceNum < 30; bounceNum++) {
        HitRecord hitRecord;
        if (hitScene(ray, tMin, tMax, hitRecord, scene)) {
            vec3 attenuation;
            Ray scatteredRay;
            if (hitRecord.materialType == LAMBERTIAN_MATERIAL_TYPE) {
                LambertianMaterial material = scene.lambertianMaterials[hitRecord.materialIdx];

                lambertianMaterialScatter(material, ray, hitRecord, attenuation, scatteredRay);
                hitRecord.normal = -hitRecord.normal;

                ray = scatteredRay;
                albedo *= attenuation;
            } else if (hitRecord.materialType == EMISSION_MATERIAL_TYPE) {
                EmissionMaterial material = scene.emissionMaterials[hitRecord.materialIdx];

                emissionMaterialScatter(material, ray, hitRecord, attenuation, scatteredRay);

                albedo *= attenuation;

                absorbed = true;
            } else if (hitRecord.materialType == REFLECTIVE_MATERIAL_TYPE) {
                ReflectiveMaterial material = scene.reflectiveMaterials[hitRecord.materialIdx];

                reflectiveMaterialScatter(material, ray, hitRecord, attenuation, scatteredRay);

                ray = scatteredRay;
                albedo *= attenuation;
            } else if (hitRecord.materialType == REFRACTIVE_MATERIAL_TYPE) {
                RefractiveMaterial material = scene.refractiveMaterials[hitRecord.materialIdx];

                refractiveMaterialScatter(material, ray, hitRecord, attenuation, scatteredRay);

                ray = scatteredRay;
                albedo *= attenuation;
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
