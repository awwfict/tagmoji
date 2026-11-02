### Readme
👀 tagmoji — the best way to say hi to custom tags in visual studio !

---

#№# How To Use !?
#### Get it !
1.	open a folder or workspace in VS Code。

2.	open the Command Palette (⇧⌘P) and run **🦄 tagmoji**。

3.	choose a name and an emoji for your next new tag。 *👉🏻 optionally enter a VS Code theme color ID, or leave it blank*。

### Set it !
right-click on any file in Explorer and select «🔖 tag» 
→ choose your tagmoji。 

### And repeat !
to clear, right-click on the file and choose «🧽 untag» !

---
> 🙈 tags and assignments are stored in **VS Code workspace** state。 They are **not** written into your source files or Git history。

> 🙊 VS Code’s public FileDecoration API places a short badge on/near the file icon and may show a tooltip。 It does not let extensions freely place a custom emoji at the far right of each Explorer row like a custom HTML pill。 This prototype tests the native badge approach without replacing your Explorer。 Emoji rendering and badge positioning depend on VS Code and the icon theme。
