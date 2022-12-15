struct Sphere {
    center: vec3<f32>,
    radius: f32,
}

fn hit_sphere(sphere: Sphere, ray: Ray, t_min: f32, t_max: f32, record: HitRecord) -> HitRecord {
    let oc: vec3<f32> = ray.origin - sphere.center;
    let a: f32 = pow(length(ray.direction), 2.0);
    let half_b: f32 = dot(oc, ray.direction);
    let c: f32 = pow(length(oc), 2.0) - sphere.radius * sphere.radius;

    let discriminant: f32 = half_b * half_b - a * c;

    if (discriminant < 0.0) {
        return default_hit_record();
    }

    let sqrtd = sqrt(discriminant);
    var root = 0.0;

    if (root < t_min || root > t_max) {
        root = (-half_b + sqrtd) / a;
        if (root < t_min || root > t_max) {
            return default_hit_record();
        }
    }

    var normal: vec3<f32> = (record.hit_point - sphere.center) / sphere.radius;
    let is_front: bool = dot(normal, record.normal) > 0.0;
    if (is_front) {
        normal = -normal;
    }

    return HitRecord(
        ray_get_at(ray, record.distance),
        normal,
        root,
        is_front,
        true
    );
}
