@echo off
title ResumeBuddy Launcher
echo ==============================================
echo        Starting ResumeBuddy Web App...
echo ==============================================
echo.
cd /d "%~dp0"

echo Opening browser at http://localhost:5173 ...
start "" http://localhost:5173

echo Starting local dev server...
npm run dev
