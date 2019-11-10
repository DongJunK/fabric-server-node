var jwt = require('jsonwebtoken');
var helper = require('./helper');
var hfc = require('fabric-client');
var config = require('./config.json');

async function make_token(){
    var username = config.reqUserName;
    var orgName = config.reqOrg;
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
    }, 'thisismysecret');
    let response = await helper.getRegisteredUser(username, orgName, true);
    
    console.log('-- returned from registering the username %s for organization %s',username,orgName);
    if (response && typeof response !== 'string') {
      console.log('Successfully registered the username %s for organization %s',username,orgName);
      response.token = token;
      return response;
    } else {
      console.log('Failed to register the username %s for organization %s with::%s',username,orgName,response);
      return response;
    }
}

module.exports = make_token;