import express from 'express'
import { verifyToken } from '../middlewares/verfiyToken.js';
import { createPayment } from '../controllers/payment.controller.js';
const router = express.Router()


router.post('/create-checkout-session',verifyToken,createPayment);

export default router