# TaskForge

A full-stack project and task management application built with the MERN stack. Teams can create projects, manage tasks on a Kanban board, assign work to members, and track progress — all from a clean, responsive UI.

---

## Features

**Authentication**
- JWT-based auth stored in HTTP-only cookies
- Register as Admin or Member
- Protected routes with role-based access

**Projects**
- Admins can create, edit, and delete projects
- Add team members to projects via a member picker
- Progress bar calculated from completed tasks
- Filter by status (Active / On Hold / Completed) and search by name

**Tasks**
- Kanban board with four columns: Todo → In Progress → Review → Completed
- List view with status grouping as an alternative
- Priority levels: Low / Medium / High / Urgent
- Assign tasks to project members, set due dates
- Comment thread on each task
- Members can update task status; admins have full control

**Settings (Admin only)**
- Edit your own profile, email, and password
- Manage team members — change roles, remove users
- Danger Zone — bulk delete tasks or projects

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Zustand, React Router v7 |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Auth | JWT, bcryptjs, HTTP-only cookies |
| UI | Lucide React icons, date-fns, clsx, tailwind-merge |

---

## Project Structure

```
TaskForge/
├── backend/
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth & role middleware
│   ├── models/             # Mongoose schemas (User, Project, Task)
│   ├── routes/             # Express routers
│   ├── .env.example        # Environment variable template
│   └── server.js           # Entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/     # Layout, Navbar, Sidebar
│   │   │   └── ui/         # Button, Card, Input
│   │   ├── lib/            # axios instance, utils
│   │   ├── pages/          # Login, Register, Dashboard, Projects,
│   │   │                   # ProjectDetails, Tasks, Settings
│   │   └── store/          # Zustand stores (auth, project, task)
│   ├── .env.example
│   └── vite.config.js
│
├── .gitignore
├── package.json            # Root scripts
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local) or a [MongoDB Atlas](https://cloud.mongodb.com) cluster

### 1. Clone the repo

```bash
git clone https://github.com/your-username/taskforge.git
cd taskforge
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/taskforge
JWT_SECRET=your_long_random_secret_here
```

Install dependencies and start:

```bash
npm install
npm run dev
```

Backend runs at `http://localhost:5000`

### 3. Set up the frontend

```bash
cd ../frontend
cp .env.example .env
```

`frontend/.env` is already set for local dev:

```env
VITE_API_URL=http://localhost:5000/api
```

Install dependencies and start:

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login and set cookie |
| POST | `/logout` | Auth | Clear auth cookie |
| GET | `/me` | Auth | Get current user |

### Projects — `/api/projects`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Auth | Get all projects (members see only theirs) |
| GET | `/:id` | Auth | Get project by ID |
| POST | `/` | Admin | Create project |
| PUT | `/:id` | Admin | Update project |
| DELETE | `/:id` | Admin | Delete project + its tasks |
| DELETE | `/all` | Admin | Delete all projects + tasks |

### Tasks — `/api/tasks`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Auth | Get tasks (members see tasks in their projects) |
| POST | `/` | Admin | Create task |
| PUT | `/:id` | Auth | Update task (members can update status only) |
| DELETE | `/:id` | Admin | Delete task |
| DELETE | `/all` | Admin | Delete all tasks |
| POST | `/:id/comments` | Auth | Add comment to task |

### Users — `/api/users`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Auth | Get all users |
| PUT | `/profile` | Auth | Update own profile / password |
| PUT | `/:id/role` | Admin | Change a user's role |
| DELETE | `/:id` | Admin | Delete a user |

---

## Deployment

The backend serves the frontend build in production — only one service to deploy.

### Build

```bash
# From the repo root
npm run build    # builds frontend/dist
```

### Environment variables for production

Set these on your hosting platform (Render, Railway, etc.):

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskforge
JWT_SECRET=your_long_random_secret
PORT=5000
VITE_API_URL=/api
```

### Deploy on Render

1. Push the repo to GitHub
2. Create a **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repo
4. Set the following:

| Setting | Value |
|---|---|
| Build Command | `npm run build && cd backend && npm install` |
| Start Command | `npm start` |
| Environment | Add the variables above |

Render will give you a URL like `https://taskforge.onrender.com` — both frontend and API served from the same domain.

### Generate a secure JWT secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Role Permissions

| Action | Admin | Member |
|--------|-------|--------|
| View projects they belong to | ✅ | ✅ |
| View all projects | ✅ | ❌ |
| Create / edit / delete projects | ✅ | ❌ |
| Add members to projects | ✅ | ❌ |
| Create / delete tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ |
| Add comments | ✅ | ✅ |
| Manage users | ✅ | ❌ |
| Access Settings page | ✅ | ❌ |

---

## License

MIT
