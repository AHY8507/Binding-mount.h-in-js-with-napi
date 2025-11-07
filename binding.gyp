{
  "targets": [
    {
      "target_name": "addon",
      "sources": [ "src/addon.c" ],
      "include_dirs": [
        "<!(node -p \"require('path').dirname(require.resolve('node-addon-api')) + '/..' \")",
        "<!(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "conditions": [
        ["OS=='linux'", {
          "libraries": [ ]
        }]
      ]
    }
  ]
}