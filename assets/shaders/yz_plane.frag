struct YzPlane {
    vec2 pointOne;
    vec2 pointTwo;
    float normalDisplacement;
    int materialIdx;
    int materialType;
};

bool hitYzPlane(YzPlane plane, Ray ray, float tMin, float tMax, out HitRecord record) {
    float t = (plane.normalDisplacement - ray.origin.x) / ray.direction.x;

    if (t < tMin || t > tMax) {
        return false;
    }

    float y = ray.origin.y + t * ray.direction.y;
    float z = ray.origin.z + t * ray.direction.z;

    if (y < plane.pointOne.x
        || y > plane.pointTwo.x
        || z < plane.pointOne.y
        || z > plane.pointTwo.y
    ) {
        return false;
    }

    vec3 selfNormal = vec3(1.0, 0.0, 0.0);

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
