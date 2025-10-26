import { Router } from "express";
import * as catController from "../controllers/categoryController.js"
const categoryRouter = Router();

categoryRouter.get("/", async (req, res) => {
    const categories = await catController.getAllCategories();
    if (!categories) {
        res.render("viewCategories", { categories: [] });
    }
    res.render("viewCategories", { categories });

})

categoryRouter.get("/create", (req, res) => {
    res.render("categoryCreate", { category: false, update: false });
})

categoryRouter.get("/updateCat/:id", async (req, res) => {
    const { id } = req.params;
    const category = await catController.getCategory(id);
    if (!category) {
        throw new Error(`Category with id ${id} not found.`);
    }
    res.render("categoryCreate", { category, update: true });
})
categoryRouter.post("/create", async (req, res) => {
    const { name } = req.body;
    await catController.createCategory(name);
    res.redirect("/categories");
})

categoryRouter.get("/dropCat/:id", async (req, res) => {
    const { id } = req.params;
    await catController.dropCategory(id);
    res.redirect("/categories");
})

categoryRouter.post("/updateCat/:id", async (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    await catController.updateCategory(name = name, id = id);
    redirect("/categories");
}
)

export default categoryRouter;