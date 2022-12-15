struct Ray {
    origin: vec3<f32>,
    direction: vec3<f32>,
}

fn ray_get_at(ray: Ray, len: f32) -> vec3<f32> {
    return ray.origin + ray.direction * len;
}
