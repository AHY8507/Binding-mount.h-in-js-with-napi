#include <node_api.h>
#include <sys/mount.h>
#include <assert.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

// Function to mount a filesystem

int mounting(const char *source, const char *target,
    const char *filesystemtype, unsigned long mountflags,
    const char *data) {
    if(data[0] == '\0') {
        data = NULL;
    }
    int mount_result = mount(source, target, filesystemtype, mountflags, data);
    if(mount_result == -1) {
        perror("ADDON.C: Mount failed.");
        return -1;
    }
    return mount_result;
}
    
// Function to unmount a filesystem with flags
int umounting2(const char *target, unsigned long flags) {
    int umount2_result = umount2(target, flags);
    if(umount2_result == -1) {
        perror("ADDON.C: Umount2 failed.");
        return -1;
    }
    return umount2_result;
    
}

// Function to unmount a filesystem without flags
int umounting(const char *target) {
    int umount_result = umount(target);
    if(umount_result == -1) {
        perror("ADDON.C: Umount failed.");
        return -1;
    }
    return umount_result;
    
}

napi_value MountWrapper(napi_env env, napi_callback_info info) {
    size_t argc = 5;
    napi_value args[5];
    napi_status status = napi_get_cb_info(env, info, &argc, args, NULL, NULL);
    assert(status == napi_ok);

    if (argc < 5) {
        napi_throw_error(env, NULL, "5 arguments required: source, target, fstype, flags, data");
        return NULL;
    }

    // --- source ---
    size_t source_len;
    status = napi_get_value_string_utf8(env, args[0], NULL, 0, &source_len);
    assert(status == napi_ok);
    char* source = malloc(source_len + 1);
    status = napi_get_value_string_utf8(env, args[0], source, source_len + 1, NULL);
    assert(status == napi_ok);

    // --- target ---
    size_t target_len;
    status = napi_get_value_string_utf8(env, args[1], NULL, 0, &target_len);
    assert(status == napi_ok);
    char* target = malloc(target_len + 1);
    status = napi_get_value_string_utf8(env, args[1], target, target_len + 1, NULL);
    assert(status == napi_ok);

    // --- filesystemtype ---
    size_t fstype_len;
    status = napi_get_value_string_utf8(env, args[2], NULL, 0, &fstype_len);
    assert(status == napi_ok);
    char* fstype = malloc(fstype_len + 1);
    status = napi_get_value_string_utf8(env, args[2], fstype, fstype_len + 1, NULL);
    assert(status == napi_ok);

    // --- mountflags ---
    uint32_t flags;
    status = napi_get_value_uint32(env, args[3], &flags);
    assert(status == napi_ok);

    // --- data (optional string or null) ---
    char* data = NULL;
    napi_valuetype type;
    status = napi_typeof(env, args[4], &type);
    assert(status == napi_ok);

    if (type == napi_string) {
        size_t data_len;
        status = napi_get_value_string_utf8(env, args[4], NULL, 0, &data_len);
        assert(status == napi_ok);
        data = malloc(data_len + 1);
        status = napi_get_value_string_utf8(env, args[4], data, data_len + 1, NULL);
        assert(status == napi_ok);
    } else if (type == napi_null || type == napi_undefined) {
        data = NULL;
    } else {
        free(source); free(target); free(fstype);
        napi_throw_type_error(env, NULL, "data must be string, null or undefined");
        return NULL;
    }

    int result = mounting(source, target, fstype, flags, data);

    free(source);
    free(target);
    free(fstype);
    if (data) free(data);

    napi_value js_result;
    status = napi_create_int32(env, result, &js_result);
    assert(status == napi_ok);

    return js_result;
}

napi_value Umount2Wrapper(napi_env env, napi_callback_info info) {
    size_t argc = 2;
    napi_value args[2];

    napi_status status = napi_get_cb_info(env, info, &argc, args, NULL, NULL);
    assert(status == napi_ok);

    if (argc < 2) {
        napi_throw_error(env, NULL, "2 arguments required: target (string), flags (number)");
        return NULL;
    }

    // --- target (string) ---
    size_t target_len;
    status = napi_get_value_string_utf8(env, args[0], NULL, 0, &target_len);
    assert(status == napi_ok);

    char* target = malloc(target_len + 1);
    if (!target) {
        napi_throw_error(env, NULL, "Failed to allocate memory for target");
        return NULL;
    }

    status = napi_get_value_string_utf8(env, args[0], target, target_len + 1, NULL);
    assert(status == napi_ok);

    // --- flags (number) ---
    uint32_t flags;
    status = napi_get_value_uint32(env, args[1], &flags);
    assert(status == napi_ok);

    int result = umounting2(target, flags);

    free(target);

    napi_value js_result;
    status = napi_create_int32(env, result, &js_result);
    assert(status == napi_ok);

    return js_result;
}

napi_value UmountWrapper(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];

    napi_status status = napi_get_cb_info(env, info, &argc, args, NULL, NULL);
    assert(status == napi_ok);

    if (argc < 1) {
        napi_throw_error(env, NULL, "1 argument required: target path (string)");
        return NULL;
    }

    size_t target_len;
    status = napi_get_value_string_utf8(env, args[0], NULL, 0, &target_len);
    assert(status == napi_ok);

    char* target = malloc(target_len + 1);
    if (!target) {
        napi_throw_error(env, NULL, "Memory allocation failed");
        return NULL;
    }

    status = napi_get_value_string_utf8(env, args[0], target, target_len + 1, NULL);
    assert(status == napi_ok);

    int result = umounting(target);

    free(target);

    napi_value js_result;
    status = napi_create_int32(env, result, &js_result);
    assert(status == napi_ok);

    return js_result;
}

napi_value Init(napi_env env, napi_value exports) {
    napi_value fn;
    napi_status status;

    // 1. mounting
    status = napi_create_function(env, "mounting", NAPI_AUTO_LENGTH, MountWrapper, NULL, &fn);
    assert(status == napi_ok);
    napi_set_named_property(env, exports, "mounting", fn);

    // 2. umounting2
    status = napi_create_function(env, "umounting2", NAPI_AUTO_LENGTH, Umount2Wrapper, NULL, &fn);
    assert(status == napi_ok);
    napi_set_named_property(env, exports, "umounting2", fn);

    // 3. umounting
    status = napi_create_function(env, "umounting", NAPI_AUTO_LENGTH, UmountWrapper, NULL, &fn);
    assert(status == napi_ok);
    napi_set_named_property(env, exports, "umounting", fn);

    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)