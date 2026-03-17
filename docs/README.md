# MessWala Documentation

Complete, production-ready documentation for the MessWala mess management system.

---

## 📚 Documentation Structure

### For Users
- **[Getting Started](guides/getting-started.md)** — Complete onboarding guide
- **[User Roles](guides/user-roles.md)** — Understand permissions by role
- **[Features](guides/features.md)** — In-depth feature guides

### For Developers
- **[API Endpoints](api/endpoints.md)** — Complete API reference
- **[Authentication](api/authentication.md)** — JWT, OAuth, security
- **[System Architecture](architecture/system-overview.md)** — Technical deep-dive

### For Admins
- **[Admin Setup Wizard](admin/setup-wizard.md)** — First-time configuration
- **[User Management](admin/user-management.md)** — Approve users, assign roles

### For DevOps
- **[Deployment Setup](deployment/setup.md)** — Deploy to production
- **[Troubleshooting](deployment/troubleshooting.md)** — Solve common issues

---

## 🚀 Quick Links

| Use Case | Link |
|----------|------|
| **New User?** | [Getting Started](guides/getting-started.md) |
| **Admin setup?** | [Setup Wizard](admin/setup-wizard.md) |
| **Need API reference?** | [Endpoints](api/endpoints.md) |
| **Having issues?** | [Troubleshooting](deployment/troubleshooting.md) |
| **Understanding system?** | [Architecture](architecture/system-overview.md) |

---

## 📖 Reading This Documentation

### By Audience

**👤 Students & Users**
1. Start: [Getting Started](guides/getting-started.md)
2. Learn: [User Roles](guides/user-roles.md)
3. Features: [Features Guide](guides/features.md)

**💼 Managers/Treasurers**
1. Start: [Getting Started](guides/getting-started.md)
2. Learn: [Features Guide](guides/features.md) (focus on Expenses & Analytics)
3. Reference: [API Endpoints](api/endpoints.md) (if building tools)

**👨‍💼 Admins**
1. Deploy: [Deployment Setup](deployment/setup.md)
2. Configure: [Setup Wizard](admin/setup-wizard.md)
3. Manage: [User Management](admin/user-management.md)

**👨‍💻 Developers**
1. Understand: [System Architecture](architecture/system-overview.md)
2. Reference: [API Endpoints](api/endpoints.md)
3. Integrate: [Authentication Guide](api/authentication.md)

**🚀 DevOps**
1. Deploy: [Deployment Setup](deployment/setup.md)
2. Debug: [Troubleshooting](deployment/troubleshooting.md)
3. Monitor: [System Architecture](architecture/system-overview.md)

---

## 🏗️ Folder Structure

```
docs/
├─ index.md                    (Main documentation page)
├─ mkdocs.yml                  (MkDocs configuration)
├─ README.md                   (This file)
│
├─ guides/
│  ├─ getting-started.md       (User onboarding)
│  ├─ user-roles.md            (Permission guide)
│  └─ features.md              (Feature documentation)
│
├─ api/
│  ├─ endpoints.md             (API reference)
│  └─ authentication.md        (Auth guide)
│
├─ architecture/
│  └─ system-overview.md       (Technical doc)
│
├─ deployment/
│  ├─ setup.md                 (Deployment guide)
│  └─ troubleshooting.md       (Problem solving)
│
├─ admin/
│  ├─ setup-wizard.md          (Admin setup)
│  └─ user-management.md       (User management)
│
└─ .github/                    (GitHub Pages setup)
   └─ ...
```

---

## 🌐 Publishing Documentation

### Option 1: MkDocs (Recommended for Technical Teams)

**Install MkDocs:**
```bash
pip install mkdocs-material
```

**Run locally:**
```bash
cd docs
mkdocs serve
# Opens at http://localhost:8000
```

**Deploy to GitHub Pages:**
```bash
mkdocs gh-deploy
```

### Option 2: GitHub Pages (Built-in)

1. Go to Repository Settings → Pages
2. Source: `Deploy from branch`
3. Branch: `main`
4. Folder: `/docs`
5. Click Save

**Automatically publishes:** Your GitHub Pages site will be at `https://soumyadeepsarkar-2004.github.io/MessWala/`

### Option 3: Notion (Cloud-Based)

1. Go to [notion.so](https://notion.so)
2. Create new workspace
3. Import Markdown files from this docs folder
4. Publish as public wiki
5. Share link: `https://notion.so/[your-workspace]`

### Option 4: Docusaurus (React-Based)

For more interactive documentation:

```bash
npx create-docusaurus@latest messwala-docs
```

Copy markdown files to `docs/` folder in Docusaurus project.

---

## ✏️ Contributing to Documentation

### Edit Documentation

1. All docs in Markdown (`.md`) format
2. Easy to edit in any text editor
3. Or use GitHub web editor
4. Preview changes before committing

### Add New Page

1. Create file in appropriate folder
2. Add to `mkdocs.yml` navigation
3. Commit and push
4. Automatically published

### Format Guidelines

- **Headings:** Use `#` for H1, `##` for H2, etc.
- **Emphasis:** `**bold**`, `*italic*`
- **Code:** `` `inline code` ``
- **Code blocks:**
  ````
  ```language
  code here
  ```
  ````
- **Lists:** Use `-` for bullets, `1.` for numbers
- **Tables:** Use markdown table syntax
- **Links:** `[text](path/to/file.md)`

---

## 🔒 Security Notes

**This documentation:**
- ✅ Contains no passwords or secrets
- ✅ No API keys or tokens
- ✅ Safe to make public
- ✅ Can be shared with anyone

**Never commit:**
- Environment variables
- Database credentials
- API keys
- JWT secrets

---

## 📊 Documentation Status

| Section | Status | Last Updated | Version |
|---------|--------|--------------|---------|
| Getting Started | ✅ Complete | Mar 2026 | 2.0 |
| User Roles | ✅ Complete | Mar 2026 | 2.0 |
| Features | ✅ Complete | Mar 2026 | 2.0 |
| API Endpoints | ✅ Complete | Mar 2026 | 2.0 |
| Authentication | ✅ Complete | Mar 2026 | 2.0 |
| Architecture | ✅ Complete | Mar 2026 | 2.0 |
| Deployment | ✅ Complete | Mar 2026 | 2.0 |
| Troubleshooting | ✅ Complete | Mar 2026 | 2.0 |
| Admin Setup | ✅ Complete | Mar 2026 | 2.0 |
| User Management | ✅ Complete | Mar 2026 | 2.0 |

---

## 🎯 Documentation Goals

- ✅ **Complete:** Cover all features and use cases
- ✅ **Clear:** Written for different audiences
- ✅ **Accessible:** Easy to search and navigate
- ✅ **Up-to-date:** Version-controlled with code
- ✅ **Professional:** Production-ready quality

---

## 📞 Support

**Questions about documentation?**
1. Check FAQ sections
2. Search existing docs
3. Report missing docs as GitHub issue
4. Contact maintainers

**Found an error?**
1. Report as GitHub issue
2. Or submit a pull request with fix

---

## 📄 License

Documentation is part of MessWala project.
See [LICENSE](../LICENSE) for details.

---

**Last Updated:** March 17, 2026  
**Version:** 2.0  
**Status:** ✅ Production Ready

---

## 🚀 Getting Started

**First time here?** Start with [index.md](index.md)

**Already know what you need?** See [Quick Links](#quick-links) above.

**Want to set up MessWala?** Go to [Deployment Setup](deployment/setup.md)
