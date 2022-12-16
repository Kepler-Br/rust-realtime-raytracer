struct Sphere {
    vec3 center;
    float radius;
    int material_idx;
};

bool hit_sphere(Sphere sphere, Ray ray, float t_min, float t_max, out HitRecord record) {
    vec3 oc = ray.origin - sphere.center;
    float a = pow(length(ray.direction), 2.0);
    float half_b = dot(oc, ray.direction);
    float c = pow(length(oc), 2.0) - sphere.radius * sphere.radius;
    float discriminant = half_b * half_b - a * c;

    if (discriminant < 0.0) {
        return false;
    }

    float sqrtd = sqrt(discriminant);
    float root = 0.0;

    if (root < t_min || root > t_max) {
        root = (-half_b + sqrtd) / a;
        if (root < t_min || root > t_max) {
            return false;
        }
    }

    vec3 normal = (ray_get_at(ray, root) - sphere.center) / sphere.radius;
    bool is_front = dot(normal, record.normal) > 0.0;

    if (is_front) {
        normal = -normal;
    }

    record.hit_point = ray_get_at(ray, root);
    record.normal = normal;
    record.distance = root;
    record.is_front_face = is_front;
    record.material_idx = sphere.material_idx;

    return true;
}
