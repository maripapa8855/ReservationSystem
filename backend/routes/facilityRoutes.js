// /backend/routes/facilityRoutes.js
const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facilityController');

// 管理者ごとの施設取得（先に書くことで :id との衝突を防ぐ）
router.get('/by-admin', facilityController.getFacilityByAdmin);

// 全施設取得（こちらも固定パスなので優先）
router.get('/', facilityController.getAllFacilities);

// group_id + facility_id で施設取得（controller側に一元化）
router.get('/:id', facilityController.getFacilityById);

module.exports = router;
