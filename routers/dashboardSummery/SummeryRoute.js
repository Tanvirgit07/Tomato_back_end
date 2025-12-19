const express = require('express');
const { adminDashbaordCards, dashboardRevenueChart, topCategoryProductChart, orderStatusOverview } = require('../../controllers/dashboardSummeryController/dashboardSummerycontroller');
const { getSellerDashboardSummary } = require('../../controllers/dashboardSummeryController/sellerDashbordOverviewController');
const { verifyToken } = require('../../customMiddleWare/customMiddleWare');

const summeryRoute = express.Router();

summeryRoute.get('/admin-top-summery-cards', adminDashbaordCards);
summeryRoute.get('/admin-revenue-summery',dashboardRevenueChart);
summeryRoute.get('/admin-category-summery',topCategoryProductChart);
summeryRoute.get('/admin-orders-summery',orderStatusOverview);


summeryRoute.get('/seller-overview-cards',verifyToken, getSellerDashboardSummary);










module.exports = summeryRoute;