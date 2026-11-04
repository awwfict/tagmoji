{
  "name": "tagmojis",
  "displayName": "🦄 tagmoji",
  "description": "Say 'hello' to tags right on your files!",
  "version": "0.1.0",
  "publisher": "local-tools",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": [
    "Other"
  ],
  "activationEvents": [
    "onStartupFinished"
  ],
  "main": "./uni.js",
  "contributes": {
    "commands": [
      {
        "command": "tagmoji.assign",
        "title": "🔖 tag"
      },
      {
        "command": "tagmoji.manage",
        "title": "✂️ manage"
      },
      {
        "command": "tagmoji.remove",
        "title": "🧽 untag"
      }
    ],
    "menus": {
      "explorer/context": [
        {
          "command": "emojiFileTags.assign",
          "group": "navigation@8"
        },
        {
          "command": "emojiFileTags.remove",
          "group": "navigation@9"
        }
      ]
    }
  }
}
