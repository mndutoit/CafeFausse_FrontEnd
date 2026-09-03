To Run the UI:

Step 1 — Install Node.js

If you don't have it already, download and install Node.js from nodejs.org (choose the LTS version).

Verify it's installed by opening a terminal and running:

node --version
npm --version


Step 2 — Install pnpm

This project uses pnpm as its package manager:

npm install -g pnpm


Step 3 — Install project dependencies

In your terminal, navigate to the project folder and run:

cd path/to/cafe-fausse
pnpm install
This reads package.json and downloads all the required libraries into a node_modules folder.

Step 4 — Start the development server

pnpm dev
You should see output like:

  VITE v8.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
Open http://localhost:5173 in your browser and the site will appear.

Step 5 — Connect to the Flask backend

Make sure your .env file exists in the project root:

VITE_API_BASE_URL=http://localhost:5000/api
Then run your Flask backend separately in another terminal window. The frontend and backend run as two separate processes side by side.

To build for production (when you're ready to deploy):
- pnpm build
This creates a dist/ folder of plain HTML/CSS/JS that any web host can serve.

