import serverless from "serverless-http";
import { app } from "../../server.js"; // In module system we reference the js module or .ts depending on bundler. Let's use ESM compliant import path or just "../../serverts" or "../../server".

export const handler = serverless(app);
