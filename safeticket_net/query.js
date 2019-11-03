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
var config = require('./config.json');

var queryChaincode = async function(args, fcn) {
	let client = null;
	let channel = null;
	let channelName = config.channel;
	let chaincodeName = config.chaincode;
    let userName = config.reqUserName;
	let orgName = config.reqOrg;
	let peer = config.org0peer;
    try {
		// first setup the client for this org
		// dongjun : remove username at getClientForOrg function parameter
	    client = await helper.getClientForOrg(orgName,userName);
		
		//client.setAdminSigningIdentity(private_key, certificate, mspid);

		console.log('Successfully got the fabric client for the organization "%s %s"', orgName, userName);

		
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
			args: args
		};
		let response_payloads = await channel.queryByChaincode(request);
		if (response_payloads) {
			for (let i = 0; i < response_payloads.length; i++) {
				console.log(response_payloads[i].toString('utf8'));
			}
			return response_payloads[0].toString('utf8');
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

exports.queryChaincode = queryChaincode;
