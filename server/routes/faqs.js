const express = require('express');
const {
    getAllFaqs,
    addFaq,
    deleteFaq
} = require('../controllers/faqsController')

const router = express.Router();
const authenticateRequest = require('../middleware/authorize');

// JSON WEB TOKEN validation. If valid only then subsequent routes are invoked and access to controller functions is granted.
router.use(authenticateRequest);

// GET all faqs
router.get('/', getAllFaqs);

// POST a new faq
router.post('/', addFaq)

// DELETE a faq
router.delete('/:id', deleteFaq);

module.exports = router