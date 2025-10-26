import { Router } from "express";
import * as itemController from "../controllers/itemController.js"
import * as categoryController from "../controllers/categoryController.js"
import { body, validationResult } from "express-validator";
import CustomNotFoundError from "../errors/customerror.js";
const itemRouter = Router();

itemRouter.get("/", async (req, res) => {
    const { categories } = req.query;
    const page = Number(req.query.page) || 1;
    let items;
    let cats;
    if (categories) {
        const catIds = categories.split(",").map(id => Number(id.trim()));
        items = await itemController.searchByCat(catIds, page);
    } else {
        items = await itemController.getAllItems(page);
    }
    cats = await categoryController.getAllCategories();
    let disable;
    if (items.length < 10) {
        disable = true;
    } else {
        disable = false;
    }
    if (items.length === 0 && page > 1) {
        return res.redirect(`/?page=${page - 1}${categories ? `&categories=${categories}` : ""}`);
    }
    res.render("index", { items, categories: cats, page, disable, query: req.query });

});

itemRouter.get("/create", async (req, res) => {
    const categories = await categoryController.getAllCategories();
    res.render("itemCreate", { item: false, categories, update: false, errors: [] });
});

itemRouter.get("/item/:id", async (req, res) => {
    const { id } = req.params;
    const item = await itemController.getItem(id);
    if (item === undefined) {
        throw new CustomNotFoundError(`Item with id ${id} not found.`);
    }
    res.render("viewItem", { item });
});



itemRouter.post("/create", [
    body("name").notEmpty().withMessage("Name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be a number greater than 0"),
    body("img").isURL().withMessage("Image must be a valid URL"),
    body("mainCatId").notEmpty().withMessage("Main category is required"),
    body("sideCatIds").custom((value, { req }) => {
        const mainCatId = req.body.mainCatId;
        let sideCatIds = value || [];
        if (!Array.isArray(sideCatIds)) {
            sideCatIds = [sideCatIds];
        }
        if (sideCatIds.includes(mainCatId)) {
            throw new Error("Side categories cannot include the main category");
        }
        return true;
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const categories = await categoryController.getAllCategories();
        console.log(errors.array());
        return res.status(400).render("itemCreate", {
            item: req.body,
            categories,
            update: false,
            errors: errors.array()
        });
    }
    const { name, description, price, img, mainCatId } = req.body;
    let sideCatIds = req.body.sideCatIds || [];
    if (sideCatIds && !Array.isArray(sideCatIds)) {
        sideCatIds = [sideCatIds];
    }
    const catIds = [Number(mainCatId), ...sideCatIds.filter(id => id !== "" && id !== Number(mainCatId)).map(id => Number(id))];
    await itemController.createItem(name, description, price, img, catIds);
    res.redirect("/");
});

itemRouter.get("/dropItem/:id", async (req, res) => {
    const { id } = req.params;
    await itemController.dropItem(id);
    res.redirect("/");
});
itemRouter.get("/update/:id", async (req, res) => {
    const { id } = req.params;
    const item = await itemController.getItem(id);
    if (item === undefined) {
        throw new CustomNotFoundError(`Item with id ${id} not found.`);
    }
    const categories = await categoryController.getAllCategories();
    res.render("itemCreate", { item, categories: categories, update: true, errors: [] });
});

itemRouter.post("/update/:id", [
    body("name").notEmpty().withMessage("Name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be a number greater than 0"),
    body("img").isURL().withMessage("Image must be a valid URL"),
    body("mainCatId").notEmpty().withMessage("Main category is required"),
    body("sideCatIds").custom((value, { req }) => {
        const mainCatId = req.body.mainCatId;
        let sideCatIds = value || [];
        if (!Array.isArray(sideCatIds)) {
            sideCatIds = [sideCatIds];
        }
        if (sideCatIds.includes(mainCatId)) {
            throw new Error("Side categories cannot include the main category");
        }
        return true;
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const categories = await categoryController.getAllCategories();
        return res.status(400).render("itemCreate", {
            item: { ...req.body, id: req.params.id },
            categories,
            update: true,
            errors: errors.array()
        });
    }
    const { id } = req.params;
    const { name, description, price, img, sideCatIds, mainCatId } = req.body;
    if (sideCatIds && !Array.isArray(sideCatIds)) {
        sideCatIds = [sideCatIds];
    }
    const catIds = [Number(mainCatId), ...sideCatIds.filter(catId => catId !== "" && catId !== Number(mainCatId)).map(catId => Number(catId))];
    await itemController.updateItem(name, description, price, img, catIds, id);
    res.redirect("/");
});

export default itemRouter;