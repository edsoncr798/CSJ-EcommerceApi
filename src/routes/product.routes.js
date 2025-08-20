import {Router} from "express";
import {
    getAllProducts, getConfectioneryProducts, getEssentialProducts,
    getNewProducts,
    getProductById,
    getProductsByCategory,
    searchProducts
} from "../controllers/products.controller.js";


const router = Router();

router.get('/products/essential', getEssentialProducts);
router.get('/products/confectionery', getConfectioneryProducts);
router.get('/products/category', getProductsByCategory);
router.get('/products/new', getNewProducts);
router.get('/products/search', searchProducts);

router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);

export default router;