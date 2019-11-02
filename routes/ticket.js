var express = require('express');
var query = require('../safeticket_net/query');
var invoke = require('../safeticket_net/invoke');
var router = express.Router();


/* GET ticket query. */
router.get('/', async function(req, res) {
	let args = req.query.args;
	let fcn = req.query.fcn;
	let peer = req.query.peer;
	if(!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if(!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}
	args = args.replace(/'/g, '"');
	args = JSON.parse(args);
	
	let message = await query.queryChaincode(peer, args, fcn);
	res.send(message);
});

/* POST ticket query, invoke */
router.post('/', async function(req, res) {
    var peer = req.body.peer;
    var fcn = req.body.fcn;
	var args = req.body.args;
	
	console.log("peers = ",peer);
	console.log("fcn = ",fcn);
	console.log("args = ",args);

	if (!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}
	
	let message = await invoke.invokeChaincode(peer,fcn,args);
    res.send(message);
});


module.exports = router;
