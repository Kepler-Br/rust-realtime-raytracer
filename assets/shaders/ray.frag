struct Ray {
    vec3 origin;
    vec3 direction;
};

vec3 rayGetAt(Ray ray, float len) {
    return ray.origin + ray.direction * len;
}
