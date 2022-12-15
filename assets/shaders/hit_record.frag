struct HitRecord {
    vec3 hit_point;
    vec3 normal;
    float distance;
    bool is_front_face;
    bool hit;
};

HitRecord default_hit_record() {
    return HitRecord(
    vec3(0.0),
    vec3(0.0),
    0.0,
    false,
    false
    );
}
