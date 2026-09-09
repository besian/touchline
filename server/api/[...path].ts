// Catch-all Vercel function for /api/*, delegating to the built Express app (requires `npm run build` first).
import { app } from "../dist/app.js";

export default app;
