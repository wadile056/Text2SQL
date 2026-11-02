# Text2SQL

Type an instruction in English, get a MySQL query. Recent queries are saved in MySQL.

## Files
| File | Purpose |
|---|---|
| `server.js` | Backend: Express + Gemini AI + MySQL |
| `public/index.html` | Page layout |
| `public/style.css` | Design |
| `public/script.js` | Browser logic |

## Run
```
npm install
copy .env.example .env     (Mac/Linux: cp .env.example .env)
```
Fill in `.env` (Gemini key + MySQL password), then:
```
npm start
```
Open http://localhost:3000
