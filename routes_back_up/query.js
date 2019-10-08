const tape = require('tape');
const _test = require('tape-promise').default;
const test = _test(tape);
const e2eUtils = require('./e2eUtils.js');
const util = require('./util.js');
const chaincodeId = util.END2END.chaincodeId;

const fcn = 'query';
const args = ['a'];
let expectedResult = '300';
const targets = []; // empty array, meaning client will discover the peers
try {
	const result = e2eUtils.queryChaincode('org2', 'v0', targets, fcn, args, expectedResult, chaincodeId);
	if (result) {
		console.log('Successfully query chaincode on the channel');
	} else {
		console.log('Failed to query chaincode ');
	}
} catch (err) {
	console.log('Failed to query chaincode on the channel. ' + err.stack ? err.stack : err);
}


