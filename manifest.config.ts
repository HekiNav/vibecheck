import { defineManifest } from "@crxjs/vite-plugin"
import pkg from "./package.json"

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: "public/logo.png",
  },
  action: {
    default_icon: {
      48: "public/logo.png",
    },
  },
  content_scripts: [{
    js: ["src/content/main.ts"],
    css: ["src/assets/style.css"],
    matches: [
      "*://*.youtube.com/*",
      "*://*.google.com/*",
      "*://*.x.com/*",
      "*://x.com/*"
    ],
  }],
  background: {
    scripts: [
      "src/background.ts"
    ],
    type: "module"
  },
  permissions: [
    "activeTab",
  ],
  web_accessible_resources: [
    {
      "resources": [
        "src/assets/data/sites.jsonc",
        "src/assets/style.css"
      ],
      "extension_ids": [
        "*"
      ],
      "matches": [
        "*://*/*"
      ]
    }
  ]
})
