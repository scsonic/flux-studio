#include <node_api.h>
#include <string.h>

namespace demo {

struct Tri {
  float normal[3];
  float vertices[9];
  char bytecount[2];
} typedef Triangle;

napi_value Method(napi_env env, napi_callback_info info) {
  napi_value world;
  napi_create_string_utf8(env, "world", 5, &world);
  return world;
}

napi_value ParseStl(napi_env env, napi_callback_info info) {
  size_t argc = 5;
  napi_value args[5];
  napi_get_cb_info(env, info, &argc, args, NULL, NULL);

  void* ab_data;
  size_t ab_len;
  napi_get_arraybuffer_info(env, args[0], &ab_data, &ab_len);

  int32_t dataOffset;
  napi_get_value_int32(env, args[1], &dataOffset);

  int32_t faces;
  napi_get_value_int32(env, args[2], &faces);

  void* vertices_data;
  size_t vertices_len;
  napi_get_typedarray_info(env, args[3], NULL, &vertices_len, &vertices_data, NULL, NULL);

  void* normals_data;
  size_t normals_len;
  napi_get_typedarray_info(env, args[4], NULL, &normals_len, &normals_data, NULL, NULL);

  char* dataPtr = (char*)ab_data + dataOffset;
  float* verticesPtr = (float*)vertices_data;
  float* normalsPtr = (float*)normals_data;

  int offset = 0;
  for (int face = 0; face < faces; face++) {
    // Each triangle in binary STL is 50 bytes
    Triangle* ptr = (Triangle*)(dataPtr + face * 50);
    for (int i = 0; i < 3; i++) {
      verticesPtr[offset] = ptr->vertices[i * 3];
      verticesPtr[offset + 1] = ptr->vertices[i * 3 + 1];
      verticesPtr[offset + 2] = ptr->vertices[i * 3 + 2];
      normalsPtr[offset] = ptr->normal[0];
      normalsPtr[offset + 1] = ptr->normal[1];
      normalsPtr[offset + 2] = ptr->normal[2];
      offset += 3;
    }
  }

  return NULL;
}

napi_value Init(napi_env env, napi_value exports) {
  napi_value hello_fn, parse_stl_fn;
  napi_create_function(env, "hello", NAPI_AUTO_LENGTH, Method, NULL, &hello_fn);
  napi_create_function(env, "parseStl", NAPI_AUTO_LENGTH, ParseStl, NULL, &parse_stl_fn);
  napi_set_named_property(env, exports, "hello", hello_fn);
  napi_set_named_property(env, exports, "parseStl", parse_stl_fn);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)

}  // namespace demo