// Catch-all Vercel function for /api/*, delegating to the built Express app (requires `npm run build:api` first).
import { app } from "../api-dist/app.js";

export default app;
