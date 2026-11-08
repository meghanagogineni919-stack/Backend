@echo off
echo ==============================================
echo Pushing Backend Lab 3 to GitHub...
echo ==============================================

git init
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/meghanagogineni919-stack/Backend.git
git add .
git commit -m "Complete Backend Lab 3 with server, database, and screenshots"
git push -u origin main

echo ==============================================
echo Done! Check https://github.com/meghanagogineni919-stack/Backend
echo ==============================================
pause

