// Every /api/* request is rewritten here (see vercel.json) with the original
// URL intact, so Express does its own routing from api-src/app.ts.
import { app } from "../api-src/app.js";

export default app;
