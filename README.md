# Readme
## 🙆🏻 tagmoji — the way to say hi to custom tags in visual studio !

### How To Use it!?

1️⃣	Open a folder or workspace in VS Code。

2️⃣	Open the Command Palette (⇧⌘P) and run **Tagmoji**。

3️⃣	Enter a name and an emoji。 Optionally enter a VS Code theme color ID, or leave it blank。

4️⃣	Right-click a file in Explorer and choose Emoji File Tags: Assign Tag to File。

5️⃣	Choose the tag。 To clear it, right-click the file and choose Emoji File Tags: Remove Tag from File。

---

### 📍 Important limitations

> 👉🏻 tags and assignments are stored in **VS Code workspace** state。 They are **not** written into your source files or Git history。

> 👉🏻 VS Code’s public FileDecoration API places a short badge on/near the file icon and may show a tooltip。 It does not let extensions freely place a custom emoji at the far right of each Explorer row like a custom HTML pill。 This prototype tests the native badge approach without replacing your Explorer。 Emoji rendering and badge positioning depend on VS Code and the icon theme。
