@echo off
git add .
git commit -m "Fix Nixpacks build by removing conflicting railway.toml and pushing root package-lock.json"
git push -u origin main
