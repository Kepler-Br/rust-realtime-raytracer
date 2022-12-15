struct HitRecord {
    hit_point: vec3<f32>,
    normal: vec3<f32>,
    distance: f32,
    is_front_face: bool,
    hit: bool,
}

fn default_hit_record() -> HitRecord {
    return HitRecord (
        vec3(0.0),
        vec3(0.0),
        0.0,
        false,
        false,
    );
}
