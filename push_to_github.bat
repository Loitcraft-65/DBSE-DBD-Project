@echo off
title Pushing ExpenseSplitter to GitHub
cd /d C:\Anti\ExpenseSplitter
echo =======================================================
echo   Pushing ExpenseSplitter to GitHub repository:
echo   https://github.com/Loitcraft-65/DBSE-DBD-Project
echo =======================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo =======================================================
    echo   SUCCESS! All files uploaded to GitHub successfully!
    echo =======================================================
) else (
    echo =======================================================
    echo   Push encountered an error. Please check your GitHub login above.
    echo =======================================================
)
echo.
pause
