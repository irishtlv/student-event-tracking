# פריסה אוטומטית ל-GitHub Pages — הכי פשוט

מה עושים?
1) יוצרים ריפו ריק ב-GitHub.
2) מעלים את כל התיקיות/קבצים (כולל `.github/workflows/`).
3) Settings → Pages → ודאו שה-Source הוא **GitHub Actions**.

מה קורה לבד?
- GitHub בונה ומפרסם את האתר לכל Push ל-main.
- הכתובת: `https://USERNAME.github.io/REPO_NAME/`

הערות:
- אם יש React Router מומלץ HashRouter כדי למנוע 404.
- אין חובה לשנות `vite.config.ts` — הוורקפלואו מוסיף `--base="/REPO_NAME/"` בזמן Build.