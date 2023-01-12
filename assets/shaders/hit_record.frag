struct HitRecord {
    vec3 hitPoint;
    vec3 normal;
    float distance;
    bool isFrontFace;
    bool hit;
    int materialIdx;
    int materialType;
};

HitRecord defaultHitRecord() {
    return HitRecord(
        vec3(0.0),
        vec3(0.0),
        0.0,
        true,
        false,
        0,
        0
    );
}
