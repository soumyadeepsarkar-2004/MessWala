# Documentation Contributing Guide

Thank you for helping improve MessWala documentation! This guide explains how to contribute, edit, and maintain our docs.

---

## 📖 Where Documentation Lives

All documentation is in the **`/docs`** folder:

```
docs/
├─ index.md                    (Main landing page)
├─ mkdocs.yml                  (Site configuration)
├─ guides/                     (User guides)
├─ api/                        (API documentation)
├─ architecture/               (Technical docs)
├─ deployment/                 (Deployment guides)
└─ admin/                      (Admin documentation)
```

---

## 🚀 Quick Start for Contributors

### 1. Create/Edit a Document

**Edit existing:**
- Simply edit the `.md` file in your text editor or GitHub web interface
- Or use VS Code: `File → Open File`

**Create new:**
1. Create `.md` file in appropriate folder
2. Add to `mkdocs.yml` navigation section
3. Write content using Markdown

### 2. Write in Markdown

All documentation uses **Markdown** (`.md` files):

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text** or *italic text*

- Bullet list
- Another item
  - Nested item

1. Numbered list
2. Second item

[Link text](https://example.com)

```markdown
# Code block with syntax highlighting
code here
```

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

### 3. Preview Locally (Optional)

**Install MkDocs:**
```bash
pip install mkdocs-material
```

**Preview locally:**
```bash
cd docs
mkdocs serve
# Opens at http://localhost:8000
```

**Changes auto-reload** as you edit!

### 4. Commit & Push

```bash
git add docs/
git commit -m "docs: Describe what you changed"
git push origin main
```

**Automatic deployment:**
- GitHub Actions automatically deploys
- Changes live within ~1-2 minutes
- No manual deployment needed!

---

## 📋 Documentation Standards

### File Naming

- Use **lowercase with hyphens**: `getting-started.md` ✅
- Not: `GettingStarted.md` ❌
- Not: `getting_started.md` ❌

### Folder Organization

- **`guides/`** — User-facing guides (getting started, features)
- **`api/`** — API documentation (endpoints, authentication)
- **`architecture/`** — Technical documentation (system design)
- **`deployment/`** — Deployment instructions & troubleshooting
- **`admin/`** — Admin-specific guides (setup, user management)

### Heading Structure

Start with `# Title` (H1), not `##`:

```markdown
# Main Page Title      ← Use for page title (H1)
## Section Header      ← Use for sections (H2)
### Subsection         ← Use for subsections (H3)
#### Details           ← Use rarely (H4+)
```

**Never use multiple H1s** — only one per file.

### Writing Style

- **Be concise** — Get to the point quickly
- **Use active voice** — "Click the button" not "The button can be clicked"
- **Be specific** — "Go to Expenses" not "Go to the page"
- **Include examples** — Show code samples for technical docs
- **Add emojis sparingly** — Use at the start of sections only
- **Link related docs** — Help readers find related information

### Code Examples

**For code blocks:**
````markdown
```javascript
// JavaScript example
const token = localStorage.getItem('token');
```

```python
# Python example
import requests
response = requests.get('/api/expenses')
```

```bash
# Commands/terminal
npm install
npm run dev
```
````

**Inline code:**
```markdown
Use `variableName` for code terms
Use [links](path/to/doc.md) for internal references
```

### Lists & Tables

**Bullet lists:**
```markdown
- Item 1
- Item 2
  - Nested item
  - Another nested
- Item 3
```

**Numbered lists:**
```markdown
1. First step
2. Second step
3. Third step
```

**Tables:**
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
| Data 3   | Data 4   |
```

### Cross-References

**Link to other docs:**
```markdown
See [User Roles guide](../guides/user-roles.md)
Check [API Authentication](../api/authentication.md)
Read [Troubleshooting](../deployment/troubleshooting.md)
```

**Use relative paths** from the current file.

---

## 📐 Page Structure Template

Use this template for new pages:

```markdown
# Page Title

Brief one-sentence description of what this page covers.

---

## 🎯 Section 1

Explain this section clearly.

### Subsection 1.1

Details here.

### Subsection 1.2

More details.

---

## 📊 Section 2

Another section with examples.

**Example:**
```bash
code example
```

---

## ❓ FAQ

**Q: Common question?**
A: Answer with details.

**Q: Another question?**
A: Another answer.

---

**Last Updated:** [Date]  
**Version:** [Version number]
```

---

## 🎨 Formatting Best Practices

### Callout Boxes

**Important notes:**
```markdown
⚠️ **Warning:** Something important to watch out for

ℹ️ **Note:** Additional information that's helpful

✅ **Best Practice:** Recommended way to do something

💡 **Tip:** Helpful hint or shortcut
```

### Code Blocks

**With line numbers (where relevant):**
````markdown
```javascript
1. const token = localStorage.getItem('token');
2. if (!token) {
3.   window.location.href = '/login';
4. }
```
````

### Emphasis

```markdown
**Bold for important** terms
*Italic for emphasis*
`code` for technical terms
[links](url) for references
```

---

## 🔍 QA Checklist Before Committing

Before you push docs, verify:

- [ ] **Spelling & Grammar** — Run through spell checker
- [ ] **Links Work** — Check all internal/external links
- [ ] **Code Examples** — Are they correct and tested?
- [ ] **Formatting** — Proper markdown syntax
- [ ] **Structure** — Proper heading hierarchy
- [ ] **Navigation** — Added to `mkdocs.yml` if new page
- [ ] **No Secrets** — No passwords, API keys, credentials
- [ ] **Images** — Alt text included (if images used)
- [ ] **Mobile** — Would look good on phone?
- [ ] **Updated Footer** — Last Updated date if relevant

---

## 📝 What to Document

### When Adding a Feature

1. **User Guide** — How to use the feature
2. **API Docs** — New endpoints and examples
3. **Architecture** — Database changes if applicable
4. **Troubleshooting** — Common issues with solutions

### When Fixing a Bug

1. **Troubleshooting** — Add the issue + solution
2. **Notes** — Mark as version-specific if relevant

### When Changing Something

1. **Feature Guide** — Update existing documentation
2. **Changelog** — Note the change (if site has one)
3. **Version** — Update version numbers if breaking

---

## 🚀 Document Lifecycle

### Draft
```markdown
# Page Title (Draft)

⚠️ **Note:** This page is under development.
```

### Review
- Submit PR with changes
- Request review from maintainers
- Address feedback

### Published
- Merge to main
- GitHub Actions deploys automatically
- Live on GitHub Pages within 1-2 minutes

### Maintain
- Review periodically for accuracy
- Update when features change
- Keep examples current

---

## 📐 Page Length Guidelines

- **Getting Started** — 5-10 minutes read
- **Feature Guide** — 10-20 minutes read
- **API Reference** — 20+ minutes (reference style)
- **Architecture** — 30-50 minutes (deep dive)
- **Troubleshooting** — Variable (reference)

**Keep focused** — If a page gets too long, split into subsections or separate files.

---

## 🔗 Navigation Rules

**Update `mkdocs.yml` when:**
- ✅ Adding new page
- ✅ Removing page
- ✅ Reorganizing structure
- ✅ Renaming page

**Example:**
```yaml
nav:
  - Home: index.md
  - Getting Started:
      - Quick Start: guides/getting-started.md
      - User Roles: guides/user-roles.md
  - API:
      - Endpoints: api/endpoints.md
```

---

## 🎓 Examples to Reference

**Good documentation examples:**
- [Python Docs](https://docs.python.org)
- [React Docs](https://react.dev)
- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
- Our existing docs in `/docs` folder

---

## 🤝 Getting Help

**Questions about documentation?**
1. Check existing docs in `/docs`
2. Review this guide
3. Open GitHub Issue for questions
4. Submit PR with your improvement

**Found an error?**
1. Create GitHub Issue with location
2. Or submit PR with fix

---

## 📊 Documentation Metrics

We track:
- Lines of documentation (~45,000 words)
- Number of pages (10+ pages)
- Search indexing (✅ all docs)
- Mobile responsiveness (✅ responsive)
- Page load time (< 2 seconds)

---

## 🔄 Continuous Improvement

**Help us improve:**
- Suggest clearer explanations
- Add examples for complex topics
- Fix typos/grammar
- Update outdated information
- Improve organization

**Every contribution helps!** 🎉

---

## 📄 License

All documentation is part of MessWala project and follows the same license (MIT).

---

**Thank you for contributing to MessWala documentation!** 🙏

*Last Updated: March 17, 2026*
