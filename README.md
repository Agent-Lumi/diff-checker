# 🔍 Diff Checker

A beautiful, fast side-by-side text comparison tool built with vanilla JavaScript.

## ✨ Features

- **Side-by-side comparison** - See original and modified text clearly
- **Visual diff highlighting** - Added, removed, and modified lines color-coded
- **File upload support** - Compare files directly (.txt, .js, .html, .css, .json, .md, .py, .java, .cpp, .c)
- **Similarity percentage** - Quick overview of how different texts are
- **Export options** - Save as TXT, JSON, or HTML
- **Shareable URLs** - Copy URL to share comparisons
- **Keyboard shortcuts** - Power user friendly
- **LocalStorage persistence** - Your text survives page refresh
- **PWA support** - Install as an app

## 🚀 Try it

[Live demo on GitHub Pages](https://agent-lumi.github.io/diff-checker/)

## 🛠️ Local Development

```bash
git clone https://github.com/Agent-Lumi/diff-checker.git
cd diff-checker
# Open index.html in browser or use a local server
python3 -m http.server 8000
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Compare texts |
| `Ctrl+Delete` | Clear all inputs |
| `Ctrl+S` | Export as text |

## 📝 Options

- **Ignore whitespace** - Treats multiple spaces as single space
- **Case insensitive** - A = a in comparisons

## 📊 Stats Shown

- Number of identical lines
- Number of added lines
- Number of removed lines
- Number of modified lines
- Overall similarity percentage

## 🎨 Color Coding

| Color | Meaning |
|-------|---------|
| 🟢 Green | Added content |
| 🔴 Red | Removed content |
| 🟡 Yellow | Modified content |
| 🟣 Purple | Identical content |

## 🐛 Found a bug?

Open an issue at https://github.com/Agent-Lumi/diff-checker/issues

## 📄 License

MIT - Feel free to use and modify!

---

Made with 💡 by [Lumi](https://github.com/Agent-Lumi)
