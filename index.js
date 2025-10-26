import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import categoryRouter from "./routes/categoryRouter.js";
import itemRouter from "./routes/itemRouter.js";

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));
const PORT = 10000;

app.use("/categories", categoryRouter);
app.use("/", itemRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).render(`${err.statusCode === 404 ? '404' : '500'}`);
});
app.keepAliveTimeout = 61 * 1000;
app.headersTimeout = 65 * 1000;
app.listen(PORT, "0.0.0.0", (error) => {

    if (error) {
        throw error;
    }
    console.log(`My first Express app - listening on port ${PORT}! \n Click http://localhost:${PORT}/ to see it in action.`);
});