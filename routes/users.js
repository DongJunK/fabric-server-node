var express = require('express');
var router = express.Router();
var helper = require('./helper.js');

var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');

// set secret variable


router.use(expressJWT({
	secret: 'thisismysecret'
}).unless({
	path: ['/users']
}));

router.use(bearerToken());
router.use(function(req, res, next) {
	console.log(' ------>>>>>> new request for %s',req.originalUrl);
	if (req.originalUrl.indexOf('/users') >= 0) {
		return next();
	}

	var token = req.token;
	jwt.verify(token, app.get('secret'), function(err, decoded) {
		if (err) {
			res.send({
				success: false,
				message: 'Failed to authenticate token. Make sure to include the ' +
					'token returned from /users call in the authorization header ' +
					' as a Bearer token'
			});
			return;
		} else {
			// add the decoded user name and org name to the request object
			// for the downstream code to use
			req.username = decoded.username;
			req.orgname = decoded.orgName;
			console.log(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
			return next();
		}
	});
});

/* POST home page. */
router.post('/',async function(req, res) {
    var username = req.body.username;
	var orgName = req.body.orgName;
	console.log('End point : /users');
	console.log('User name : ' + username);
	console.log('Org name  : ' + orgName);
	if (!username) {
		res.json(getErrorMessage('\'username\''));
		return;
	}
	if (!orgName) {
		res.json(getErrorMessage('\'orgName\''));
		return;
	}
	var token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
		username: username,
		orgName: orgName
	}, router.get('secret'));
	let response = await helper.getRegisteredUser(username, orgName, true);
	console.log('-- returned from registering the username %s for organization %s',username,orgName);
	if (response && typeof response !== 'string') {
		console.log('Successfully registered the username %s for organization %s',username,orgName);
		response.token = token;
		res.json(response);
	} else {
		console.log('Failed to register the username %s for organization %s with::%s',username,orgName,response);
		res.json({success: false, message: response});
	}
});

module.exports = router;
