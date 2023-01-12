struct XyPlane {
    vec2 pointOne;
    vec2 pointTwo;
    float normalDisplacement;
    int materialIdx;
    int materialType;
};

bool hitXyPlane(XyPlane plane, Ray ray, float tMin, float tMax, out HitRecord record) {
    float t = (plane.normalDisplacement - ray.origin.z) / ray.direction.z;
// let t = (self.normal_displacement - ray.get_origin().z) / ray.get_direction().z;
    if (t < tMin || t > tMax) {
        return false;
    }
//        if t < t_min || t > t_max {
//            return false;
//        }
    float x = ray.origin.x + t * ray.direction.x;
    float y = ray.origin.y + t * ray.direction.y;
//        let x = ray.get_origin().x + t * ray.get_direction().x;
//        let y = ray.get_origin().y + t * ray.get_direction().y;
    if (x < plane.pointOne.x
        || x > plane.pointTwo.x
        || y < plane.pointOne.y
        || y > plane.pointTwo.y
    ) {
        return false;
    }
//        if x < self.point_one.x
//            || x > self.point_two.x
//            || y < self.point_one.y
//            || y > self.point_two.y
//        {
//            return false;
//        }
    vec3 selfNormal = vec3(0.0, 0.0, 1.0);
//        const SELF_NORMAL: Vec3 = Vec3::new(0.0, 0.0, 1.0);
    if (dot(ray.direction, selfNormal) > 0.0) {
        record.normal = selfNormal;
        record.isFrontFace = true;
    } else {
        record.normal = -selfNormal;
        record.isFrontFace = false;
    }
//        if ray.get_direction().dot(&SELF_NORMAL) > 0.0 {
//            record.set_normal(SELF_NORMAL);
//            record.set_is_front_face(true);
//        } else {
//            record.set_normal(-SELF_NORMAL);
//            record.set_is_front_face(false);
//        };
    record.distance = t;
    record.materialIdx = plane.materialIdx;
    record.materialType = plane.materialType;
    record.hitPoint = rayGetAt(ray, t);

//        record.set_distance(t);
//        record.set_material(self.material.clone());
//        record.set_point(ray.get_at(t));
    return true;
//        return true;
}
