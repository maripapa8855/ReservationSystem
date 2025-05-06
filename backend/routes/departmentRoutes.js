const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

// 診療科一覧取得（クエリで facility_id 指定が可能）
router.get('/', departmentController.getAllDepartments);

// 診療科登録（POST）
router.post('/', departmentController.createDepartment);

// 診療科削除（DELETE）
router.delete('/:id', departmentController.deleteDepartment);

module.exports = router;
