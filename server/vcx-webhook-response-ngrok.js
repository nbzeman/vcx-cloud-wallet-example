#!/usr/bin/env node
const axios = require('axios');
const http = require('http');
const ngrok = require('ngrok');
const express = require('express');
const bodyParser = require('body-parser');
const uuid4 = require('uuid4');
const cloudWalletEndpoint = process.env.RESTENDPOINT;

async function setupIssuer(){
  sendVerityRESTMessage('123456789abcdefghi1234', 'issuer-setup', '0.6', 'create', {});
}
async function schemaCreate(schemaMessage){
  sendVerityRESTMessage('123456789abcdefghi1234', 'write-schema', '0.6', 'write', schemaMessage);
}
async function credDefCreate(credDefMessage){
  sendVerityRESTMessage('123456789abcdefghi1234', 'write-cred-def', '0.6', 'write', credDefMessage);
}
async function relationshipCreate(relationshipCreateMessage){
  sendVerityRESTMessage('123456789abcdefghi1234', 'relationship', '1.0', 'create', relationshipCreateMessage);
}
async function relationshipInvitation(relationshipInvitationMessage, relThreadId){
  sendVerityRESTMessage('123456789abcdefghi1234', 'relationship', '1.0', 'connection-invitation', relationshipInvitationMessage, relThreadId);
}
async function credentialOffer(credentialMessage){
  sendVerityRESTMessage('BzCbsNYhMrjHiqZDTUASHg', 'issue-credential', '1.0', 'offer', credentialMessage);
}



// async function webhookResponses() {
//   // vars for resolves on VAS
//   var webhookResolve;
//   var setupResolve;
//   var schemaResolve;
//   var credDefResolve;
//   var relCreateResolve = {};
//   var relInvitationResolve;
//   var connectionResolve;
//   var credOfferResolve;

//   // STEP 2 - Setup Issuer
//   const setupIssuer =
//     new Promise(function (resolve, reject) {
//       setupResolve = resolve
//       sendVerityRESTMessage('123456789abcdefghi1234', 'issuer-setup', '0.6', 'create', {})
//     })
//   const [issuerDid, issuerVerkey] = await setupIssuer
//   // Automatic registration of DID/Verkey as Endorser using Sovrin SelfServe portal
//   const sovrinResponse = await registerDid(issuerDid, issuerVerkey)
//   console.log(`DID registration response from Sovrin SelfServe portal:\n${sovrinResponse.data.body}`)

//   // STEP 3 - Create schema
//   const schemaMessage = {
//     name: 'Diploma ' + uuid4().substring(0, 8),
//     version: '0.1',
//     attrNames: ['name', 'degree']
//   }
//   const schemaCreate =
//     new Promise(function (resolve, reject) {
//       schemaResolve = resolve
//       sendVerityRESTMessage('123456789abcdefghi1234', 'write-schema', '0.6', 'write', schemaMessage)
//     })
//   const schemaId = await schemaCreate;
//   console.log(`Created schema: ${schemaId}`);

//   // STEP 4 - Create credential definition
//   const credDefMessage = {
//     name: 'Trinity College Diplomas',
//     schemaId: schemaId,
//     tag: 'latest'
//   }
//   const credDefCreate =
//     new Promise(function (resolve, reject) {
//       credDefResolve = resolve
//       sendVerityRESTMessage('123456789abcdefghi1234', 'write-cred-def', '0.6', 'write', credDefMessage)
//     })
//   const credDefId = await credDefCreate
//   console.log(`Created credential definition: ${credDefId}`)

//   // STEP 5 - Relationship creation
//   // create relationship key
//   const relationshipCreateMessage = {
//     label: 'Trinity College',
//     logoUrl: 'https://robohash.org/65G.png'
//   }
//   const relationshipCreate =
//     new Promise(function (resolve, reject) {
//       relCreateResolve = resolve
//       sendVerityRESTMessage('123456789abcdefghi1234', 'relationship', '1.0', 'create', relationshipCreateMessage)
//     })
//   const [relationshipDid, relThreadId] = await relationshipCreate
//   // create invitation
//   const relationshipInvitationMessage = {
//     '~for_relationship': relationshipDid
//   }
//   const relationshipInvitation =
//     new Promise(function (resolve, reject) {
//       relInvitationResolve = resolve
//       sendVerityRESTMessage('123456789abcdefghi1234', 'relationship', '1.0', 'connection-invitation', relationshipInvitationMessage, relThreadId)
//     })
//   const inviteUrl = await relationshipInvitation;
//   console.log(`Invite URL is:\n${inviteUrl}`);
//   await QR.toFile('qrcode.png', inviteUrl);
//   // establish connection
//   console.log('Open file qrcode.png and scan it with ConnectMe app')
//   const connection =
//     new Promise(function (resolve, reject) {
//       connectionResolve = resolve
//     })
//   await connection;

//   // STEP 6 - Credential issuance
//   const credentialData = {
//     name: 'Joe Smith',
//     degree: 'Bachelors'
//   }
//   const credentialMessage = {
//     '~for_relationship': relationshipDid,
//     name: 'Diploma',
//     cred_def_id: credDefId,
//     credential_values: credentialData,
//     price: 0,
//     comment: 'Diploma',
//     auto_issue: true
//   }
//   const credentialOffer =
//     new Promise(function (resolve, reject) {
//       credOfferResolve = resolve
//       sendVerityRESTMessage('BzCbsNYhMrjHiqZDTUASHg', 'issue-credential', '1.0', 'offer', credentialMessage)
//     })
//   await credentialOffer;
// }

// Run the response code
// webhookResponses();


// create ngrok tunnel
async function ngrokConnection(port){
  let ngrok_url;
  try{
      ngrok_url = await ngrok.connect(port);
      if(ngrok_url != ''){
        return ngrok_url;
      }else{
        return ' error in producing ngrok url, resulting in undefined value' ;
      }
  }
  catch(err){
    return err;
  }
}
// Update Webhook Endpoint on VAS
async function updateWebhookEndpoint(url){
  var data = JSON.stringify({
    "comMethod": {
      "id": "webhook",
      "type": 2,
      "value": url,
      "packaging": {
        "pkgType": "plain"
      }
    },

    "@type": "did:sov:123456789abcdefghi1234;spec/configs/0.6/UPDATE_COM_METHOD"
  });
  var config = {
    method: 'post',
    url: `${process.env.VERITY_URL}/api/${process.env.DOMAIN_DID}/configs/0.6/`,
    headers: { 
      'X-API-key': process.env.X_API_KEY, 
      'Content-Type': 'application/json'
    },
    data : data
  };
  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
}
// Send REST API message to VAS
async function sendVerityRESTMessage (qualifier, msgFamily, msgFamilyVersion, msgName, message, threadId) {
  // Add @type and @id fields to the message
  // Field @type is dinamycially constructed based on the function arguments and added into the message payload
  message['@type'] = `did:sov:${qualifier};spec/${msgFamily}/${msgFamilyVersion}/${msgName}`
  message['@id'] = uuid4()
  if (!threadId) {
    threadId = uuid4()
  }
  let url = `${process.env.VERITY_URL}/api/${process.env.DOMAIN_DID}/${msgFamily}/${msgFamilyVersion}/${threadId}`;
  console.log(`Posting message to ${url}`)
  console.log(message);
  return axios({
    method: 'POST',
    url: url,
    data: message,
    headers: {
      'X-API-key': process.env.X_API_KEY // <-- REST API Key is added in the header
    }
  })
}

async function sendCloudWalletRESTMessage(endpoint, body){
  let url = cloudWalletEndpoint+endpoint;
  console.log(url);
  let post = await axios({
    method: 'POST',
    url: url,
    data: body,
    headers: {
    }
  })
  console.log(post);
}
// starts webhook tunnel on ngrok
async function startWebhook(port){
  const app = express();
  const server = http.createServer(app);
  app.use(bodyParser.json());
  let url = await ngrok.connect(port);
  console.log(url);
  // promises for webhook responses
  
  await updateWebhookEndpoint(url+'/webhook');
  app.post('/webhook', async (req, res) => {
    const sessionId = req.params.sessionId
    console.log(`Got message from webhook : `);
    console.log(req.body);
    let message = req.body;
    // insert logic to handle webhook messages
    switch (message['@type']) {
      case 'did:sov:123456789abcdefghi1234;spec/configs/0.6/COM_METHOD_UPDATED':
        // console.log(`The webhook endpoint for this domainDID has been updated');
        break;
      case 'did:sov:123456789abcdefghi1234;spec/issuer-setup/0.6/public-identifier-created':
        console.log('Issuer Generated for the domainDID');
        setupIssuer();
        break
      case 'did:sov:123456789abcdefghi1234;spec/issuer-setup/0.6/problem-report':
        // console.log ('Issuer has already been Initiated for this domainDID)
        if (
          message.message === 'Issuer Identifier is already created or in the process of creation'
        ) {
          await sendVerityRESTMessage('123456789abcdefghi1234', 'issuer-setup', '0.6', 'current-public-identifier', {})
        }
        break
      case 'did:sov:123456789abcdefghi1234;spec/issuer-setup/0.6/public-identifier':
        // setupResolve([message.did, message.verKey])
        break
      case 'did:sov:123456789abcdefghi1234;spec/write-schema/0.6/status-report':
        console.log('schema is being written to the ledger');
        let schema_data = {
          "name": message.name,
          "version": message.version,
          "attrNames": message.attrNames,
        }
        schemaCreate(schema_data);
        break
      case 'did:sov:123456789abcdefghi1234;spec/write-cred-def/0.6/status-report':
        console.log('credential def is being written to the ledger');
        // credDefResolve(message.credDefId);
        break
      case 'did:sov:123456789abcdefghi1234;spec/relationship/1.0/created':
        console.log('Relationship has been created');
        let relationship_data = {
          "~for_relationship": message.did,
          "@type": "did:sov:123456789abcdefghi1234;spec/relationship/1.0/connection-invitation",
          "@id":message.id
      }
      relationshipInvitation(relationship_data, message['~thread'].thid);
      break
      case 'did:sov:123456789abcdefghi1234;spec/relationship/1.0/invitation':
        console.log('Relationship invitation has been created');
        // relInvitationResolve(message.inviteURL);
        const fetch_invite = await axios.get(message.inviteURL);
        const invite = fetch_invite.data;
        console.log('invite JSON : ');
        console.log(invite);
        // send invite data to Verity 1 /accept invite
        let cloud_wallet_url = cloudWalletEndpoint+'accept_invite';
        let cloud_invite_data = {
          "protocol":"standard",
          "name":"Connection Name",
          "connection_invite":invite
        }
        await sendCloudWalletRESTMessage('accept_invite',cloud_invite_data);
        break
      case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/request-received':
        console.log('connection request received');
        break
      case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/response-sent':
        console.log('connection response sent');
        // connectionResolve(null);
        break
      case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/sent-response':
        break
      case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/sent':
        if (message.msg.hasOwnProperty('credentials~attach')) {
          // credOfferResolve();
        }
        break
      default:
        console.log(`Unexpected message type ${message['@type']}`)
        process.exit(1)
    }
  })
  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
// run code for webhook
startWebhook(3000);