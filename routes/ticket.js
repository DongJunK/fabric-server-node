var express = require('express');
var invoke = require('../safeticket_net/invoke');
var query = require('../safeticket_net/query');
var router = express.Router();

const { Ticket_platform } = require('../models');

/* GET Inquiry one ticket info. */
router.get('/info', async function (req, res) { // ticket_code
	let ticket_code = req.query.ticket_code;
	let args = [ticket_code];
	let fcn = "queryOneTicket";
	if (!ticket_code) {
		res.send({ result:false, info:'', msg: 'Not exist request query ticket_code' });
		return;
	}
	try {
		let message = await query.queryChaincode(args, fcn);
		console.log(message);
		let result;
		let msg;
		if(message){
			result = true;
			msg = 'Success get info';
		}else{
			result = false;
			msg = 'Not exist ticket info';
		}
		res.send({ result: result, info: message, msg: msg });
	} catch (err) {
		console.error(err);
		res.send({ result:false, info:'', msg:err });
	}

});

/* GET Inquiry ticket list of one user. */
router.get('/list', async function (req, res) {
	let attendee_id = req.query.attendee_id;
	let args = [attendee_id];
	let fcn = "queryUserTickets";
	if (!attendee_id) {
		res.send({ result:false, list:'', msg: 'Not exist request query attendee_id' });
		return;
	}
	try {
		let message = await query.queryChaincode(args, fcn);
		console.log(message);
		let result;
		let msg;
		if(message.length==2){
			result = false;
			msg = 'Not exist ticket of user';
		}else {
			result = true;
			msg = 'Success get list';
		}
		res.send({ result: result, list: message, msg: msg });
	} catch (err) {
		console.error(err);
		res.send({ result:false, list:'', msg:err });
	}

});

/* POST buy ticket  */
router.post('/', async function (req, res) {
	const token = req.headers.authorization; // ticket sales platform authorization token
	const venue = req.body.venue; // ticket event venue
	const event_date = req.body.event_date; // ticket event date
	const event_time = req.body.event_time; // ticket event time
	const ticket_issuer = req.body.ticket_issuer; // Ticket sales platform name
	const payment_time = req.body.payment_time; // ticket payment time
	const event_name = req.body.event_name; // event_name of Purchased Ticket
	const attendee_id = req.body.attendee_id; // saficket user id
	const ticket_code = attendee_id + event_name + payment_time; // generate ticket code
	console.log(req.headers);
	const fcn = "createNewTicket"; // blockchain buy ticket function name
	const args =[ticket_code, attendee_id, event_name, venue, event_date, event_time, ticket_issuer]; // buy ticket request arguments

	try {
		if (!token) {
			res.send({ result:false, msg: 'Not exist request header authorization' });
			return;
		}

		//Whether exist token
		const ticket_platform = await Ticket_platform.findOne({ where: { token: token } });

		if (!ticket_platform) {
			res.send({ result:false, msg: 'Invalid Token' });
			return;
		}
		if (!venue) {
			res.send({ result:false, msg: 'Not exist request body venue' });
			return;
		}
		if (!event_date) {
			res.send({ result:false, msg: 'Not exist request body event_date' });
			return;
		}
		if (!event_time) {
			res.send({ result:false, msg: 'Not exist request body event_time' });
			return;
		}
		if (!ticket_issuer) {
			res.send({ result:false, msg: 'Not exist request body ticket_issuer' });
			return;
		}
		if (!payment_time) {
			res.send({ result:false, msg: 'Not exist request body payment_time' });
			return;
		}
		if (!event_name) {
			res.send({ result:false, msg: 'Not exist request body event_name' });
			return;
		}
		if (!attendee_id) {
			res.send({ result:false, msg: 'Not exist request body attendee_id' });
			return;
		}
		console.log(args);
		let message = await invoke.invokeChaincode(args,fcn);
		res.send({ result: message.success, msg: 'Success buy ticket' }); // result string to boolean 
	} catch (err) {
		console.error(err);
		res.send({ result:false, msg: err });
	}

});

/* DELETE ticket at blockchain*/
router.post('/deletion', async function (req, res) {
	let token = req.headers.authorization; // ticket sales platform authorization token
	let payment_time = req.body.payment_time; // ticket payment time
	let event_name = req.body.event_name; // event_name of Purchased Ticket
	let attendee_id = req.body.attendee_id; // saficket user id
	let ticket_code = attendee_id + event_name + payment_time; // generate ticket code
	let args = "[\"" + ticket_code + "\"]";
	let fcn = "deleteTicket";
	try {
		if(!token){
			res.send({ result:false, msg: 'Not exist request header authorization' });
			return;
		}
		//Whether exist token
		const ticket_platform = await Ticket_platform.findOne({ where: { token: token } });

		if (!ticket_platform) {
			res.send({ result:false, msg: 'Invalid Token' });
			return;
		}

		if(!payment_time) {
			res.send({ result:false, msg: 'Not exist request body payment_time' });
			return;
		}
		if(!event_name) {
			res.send({ result:false, msg: 'Not exist request body event_name' });
			return;
		}
		if(!attendee_id) {
			res.send({ result:false, msg: 'Not exist request body attendee_id' });
			return;
		}


		let message = await invoke.invokeChaincode(args, fcn);
		console.log(message);
		res.send({ result: message.success, msg: 'Success delete ticket' }); // result string to boolean 
	} catch (err) {
		console.error(err);
		res.send({ result:false, msg: err });
	}
});

module.exports = router;
