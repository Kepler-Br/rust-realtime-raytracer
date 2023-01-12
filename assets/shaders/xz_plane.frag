struct XzPlane {
    vec2 pointOne;
    vec2 pointTwo;
    float normalDisplacement;
    int materialIdx;
    int materialType;
};

bool hitXzPlane(XzPlane plane, Ray ray, float tMin, float tMax, out HitRecord record) {
    float t = (plane.normalDisplacement - ray.origin.y) / ray.direction.y;

    if (t < tMin || t > tMax) {
        return false;
    }

    float x = ray.origin.x + t * ray.direction.x;
    float z = ray.origin.z + t * ray.direction.z;

    if (x < plane.pointOne.x
        || x > plane.pointTwo.x
        || z < plane.pointOne.y
        || z > plane.pointTwo.y
    ) {
        return false;
    }

    vec3 selfNormal = vec3(0.0, -1.0, 0.0);

    if (dot(ray.direction, selfNormal) > 0.0) {
        record.normal = selfNormal;
        record.isFrontFace = true;
    } else {
        record.normal = -selfNormal;
        record.isFrontFace = false;
    }

    record.distance = t;
    record.materialIdx = plane.materialIdx;
    record.materialType = plane.materialType;
    record.hitPoint = rayGetAt(ray, t);

    return true;
}
