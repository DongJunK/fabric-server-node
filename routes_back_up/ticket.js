const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/lookticket/:id/:txInfo', function(req, res, next) {
	const ticketTxInfo = {
		id : req.parmas.id,
		txInfo : req.parmas.txInfo,
	};
	res.send(ticketTxInfo);
	/*
		send to Blockchain Network using Fabric-sdk
	*/
});

/* POST buy ticket */
router.post('/buyticket', (req, res, next) =>{
    res.send('BuyTicket');

	/*
		send to Blockchain Network using Fabric-sdk
	*/
});

/* PUT modify ticket info */
router.put('/modifyticket', (req, res, next)=> {
    res.send('ModifyTicket');

	    /*
		    send to Blockchain Network using Fabric-sdk
		*/
});

/* PUT delete ticket */
router.delete('/deleteticket',(req, res, next) =>{
	res.send('DeleteTicket');

	/*
		send to Blockchain Network using Fabric-sdk
	*/
});

module.exports = router;
