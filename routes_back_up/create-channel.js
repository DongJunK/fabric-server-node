const utils = require('fabric-client/lib/utils.js');
const logger = utils.getLogger('E2E create-channel');

const tape = require('tape');
const _test = require('tape-promise').default;
const test = _test(tape);

const Client = require('fabric-client');
const fs = require('fs');
const path = require('path');

const e2eUtils = require('./e2eUtils.js');

const channel_name = process.env.channel ? process.env.channel : 'mychannel';
const util = require('./util.js');

// config.json is blockchain config 
Client.addConfigFile(path.join(__dirname,'./config.json'));

// ??first-network가 맞는지 모르겠음.
const ORGS = Client.getConfigSetting('first-network');

// client : fabric-client 생성
const client = new Client();

/*
	caRootsPath : orderer 인증서 경로
	data : caRoots
	caroots : caRoots toString
*/

const caRootsPath = ORGS.orderer.tls_cacerts;
const data = fs.readFileSync(path.join(__dirname, caRootsPath)); 
const caroots = Buffer.from(data).toString();

const signature = [];

// Acting as a client in org1 when creating the channel
const org = ORGS.org1.name;

// key-value-store setting
utils.setConfigSetting('key-value-store', 'fabric-client/lib/impl/FileKeyValueStore.js');

const tlsInfo = await e2eUtils.tlsEnroll('org1');
client.setTlsClientCertAndKey(tlsInfo.certificate, tlsInfo.key);

const store = await Client.newDefaultKeyValueStore({path: util.storePathForOrg(org)});
client.setStateStore(store);

const cryptoSuite = Client.newCryptoSuite();
cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({path: util.storePathForOrg(org)}));
client.setCryptoSuite(cryptoSuite);

// use the config update created by the configtx tool
const channeltx_basename = process.env.channeltx_subdir ? path.join(process.env.channeltx_subdir, channel_name) : channel_name;
const envelope_bytes = fs.readFileSync(path.join(__dirname, '../../fixtures/crypto-material/channel-config', channeltx_basename + '.tx'));const config = client.extractChannelConfig(envelope_bytes);

