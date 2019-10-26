/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
var util = require('util');
var helper = require('./helper.js');


var queryChaincode = async function(peer, channelName, chaincodeName, args, fcn, username, orgname) {
	let client = null;
	let channel = null;
    let user_name = username;
    let org_name = orgname;
    try {
		// first setup the client for this org
		// dongjun : remove username at getClientForOrg function parameter
	    client = await helper.getClientForOrg(org_name,user_name);
		
		//client.setAdminSigningIdentity(private_key, certificate, mspid);

		console.log('Successfully got the fabric client for the organization "%s %s"', org_name, user_name);

		
		channel = client.getChannel(channelName);
        
        if(!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			console.error(message);
			throw new Error(message);
		}

		// send query
		var request = {
			targets : [peer], //queryByChaincode allows for multiple targets
			chaincodeId: chaincodeName,
			fcn: fcn,
			args: args,
			txId: client.newTransactionID(true)
		};

		let response_payloads = await channel.queryByChaincode(request);
		if (response_payloads) {
			for (let i = 0; i < response_payloads.length; i++) {
				console.log(args[0]+' now has ' + response_payloads[i].toString('utf8') +
					' after the move');
			}
			return args[0]+' now has ' + response_payloads[0].toString('utf8') +
				' after the move';
		} else {
			console.error('response_payloads is null');
			return 'response_payloads is null';
		}
	} catch(error) {
		console.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	} finally {
		if (channel) {
			channel.close();
		}
	}
};
var getBlockByNumber = async function(peer, channelName, blockNumber, username, org_name) {
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
		console.log('Successfully got the fabric client for the organization "%s"', org_name);
		var channel = client.getChannel(channelName);
		if(!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			console.error(message);
			throw new Error(message);
		}

		let response_payload = await channel.queryBlock(parseInt(blockNumber, peer));
		if (response_payload) {
			console.log(response_payload);
			return response_payload;
		} else {
			console.error('response_payload is null');
			return 'response_payload is null';
		}
	} catch(error) {
		console.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	}
};
var getTransactionByID = async function(peer, channelName, trxnID, username, org_name) {
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
		console.log('Successfully got the fabric client for the organization "%s"', org_name);
		var channel = client.getChannel(channelName);
		if(!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			console.error(message);
			throw new Error(message);
		}

		let response_payload = await channel.queryTransaction(trxnID, peer);
		if (response_payload) {
			console.log(response_payload);
			return response_payload;
		} else {
			console.error('response_payload is null');
			return 'response_payload is null';
		}
	} catch(error) {
		console.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	}
};
var getBlockByHash = async function(peer, channelName, hash, username, org_name) {
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
		console.log('Successfully got the fabric client for the organization "%s"', org_name);
		var channel = client.getChannel(channelName);
		if(!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			console.error(message);
			throw new Error(message);
		}

		let response_payload = await channel.queryBlockByHash(Buffer.from(hash,'hex'), peer);
		if (response_payload) {
			console.log(response_payload);
			return response_payload;
		} else {
			console.error('response_payload is null');
			return 'response_payload is null';
		}
	} catch(error) {
		console.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	}
};
var getChainInfo = async function(peer, channelName, username, org_name) {
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
		console.log('Successfully got the fabric client for the organization "%s"', org_name);
		var channel = client.getChannel(channelName);
		if(!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			console.error(message);
			throw new Error(message);
		}

		let response_payload = await channel.queryInfo(peer);
		if (response_payload) {
			console.log(response_payload);
			return response_payload;
		} else {
			console.error('response_payload is null');
			return 'response_payload is null';
		}
	} catch(error) {
		console.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	}
};
//getInstalledChaincodes
var getInstalledChaincodes = async function(peer, channelName, type, username, org_name) {
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
		console.log('Successfully got the fabric client for the organization "%s"', org_name);

		let response = null
		if (type === 'installed') {
			response = await client.queryInstalledChaincodes(peer, true); //use the admin identity
		} else {
			var channel = client.getChannel(channelName);
			if(!channel) {
				let message = util.format('Channel %s was not defined in the connection profile', channelName);
				console.error(message);
				throw new Error(message);
			}
			response = await channel.queryInstantiatedChaincodes(peer, true); //use the admin identity
		}
		if (response) {
			if (type === 'installed') {
				console.log('<<< Installed Chaincodes >>>');
			} else {
				console.log('<<< Instantiated Chaincodes >>>');
			}
			var details = [];
			for (let i = 0; i < response.chaincodes.length; i++) {
				console.log('name: ' + response.chaincodes[i].name + ', version: ' +
					response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
				);
				details.push('name: ' + response.chaincodes[i].name + ', version: ' +
					response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
				);
			}
			return details;
		} else {
			console.error('response is null');
			return 'response is null';
		}
	} catch(error) {
		console.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	}
};
var getChannels = async function(peer, username, org_name) {
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
		console.log('Successfully got the fabric client for the organization "%s"', org_name);

		let response = await client.queryChannels(peer);
		if (response) {
			console.log('<<< channels >>>');
			var channelNames = [];
			for (let i = 0; i < response.channels.length; i++) {
				channelNames.push('channel id: ' + response.channels[i].channel_id);
			}
			console.log(channelNames);
			return response;
		} else {
			console.error('response_payloads is null');
			return 'response_payloads is null';
		}
	} catch(error) {
		console.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	}
};

exports.queryChaincode = queryChaincode;
exports.getBlockByNumber = getBlockByNumber;
exports.getTransactionByID = getTransactionByID;
exports.getBlockByHash = getBlockByHash;
exports.getChainInfo = getChainInfo;
exports.getInstalledChaincodes = getInstalledChaincodes;
exports.getChannels = getChannels;
