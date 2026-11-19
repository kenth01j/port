# Dark Personal Portfolio

## Project structure

```text
my-portfolio/
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
├── render.yaml
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── portfolioController.js
│   ├── middleware/
│   │   └── verifyToken.js
│   ├── models/
│   │   ├── Admin.js
│   │   └── PortfolioData.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── portfolio.js
│   │   └── uploads.js
│   ├── uploads/              # uploaded images are stored locally
│   ├── .env                  # create locally; do not commit
│   ├── .env.example
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   └── PortfolioContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── Home.jsx
│   │   │   └── Resume.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── vite.config.js
```

## Local setup

Prerequisites: Node.js 20+ and a running MongoDB instance (local or hosted).

1. Install the backend and frontend dependencies:

   ```powershell
   npm --prefix backend install
   npm --prefix frontend install
   ```

2. Create `backend/.env` from `backend/.env.example`. For local MongoDB, the
   example URI is ready to use. Replace `JWT_SECRET` with a long, unique random
   value, and adjust `FRONTEND_URL` if the frontend uses a different origin.

   ```dotenv
   PORT=5173
   MONGODB_URI=mongodb://127.0.0.1:27017/personal-portfolio
   JWT_SECRET=use-a-long-unique-random-secret
   FRONTEND_URL=http://localhost:5173
   ```

   Express serves the API and runs the Vite frontend middleware in the same
   process, so the entire local app uses port `5173`.

3. Start the application from the project root:

   ```powershell
   npm.cmd run dev
   ```

   Open `http://localhost:5173`. On other shells, `npm run dev` also works.

4. Create the initial admin exactly once using Postman:

   - Method: `POST`
   - URL: `http://localhost:5173/api/auth/register`
   - Body: **raw** → **JSON**
   - Example:

     ```json
     {
       "username": "portfolio-admin",
       "password": "choose-a-unique-password-at-least-12-characters"
     }
     ```

   Registration is deliberately available only as a one-time bootstrap: the
   backend reserves a fixed admin document ID, so subsequent registration
   attempts are rejected. Keep the password and JWT secret private. Then visit
   `http://localhost:5173/admin` and sign in. Portfolio editing is available at
   `/admin/dashboard`.

   In the dashboard, choose multiple profile photos and select which one is the
   main photo before saving. Visitors see the main photo on the profile card; the
   other saved photos are revealed in the dropdown gallery after they open that
   photo.

## Deploying online

The Express app serves both the Vite-built frontend and API from one Node
service. Use MongoDB Atlas for the database. Configure persistent storage for
uploaded images; the default local upload directory may be ephemeral on a
hosted service.

### 1. Create a MongoDB Atlas database

1. Create an Atlas project and cluster, then create a database user with a
   strong, unique password.
2. In **Network Access**, allow connections from your backend host. If that
   host uses dynamic outbound IPs, its documented outbound IP ranges may be
   needed; only use `0.0.0.0/0` if necessary, with a strong database password.
3. Copy the Atlas connection string and replace the username/password
   placeholders. Use the `Portfolio` database name, for example:
   `mongodb+srv://USER:PASSWORD@YOUR-CLUSTER.mongodb.net/personal-portfolio`.
4. Migrate local data from Compass if you want to keep it. Export/import the
   `admins` and `portfoliodatas` collections into Atlas. Never put database
   credentials in frontend environment variables or commit them.

### 2. Deploy the full app to Render

1. In Render, create a **Blueprint** from this repository and select the root
   `render.yaml`. It installs dependencies from the lockfiles, builds the
   frontend, then starts the combined Express/Vite app from the repository root.
   The frontend build explicitly includes its development dependencies because
   Vite is required during the build.
2. Set these environment variables in the Render dashboard. Use your deployed
   service URL for both URL values:

   ```dotenv
   MONGODB_URI=<your Atlas connection string>
   FRONTEND_URL=https://<your-render-domain>
   BACKEND_PUBLIC_URL=https://<your-render-domain>
   ```

   The Blueprint generates `JWT_SECRET` automatically. Do not copy secrets into
   this repository; Render does not load the local `backend/.env` file.

   The service uses Render's `PORT` value in production. For durable uploads,
   attach a persistent disk and set `UPLOAD_DIR` to its mount path. Persistent
   disks may require a paid plan; without one, uploaded files can be lost when
   the service restarts or redeploys.

3. Visit the Render URL and verify `/api/health` returns `{"status":"ok"}`.
   The frontend, API, and client-side routes are all served from that same URL.

### 4. Preserve local data and uploaded images

The existing local MongoDB database is not automatically copied to Atlas.
Export/import its `admins` and `portfoliodatas` collections if you need that
content. Copy files from `backend/uploads/` to the persistent upload directory,
keeping the filenames. Keep admin credentials private and verify login against
the migrated database before removing any local data.

## API overview

- `GET /api/portfolio` — public portfolio data (creates an empty default record
  on first read).
- `PUT /api/portfolio` — update the hero, skills, project/certificate lists, or
  ATS resume text; requires a valid JWT in the `Authorization: Bearer` header.
- `POST /api/portfolio/projects` and `DELETE /api/portfolio/projects/:id` —
  project management; requires a token.
- `POST /api/portfolio/certificates` and
  `DELETE /api/portfolio/certificates/:id` — certificate management; requires
  a token.
- `POST /api/uploads` — upload a JPEG, PNG, WebP, or GIF image (maximum 5 MB)
  using multipart form field `image`; requires a token. The dashboard lets you
  pick profile, project, and certificate images directly from your device.
  Multiple profile images can be uploaded, with one selected as the public
  profile photo; the others appear in the photo gallery opened from that image.
- `POST /api/auth/login` — returns a 12-hour JWT.

Uploaded images are served from `/uploads` on the backend and stored in
`backend/uploads/`. Back up this folder along with your database when deploying
or moving the portfolio to another machine.
