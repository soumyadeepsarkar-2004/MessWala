# GitHub Pages Configuration

This file documents the GitHub Pages setup for MessWala documentation.

## Configuration

**Repository:** soumyadeepsarkar-2004/MessWala  
**Source:** `/docs` folder  
**Branch:** main  
**URL:** https://soumyadeepsarkar-2004.github.io/MessWala/

## Setup Steps

### 1. Enable GitHub Pages

1. Go to Repository Settings → Pages (in sidebar)
2. **Source:** Deploy from a branch
3. **Branch:** main
4. **Folder:** /docs
5. Click **Save**

### 2. Verify Deployment

Check if pages are publishing:
- Go to Settings → Pages
- Look for "Your site is live at..." message
- Visit the URL to verify

### 3. Custom Domain (Optional)

To use a custom domain:
1. Go to Settings → Pages
2. Under "Custom domain", enter your domain
3. Follow DNS configuration steps

---

## Publishing Workflow

### Automatic Publishing

✅ **Automatic** — No manual steps needed!

```
You push docs/
    ↓
GitHub Actions runs
    ↓
MkDocs builds site
    ↓
Deploys to GitHub Pages
    ↓
Live in ~1-2 minutes
```

### Manual Build

If needed, you can manually build:

```bash
# Install MkDocs
pip install mkdocs-material

# Build locally
cd docs
mkdocs build
# Creates docs/site/ folder

# Deploy to GitHub Pages
mkdocs gh-deploy
```

---

## Site Structure

GitHub Pages serves files from `/docs` folder:

```
docs/
├─ index.md          → https://.../MessWala/
├─ guides/
│  └─ getting-started.md  → https://.../MessWala/guides/getting-started/
├─ api/
│  └─ endpoints.md   → https://.../MessWala/api/endpoints/
└─ mkdocs.yml        (Navigation & config)
```

MkDocs automatically:
- Converts `.md` to `.html`
- Builds navigation
- Creates search index
- Generates pretty URLs

---

## Troubleshooting

### Pages Not Publishing

**Check:**
1. Go to Settings → Pages
2. Verify source is set to `/docs`
3. Check GitHub Actions workflow status
4. Look at workflow logs for errors

### Old Content Still Showing

**Clear cache:**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or open in private/incognito mode

### Build Failures

**Check workflow logs:**
1. Go to Actions tab
2. Click "Deploy Docs to GitHub Pages"
3. Find failed run
4. Click "Logs" to see errors
5. Common issues:
   - `mkdocs` not installed (add to workflow)
   - Markdown syntax error (fix in docs)
   - Missing file referenced (check links)

---

## Environment Setup

**Required files:**
- ✅ `docs/mkdocs.yml` — Site configuration
- ✅ `docs/index.md` — Home page
- ✅ `.github/workflows/deploy-docs.yml` — Auto-deploy workflow
- ✅ All markdown files in `docs/` subfolders

**GitHub Pages settings:**
- ✅ Source: Branch > main > /docs
- ✅ Enforce HTTPS (recommended)
- ✅ Custom domain (optional)

---

## Performance

**Current metrics:**
- Build time: ~30 seconds
- Site size: ~2 MB
- Page load: <1 second
- Search: Real-time

---

## Security

**GitHub Pages security:**
- ✅ HTTPS enforced
- ✅ No sensitive data in docs
- ✅ Read-only public content
- ✅ No credentials/secrets exposed

---

## Monitoring

Check deployment status:
- Visit: https://github.com/soumyadeepsarkar-2004/MessWala/actions
- Filter: "Deploy Docs to GitHub Pages"
- See latest build status
- View logs if failed

---

## Further Reading

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [MkDocs Documentation](https://www.mkdocs.org/)
- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)

---

**Status:** ✅ Configured and Live  
**Last Updated:** March 17, 2026
