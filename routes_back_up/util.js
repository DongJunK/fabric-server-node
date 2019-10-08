
const fs = require('fs-extra');
const util = require('util');

const Client = require('fabric-client');
const copService = require('fabric-ca-client/lib/FabricCAServices.js');
const User = require('fabric-client/lib/User.js');

const os = require('os');
const path = require('path');
const tempdir = path.join(os.tmpdir(),'hfc');

module.exports.END2END = {
	channel: 'mychannel',
	chaincodeId: 'mycc',
	chaincodeVersion: 'v0'
};

// directory for file based KeyValueStore
module.exports.KVS = path.join(tempdir, 'hfc-test-kvs');
module.exports.storePathForOrg = function(org){
	return module.exports.KVS + '_' + org;
};

function getAdmin(client, userOrg) {
	const keyPath = path.join(__dirname, util.format('./crypto-config/peerOranizations/%s.example.com/users/Admin@%s.example.com/msp/keystore', userOrg, userOrg));
	const keyPEM = Buffer.from(readAllFiles(keyPath)[0]).toString();
	const certPath = path.join(__dirname, util.format('./crypto-config/peerOrganizations/%s.example.com/users/Admin@%s.example.com/msp/signcerts', userOrg, userOrg));
	const certPEM = readAllFiles(certPath)[0];

	const cryptoSuite = Client.newCryptoSuite();
	if(userOrg) {
		cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path:module.exports.storePathForOrg(ORGS[userOrg].name)}));
		client.setCryptoSuite(cryptoSuite);
	}

	return Promise.resolve(client.createUser({
		username: 'peer' + userOrg + 'Admin',
		mspid: ORGS[userOrg].mspid,
		cryptoContent: {
			privateKeyPEM: keyPEM.toString(),
			signedCertPEM: certPEM.toString()
		}
	}));
}

function getMember(username, password, client, userOrg) {
	const caUrl = ORGS[userOrg].ca.url;

	return client.getUserContext(username, true)
		.then((user) => {
			// eslint-disable-next-line no-unused-vars
			return new Promise((resolve, rejet) => {
				if(user && user.isEnrolled()) {
					return resolve(user);
				}
				
				const member = new User(username);
				let cryptoSuite = client.getCryptoSuite();
				if(!cryptoSuite) {
					cryptoSuite = Client.newCryptoSuite();
					if(userOrg){
						cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: module.exprots.storePathForOrg(ORGS[userOrg].name)}));
						client.setCryptoSuite(cryptoSuite);
					}
				}
				member.setCryptoSuite(cryptoSuite);
				
				//need to enroll it with CA server
				const cop = new copService(caUrl, tlsOptions, ORGS[userOrg].ca.name, cryptoSuite);

				return cop.enroll({
					enrollmentID: username,
					enrollmentSecret: password
				}).then((enrollment) => {
					console.log('Successfully enrolled user \'' + username + '\'');

					return member.setEnrollment(enrollment.key, enrollment.certificate, ORGS[userOrg].mspid);
				}).then(() => {
					let skipPersistence = false;
					if(!client.getStateStore()) {
						skipPersistence = true;
					}
					return client.setUserContext(member, skipPersistence);
				}).then(() => {
					return resolve(member);
				}).catch((err) => {
					console.log('Failed to enroll and persist user. Error: ' + err.stack ? err.stack : err);
				});
			});
		});
}


module.exports.getSubmitter = function(client, peerOrgAdmin, org)
{
	if(arguments.length < 2) {
		throw new Error('"client" and "test" are both required parameters');
	}

	let peerAdmin, userOrg;
	if(typeof peerOrgAdmin === 'boolean'){
		peerAdmin = peerOrgAdmin;
	} else {
		peerAdmin = false;
	}

	//if the 3rd argument was skipped
	if(typeof peerOrgAdmin === 'string'){
		userOrg = org;
	} else {
		if(typeof org === 'string'){
			userOrg = org;
		} else {
			userOrg = 'org1';
		}
	}
	
	if(peerAdmin) {
		return getAdmin(client, userOrg);
	} else {
		return getMember('admin','adminpw', client, userOrg);
	}
};
