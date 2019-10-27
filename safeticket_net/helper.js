'use strict'

const path = require('path');
const util = require('util');

const hfc = require('fabric-client');

//dongjun : remove username at parameter
async function getClientForOrg(userorg,username) {
	// get a fabric client loaded with a connection profile for this org
	console.log('getClientForOrg - ****** START %s %s', userorg, username);
	let config = '-connection-profile-path';

	//build a client context and load it with a connection profile
	//lets only load the network settings and save the client for later
	let client = hfc.loadFromConfig(hfc.getConfigSetting('network'+config));

	// This will load a connection profile over the top of the current one one
	// since the first one did not have a client section and the following one does
	// nothing will actually be replaced.
	// This will also set an admin identity because the organization defined in the
	// client section has one defined
    
    client.loadFromConfig(hfc.getConfigSetting(userorg+config));

	// this will create both the state store and the crypto store based
	// on the settings in the client section of the connection profile
	
    await client.initCredentialStores();
	
	// The getUserContext call tries to get the user from persistence.
	// If the user has been saved to persistence then that means the user has
	// been registered and enrolled. If the user is found in persistence
	// the call will then assign the user to the client object.
	
    
    if(username) {
		let user = await client.getUserContext(username, true);
		if(!user){
			throw new Error(util.format('User was not found :', username));
		} else {
			console.log('User %s was found to be registered and enrolled %s \n', username);
		}
	}
	
	//remove username at console.log 
	console.log('getClientForOrg - ****** END %s %s\n\n', username, userorg);
    

	return client;
}

// dongjun : Functions Based on CA
var getRegisteredUser = async function(username, userOrg, isJson) {
	
	try {
		
		var client = await getClientForOrg(userOrg);

		console.log('Successfully initialized the credential stores');
		// client can now act as an agent for organization Org1
		// first check to see if the user is already enrolled
		
		var user = await client.getUserContext(username, true);
		
		if (user && user.isEnrolled()) {
			console.log('Successfully loaded member from persistence');
		} else {
			// user was not enrolled, so we will need an admin user object to register
			console.log('User %s was not enrolled, so we will need an admin user object to register',username);
			var admins = hfc.getConfigSetting('admins');
			let adminUserObj = await client.setUserContext({username: admins[0].username, password: admins[0].secret});
			let caClient = client.getCertificateAuthority();
			let secret = await caClient.register({
				enrollmentID: username,
				affiliation: userOrg.toLowerCase() + '.department1'
			}, adminUserObj);
			console.log('Successfully got the secret for user %s',username);
			user = await client.setUserContext({username:username, password:secret});
			console.log('Successfully enrolled username %s  and setUserContext on the client object', username);
		}
		if(user && user.isEnrolled) {
			if(isJson && isJson == true) {
				var response = {
                    success: true,
					secret: user._enrollmentSecret,
                    message: username + ' enrolled Successfully',
				};
				return response;
			}
		} else {
			throw new Error('User was not enrolled');
		}
	} catch(error) {
		console.error('Failed to get registered user: %s with error: %s', username, error.toString());
		return 'failed ' + error.toString();
	}
};

var setupChaincodeDeploy = function() {
	process.env.GOPATH = path.join(__dirname, hfc.getConfigSetting('CC_SRC_PATH'));
};


exports.getClientForOrg = getClientForOrg;
exports.setupChaincodeDeploy = setupChaincodeDeploy;
exports.getRegisteredUser = getRegisteredUser;