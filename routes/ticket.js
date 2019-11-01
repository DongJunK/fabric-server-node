var express = require('express');
var query = require('../safeticket_net/query');
var invoke = require('../safeticket_net/invoke');
var router = express.Router();

/* GET users listing. */
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


	let message = await query.queryChaincode(peer, args, fcn, req.username, req.orgname);
	res.send(message);
	
});

/* POST buy ticket */
router.post('/', async function(req, res) {
    console.log('==================== INVOKE ON CHAINCODE ==================');
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
	
	let message = await invoke.invokeChaincode(peer,fcn,args, req.body.username, req.body.orgname);
    res.send(message);
});

/* PUT delete ticket */
router.delete('/',(req, res, next) =>{
	res.send('DeleteTicket');

	/*
		send to Blockchain Network using Fabric-sdk
	*/
});

module.exports = router;
