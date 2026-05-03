# Team Task Manager (TTM)
Professional Jira-style task management app with drag-drop Kanban, projects, RBAC.

## ✨ Features
- **Kanban Board**: Drag-drop tasks across TODO/In Progress/Done/Blocked
- **Projects**: Create/manage projects, add/remove members (Admin/Member roles)
- **Tasks**: Title/desc/priority/assignee/due date/status
- **Dashboard**: Stats, search/filter, responsive table/board views
- **Auth**: JWT login/signup with bcrypt
- **Glassmorphism UI**: Modern dark theme w/ gradients, hovers, animations

## 🛠 Tech Stack
```
Frontend: React 18 + Vite + Tailwind-inspired CSS
Backend: Node.js + Express + Prisma + PostgreSQL
Auth: JWT + bcrypt
Validation: Zod
Deployment: Railway/Vercel ready
```

## 📁 Project Structure
```
d:/TTM/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Dashboard/Kanban/Task forms
│   │   ├── api.js         # API client
│   │   └── styles.css     # Glassmorphism UI
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express API
│   ├── prisma/schema.prisma # User/Project/Task models
│   ├── src/
│   │   ├── routes/        # auth/projects/tasks
│   │   ├── middleware/auth.js # JWT
│   │   ├── utils/         # Prisma/Zod validators
│   │   └── index.js       # Server entry
│   └── package.json
├── package.json            # Root concurrent dev
└── README.md
```

## 🚀 Local Setup
1. **DB**: PostgreSQL, set `DATABASE_URL` in `.env`
```
cd server
npx prisma db push
npx prisma generate
```
2. **Install**:
```
npm install-all
```
3. **Dev** (both client:5173 + server:4000):
```
npm run dev
```

## 🌐 Production
- **Railway**: `railway up`, set `DATABASE_URL`
- **Frontend**: `npm run build`, deploy `/client/dist`
- **API base**: Update `client/src/api.js` → your domain

## 🔧 Scripts
```bash
# Client
npm run dev    # http://localhost:5173
npm run build  # dist/

# Server
npm run dev    # nodemon http://localhost:4000
npm run start  # production
npx prisma db push  # migrate schema

# Root
npm run dev    # concurrent both
```

## 📱 API Endpoints
```
POST /api/auth/login     # {email, password}
POST /api/auth/signup    # {name, email, password}
GET  /api/projects       # user's projects
POST /api/projects       # {name, description}
GET  /api/tasks          # user's tasks
POST /api/tasks          # {title, projectId, ...}
PATCH /api/tasks/:id     # {status}
```

## 🎨 UI Features
- **Responsive**: Mobile/tablet/desktop
- **Dark Glassmorphism**: Gradients, blur, shadows
- **Drag-Drop**: Native HTML5 Kanban
- **Search/Filter**: By title/project/status
- **Animations**: Hover lifts, progress bars

## 🗄 Database Schema (Prisma)
```prisma
User → Project (owner/members) → Task (assignee)
TaskStatus: TODO | IN_PROGRESS | DONE | BLOCKED
Role: ADMIN | MEMBER
Priority: LOW | MEDIUM | HIGH
```

## 🤝 Contributing
1. Fork & clone
2. `npm install-all`
3. Create feature branch
4. PR to `main`

## 📄 License
MIT
