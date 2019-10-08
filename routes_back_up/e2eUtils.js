const FabricCAServices = require('fabric-ca-client');
const utils = require('fabric-client/lib/utils.js');

const path = require('path');
const fs = require('fs');
const util = require('util');

const Client = require('fabric-client');
const info = require('./util.js');
const e2eUtils = require('./e2eUtils.js');

let ORGS;

let tx_id = null;
let the_user = null;

function init(){
    if(!ORGS){
	    Client.addConfigFile(path.join(__dirname,'./config.json'));
		ORGS = Client.getConfigSetting('first-network');
	}
}

function tlsEnroll(orgName) {
    return new Promise(((resolve, reject) =>{
		FabricCAServices.addConfigFile(path.join(__dirname,'config.json'));
		const orgs = FabricCAServices.getConfigSetting('first-network');
		if(!orgs[orgName]){
			throw new Error('Invalid org name: ' + orgName);
		}
		const fabricCAEndpoint = orgs[orgName].ca.url;
		const tlsOptions = {
			trustedRoots: [],
			verify: false
		};
		const caService = new FabricCAServices(fabricCAEndpoint, tlsOptions, orgs[orgName].ca.name);
		const req = {
			enrollmentID: 'admin',
			enrollmentSecret:' adminpw',
			profile: 'tls'
		};
		caService.enroll(req).then(
			(enrollment) =>{
				enrollment.key = enrollment.key.toBytes();
				return resolve(enrollment);
			},
			(err) =>{
				return reject(err);
			}
		);
	}));
}
module.exports.tlsEnroll = tlsEnroll;

function queryChaincode(org, version, targets, fcn, args, value, chaincodeId){
	init();
		
	Client.setConfigSetting('request-timeout',60000);
	const channel_name = Client.getConfigSetting('CHANNEL_NAME',info.END2END.channel);

	const client = new Client();
	const channel = client.newChannel(channel_name);

	const orgName = ORGS[org].name;
	const cryptoSuite = Client.newCryptoSuite();
	cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: info.storePathForOrg(orgName)}));
	client.setCryptoSuite(cryptoSuite);
	let tlsInfo = null;
	console.log('here');
	return e2eUtils.tlsEnroll(org)
		.then((enrollment) => {
			console.log('Successfully retrieved TLS certifiacte');
			tlsInfo = enrollment;
			client.setTlsClientCertAndKey(tlsInfo.certificate, tlsInfo.key);
	
			return Client.newDefaultKeyValueStore({path: info.storePathForOrg(orgName)});
		}).then((store) =>{
	`:		client.setStateStore(store);
			return info.getSubmitter(client, org);
		}).then((admin) => {
			the_user = admin;
			console.log('Successfully enrolled user \'admin\'');
			// set up the channel to use each org's 'peer1' for
			// both request and events
			for(const key in ORGS) {
				if(ORGS.hasOwnProperty(key) && typeof ORGS[key].peer1 !== 'undefined') {
					const data = fs.readFileSync(path.join(__dirname, ORGS[key].peer1.tls_cacerts));
	
					const peer = client.newPeer(
						ORGS[key].peer1.requests,
						{
							pem: Buffer.from(data).toString(),
							'ssl-target-name-override': ORGS[key].peer1['server-hostname']
						});
					channel.addPeer(peer);
				}
			}
	
			//send query
			const request = {
				chaincodeId : chaincodeId,
				fcn: fcn,
				args: args,
				request_timeout: 3000
			};
	
			// find the peers that match the targets
			if(targets && targets.length !== 0){
				const targetPeers = getTargetPeers(channel, targets);
				if(targetPeers.length < targets.length) {
					console.log('Failed to get all peers for targets: ' + targets);
				} else {
					request.targets = targetPeers;
				}
			}
			
			/*
			if(transientMap){
				request.transientMap = transientMap;
				request.fcn = 'testTransient';
			}
			*/
	
			return channel.queryByChaincode(request);
		},
		(err) =>{
			console.log('Failed to get submitter \'admin\'. Error: ' + err.stack ? err.stack : err);
			throw new Error('Failed to get submitter');
		}).then((response_payloads) => {
			if(response_payloads) {
				/*
				for (let i = 0; i < response_payloads.length; i++) {
					if (transientMap) {
						console.log(response_payload[i].toString(), transientMap)[0]].toString(),
						'Checking the result has the transientMap value returned by the chaincode');
					} else {
						
						if(value instanceof Error) {
							console.log((response_payloads[i] instanceof Error),query result should be an instance of error');
							console.log('Error message::' + response_payloads[i].message);
							console.log(response_payloads[i].message.includes(value.message),'error should contain the correct message: ' + value.message);
						} else {
							console.log(response_payloads[i].toString('utf8'),
							value,
							'checking query results are correct that value is ' + value);
						}
					}
				}
				*/
				return true;
			} else {
				console.log('response_payloads is null');
				throw new Error('Failed to get response on query');
			}
		},
		(err) => {
			console.log('Failed to send query due to error: ' + err.stack ? err.stack : err);
			throw new Error('Failed, got error on query');
		});
}

module.exports.queryChaincode = queryChaincode;
