struct Ray {
    vec3 origin;
    vec3 direction;
};

vec3 ray_get_at(Ray ray, float len) {
    return ray.origin + ray.direction * len;
}
