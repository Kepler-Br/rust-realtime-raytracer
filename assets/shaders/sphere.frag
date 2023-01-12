struct Sphere {
    vec3 center;
    float radius;
    int materialIdx;
    int materialType;
};

bool hitSphere(Sphere sphere, Ray ray, float tMin, float tMax, out HitRecord record) {
    vec3 oc = ray.origin - sphere.center;
    float a = pow(length(ray.direction), 2.0);
    float halfB = dot(oc, ray.direction);
    float c = pow(length(oc), 2.0) - sphere.radius * sphere.radius;
    float discriminant = halfB * halfB - a * c;

    if (discriminant < 0.0) {
        return false;
    }

    float sqrtd = sqrt(discriminant);
    float root = (-halfB - sqrtd) / a;

    if (root < tMin || root > tMax) {
        root = (-halfB + sqrtd) / a;
        if (root < tMin || root > tMax) {
            return false;
        }
    }

    vec3 normal = (rayGetAt(ray, root) - sphere.center) / sphere.radius;
    bool isFront = dot(normal, record.normal) > 0.0;

    if (isFront) {
        normal = -normal;
    }

    record.hitPoint = rayGetAt(ray, root);
    record.normal = normal;
    record.distance = root;
    record.isFrontFace = isFront;
    record.materialIdx = sphere.materialIdx;
    record.materialType = sphere.materialType;

    return true;
}
