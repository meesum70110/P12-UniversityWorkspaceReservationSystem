const express = require('express');
const {
    getAllCourses,
    addCourse,
    deleteCourse
} = require('../controllers/coursesController')

const router = express.Router();
const authenticateRequest = require('../middleware/authorize');

// JSON WEB TOKEN validation. If valid only then subsequent routes are invoked and access to controller functions is granted.
router.use(authenticateRequest);

// GET all courses
router.get('/', getAllCourses);

// POST a new course
router.post('/', addCourse)

// DELETE a course
router.delete('/:id', deleteCourse);

module.exports = router