import { Hono } from "hono";
import { analysisRoutes } from "./analysis";
import { authRoutes } from "./auth";
import { chatRoutes } from "./chat";
import { clausesRoutes } from "./clauses";
import { compareRoutes } from "./compare";
import { contractsRoutes } from "./contracts";
import { healthRoutes } from "./health";
import { reportsRoutes } from "./reports";

export const routes = new Hono();

routes.route("/auth", authRoutes);
routes.route("/contracts", contractsRoutes);
routes.route("/analysis", analysisRoutes);
routes.route("/clauses", clausesRoutes);
routes.route("/chat", chatRoutes);
routes.route("/reports", reportsRoutes);
routes.route("/compare", compareRoutes);
routes.route("/health", healthRoutes);
