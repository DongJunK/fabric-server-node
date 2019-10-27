var express = require('express');
var router = express.Router();

/* POST home page. */
router.post('/',async function(req, res) {
    res.send("users");
});

module.exports = router;
