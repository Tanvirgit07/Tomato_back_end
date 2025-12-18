const express = require('express');
const { adminDashbaordCards, dashboardRevenueChart, topCategoryProductChartAdminDashbard } = require('../../controllers/dashboardSummeryController/dashboardSummerycontroller');

const summeryRoute = express.Router();

summeryRoute.get('/admin-top-summery-cards', adminDashbaordCards);
summeryRoute.get('/admin-revenue-summery',dashboardRevenueChart);





module.exports = summeryRoute;