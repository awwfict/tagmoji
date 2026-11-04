const vscode = require('vscode');

const TAGS_KEY = 'tagmoji.tags';
const ASSIGNMENTS_KEY = 'tagmoji.assignments';

function activate(context) {
  const provider = new EmojiDecorationProvider(context);

  context.subscriptions.push(
    provider.emitter,
    vscode.window.registerFileDecorationProvider(provider),

    vscode.commands.registerCommand('tagmoji.start', async () => {
      await manageTags(context, provider);
    }),

    vscode.commands.registerCommand('tagmoji.assign', async (uri) => {
      const target = await resolveTarget(uri);
      if (!target) return;

      await assignTag(context, provider, target);
    }),

    vscode.commands.registerCommand('tagmoji.remove', async (uri) => {
      const target = await resolveTarget(uri);
      if (!target) return;

      const assignments = context.workspaceState.get(ASSIGNMENTS_KEY, {});
      const key = relativeKey(target);

      if (!assignments[key]) {
        vscode.window.showInformationMessage(
          '🙅🏻 this file has no mojis.'
        );
        return;
      }

      delete assignments[key];

      await context.workspaceState.update(
        ASSIGNMENTS_KEY,
        assignments
      );

      provider.refresh(target);

      vscode.window.showInformationMessage('🪄 moji cleaned');
    }),

    vscode.commands.registerCommand('tagmoji.manage', async () => {
      await manageTags(context, provider);
    })
  );
}

class EmojiDecorationProvider {
  constructor(context) {
    this.context = context;
    this.emitter = new vscode.EventEmitter();
    this.onDidChangeFileDecorations = this.emitter.event;
  }

  provideFileDecoration(uri) {
    if (uri.scheme !== 'file') return;

    const key = relativeKey(uri);

    const assignments = this.context.workspaceState.get(
      ASSIGNMENTS_KEY,
      {}
    );

    const tagId = assignments[key];

    if (!tagId) return;

    const tags = this.context.workspaceState.get(TAGS_KEY, []);
    const tag = tags.find(t => t.id === tagId);

    if (!tag) return;

    return {
      badge: tag.emoji,
      tooltip: `${tag.name} (${tag.emoji})`,
      color: tag.color
        ? new vscode.ThemeColor(tag.color)
        : undefined,
      propagate: false
    };
  }

  refresh(uri) {
    this.emitter.fire(uri);
  }

  refreshAll() {
    this.emitter.fire(undefined);
  }
}

async function resolveTarget(uri) {
  if (uri && uri.fsPath) return uri;

  const editor = vscode.window.activeTextEditor;

  if (editor) {
    return editor.document.uri;
  }

  const selected = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: '👉🏻 select to tag'
  });

  return selected && selected[0];
}

function relativeKey(uri) {
  const folder = vscode.workspace.getWorkspaceFolder(uri);

  if (folder) {
    return `${folder.name}/${vscode.workspace.asRelativePath(uri, false)}`;
  }

  return uri.fsPath;
}

async function assignTag(context, provider, uri) {
  let tags = context.workspaceState.get(TAGS_KEY, []);

  if (!tags.length) {
    const create = await vscode.window.showInformationMessage(
      '🙆🏻 there is no tags yet. make first?',
      '🆗'
    );

    if (create) {
      await manageTags(context, provider);
    }

    tags = context.workspaceState.get(TAGS_KEY, []);

    if (!tags.length) return;
  }

  const chosen = await vscode.window.showQuickPick(
    tags.map(t => ({
      label: `${t.emoji}  ${t.name}`,
      description: t.color || '',
      tag: t
    })),
    {
      placeHolder: '👉🏻 select one from your tags'
    }
  );

  if (!chosen) return;

  const assignments = context.workspaceState.get(
    ASSIGNMENTS_KEY,
    {}
  );

  assignments[relativeKey(uri)] = chosen.tag.id;

  await context.workspaceState.update(
    ASSIGNMENTS_KEY,
    assignments
  );

  provider.refresh(uri);
}

async function manageTags(context, provider) {
  const tags = context.workspaceState.get(TAGS_KEY, []);

  const options = [
    {
      label: '$(add) ✨ make a new',
      action: 'create'
    },

    ...tags.map(t => ({
      label: `${t.emoji}  ${t.name}`,
      description: t.color || 'default',
      action: 'edit',
      tag: t
    }))
  ];

  const picked = await vscode.window.showQuickPick(
    options,
    {
      placeHolder: '👉🏻 select to edit'
    }
  );

  if (!picked) return;

  const current = picked.tag;

  const name = await vscode.window.showInputBox({
    prompt: '1️⃣ name it firstly',
    value: current ? current.name : '',
    validateInput: v =>
      v.trim() ? null : '📍 tag must have a name'
  });

  if (!name) return;

  const emoji = await vscode.window.showInputBox({
    prompt: '2️⃣ select moji',
    value: current ? current.emoji : '🔖',
    validateInput: v =>
      v.trim() ? null : '📍 no moji selected'
  });

  if (!emoji) return;

  const color = await vscode.window.showInputBox({
    prompt: '3️⃣ paste a colour',
    value: current ? (current.color || '') : ''
  });

  if (color === undefined) return;

  const next = context.workspaceState.get(TAGS_KEY, []);

  if (current) {
    const i = next.findIndex(t => t.id === current.id);

    if (i >= 0) {
      next[i] = {
        ...current,
        name: name.trim(),
        emoji: emoji.trim(),
        color: color.trim()
      };
    }
  } else {
    next.push({
      id: `tag-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      name: name.trim(),
      emoji: emoji.trim(),
      color: color.trim()
    });
  }

  await context.workspaceState.update(TAGS_KEY, next);

  provider.refreshAll();

  vscode.window.showInformationMessage(
    `Saved tag: ${emoji.trim()} ${name.trim()}`
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
