const vscode = require('vscode');

const TAGS_KEY = 'emojiFileTags.tags';
const ASSIGNMENTS_KEY = 'emojiFileTags.assignments';

function activate(context) {
  const provider = new EmojiDecorationProvider(context);
  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(provider),
    vscode.commands.registerCommand('emojiFileTags.assign', async (uri) => {
      const target = await resolveTarget(uri);
      if (!target) return;
      await assignTag(context, provider, target);
    }),
    vscode.commands.registerCommand('emojiFileTags.remove', async (uri) => {
      const target = await resolveTarget(uri);
      if (!target) return;
      const assignments = context.workspaceState.get(ASSIGNMENTS_KEY, {});
      const key = relativeKey(target);
      if (!assignments[key]) {
        vscode.window.showInformationMessage('🙅🏻 this file has no moji tag.');
        return;
      }
      delete assignments[key];
      await context.workspaceState.update(ASSIGNMENTS_KEY, assignments);
      provider.refresh(target);
      vscode.window.showInformationMessage('Emoji tag removed.');
    }),
    vscode.commands.registerCommand('emojiFileTags.manage', async () => {
      await manageTags(context, provider);
    })
  );
}

class EmojiDecorationProvider {
  constructor(context) { this.context = context; this.emitter = new vscode.EventEmitter(); this.onDidChangeFileDecorations = this.emitter.event; }
  provideFileDecoration(uri) {
    if (uri.scheme !== 'file') return;
    const key = relativeKey(uri);
    const assignments = this.context.workspaceState.get(ASSIGNMENTS_KEY, {});
    const tagId = assignments[key];
    if (!tagId) return;
    const tags = this.context.workspaceState.get(TAGS_KEY, []);
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return;
    return {
      badge: tag.emoji,
      tooltip: `${tag.name} (${tag.emoji})`,
      color: tag.color ? new vscode.ThemeColor(tag.color) : undefined,
      propagate: false
    };
  }
  refresh(uri) { this.emitter.fire(uri); }
  refreshAll() { this.emitter.fire(undefined); }
}

async function resolveTarget(uri) {
  if (uri && uri.fsPath) return uri;
  const editor = vscode.window.activeTextEditor;
  if (editor) return editor.document.uri;
  const selected = await vscode.window.showOpenDialog({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, openLabel: 'Choose file to tag' });
  return selected && selected[0];
}

function relativeKey(uri) {
  const folder = vscode.workspace.getWorkspaceFolder(uri);
  if (folder) return `${folder.name}/${vscode.workspace.asRelativePath(uri, false)}`;
  return uri.fsPath;
}

async function assignTag(context, provider, uri) {
  let tags = context.workspaceState.get(TAGS_KEY, []);
  if (!tags.length) {
    const create = await vscode.window.showInformationMessage('You have no tags yet. Create one first?', 'Create tag');
    if (create) await manageTags(context, provider);
    tags = context.workspaceState.get(TAGS_KEY, []);
    if (!tags.length) return;
  }
  const chosen = await vscode.window.showQuickPick(
    tags.map(t => ({ label: `${t.emoji}  ${t.name}`, description: t.color || '', tag: t })),
    { placeHolder: 'Choose a tag for this file' }
  );
  if (!chosen) return;
  const assignments = context.workspaceState.get(ASSIGNMENTS_KEY, {});
  assignments[relativeKey(uri)] = chosen.tag.id;
  await context.workspaceState.update(ASSIGNMENTS_KEY, assignments);
  provider.refresh(uri);
}

async function manageTags(context, provider) {
  const tags = context.workspaceState.get(TAGS_KEY, []);
  const options = [
    { label: '$(add) Create a new tag', action: 'create' },
    ...tags.map(t => ({ label: `${t.emoji}  ${t.name}`, description: t.color || 'default color', action: 'edit', tag: t })),
  ];
  const picked = await vscode.window.showQuickPick(options, { placeHolder: 'Create a tag or choose one to edit' });
  if (!picked) return;
  const current = picked.tag;
  const name = await vscode.window.showInputBox({ prompt: 'Tag name', value: current ? current.name : '', validateInput: v => v.trim() ? null : 'Enter a name.' });
  if (!name) return;
  const emoji = await vscode.window.showInputBox({ prompt: 'Emoji (ideally one emoji, e.g. 🛡️, 💡, ❤️)', value: current ? current.emoji : '✨', validateInput: v => v.trim() ? null : 'Enter an emoji.' });
  if (!emoji) return;
  const color = await vscode.window.showInputBox({
    prompt: 'Optional VS Code theme color ID (leave blank for default). Example: charts.green, charts.pink, editorInfo.foreground',
    value: current ? (current.color || '') : ''
  });
  const next = context.workspaceState.get(TAGS_KEY, []);
  if (current) {
    const i = next.findIndex(t => t.id === current.id);
    if (i >= 0) next[i] = { ...current, name: name.trim(), emoji: emoji.trim(), color: color ? color.trim() : '' };
  } else {
    next.push({ id: `tag-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`, name: name.trim(), emoji: emoji.trim(), color: color ? color.trim() : '' });
  }
  await context.workspaceState.update(TAGS_KEY, next);
  provider.refreshAll();
  vscode.window.showInformationMessage(`Saved tag: ${emoji.trim()} ${name.trim()}`);
}

function deactivate() {}
module.exports = { activate, deactivate };
