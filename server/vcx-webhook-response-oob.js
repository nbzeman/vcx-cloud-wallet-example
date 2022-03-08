#!/usr/bin/env node
const axios = require('axios');
const http = require('http');
const ngrok = require('ngrok');
const express = require('express');
const bodyParser = require('body-parser');
const uuid4 = require('uuid4');
const qr = require("qrcode");
const cloudWalletEndpoint = process.env.RESTENDPOINT;

// Maps
// Relationship create
const relCreateMap = new Map();
let tempRelationship="";
async function setupIssuer(){
  sendVerityRESTMessage('123456789abcdefghi1234', 'issuer-setup', '0.6', 'create', {});
}
async function schemaCreate(schemaMessage){
  sendVerityRESTMessage('123456789abcdefghi1234', 'write-schema', '0.6', 'write', schemaMessage);
}
async function credDefCreate(credDefMessage){
  sendVerityRESTMessage('123456789abcdefghi1234', 'write-cred-def', '0.6', 'write', credDefMessage);
}
async function relationshipCreateOfferCred(relationshipCreateMessage){
  const issueRelationshipCreateMessage = {}
  const issueRelThreadId = uuid4()
  const issueRelationshipCreate =
    new Promise(function (resolve, reject) {
      relCreateMap.set(issueRelThreadId, resolve)
    })
  // sendVerityRESTMessage('123456789abcdefghi1234', 'relationship', '1.0', 'create', relationshipCreateMessage);
  sendVerityRESTMessage('123456789abcdefghi1234', 'relationship', '1.0', 'create', issueRelationshipCreateMessage, issueRelThreadId);
  const issueRelationshipDid = await issueRelationshipCreate;
  let credMessage ={
    "~for_relationship": issueRelationshipDid,
    "comment": relationshipCreateMessage.comment,
    "auto_issue": true,
    "by_invitation": true,
    "cred_def_id": relationshipCreateMessage.cred_def_id,
    "credential_values":relationshipCreateMessage.credential_values,
    "price": "0",
    "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/offer",
    "@id":issueRelThreadId
  }
  credentialOffer(credMessage);
}
async function relationshipCreateSMS(relationshipCreateMessage){
  sendVerityRESTMessage('123456789abcdefghi1234', 'relationship', '1.0', 'create', issueRelationshipCreateMessage,issueRelThreadId);
}
async function relationshipInvitation(relationshipInvitationMessage, relThreadId){
  sendVerityRESTMessage('123456789abcdefghi1234', 'relationship', '1.0', 'connection-invitation', relationshipInvitationMessage, relThreadId);
}
async function relationshipInvitationOob(relationshipInvitationMessage, relThreadId){
  sendVerityRESTMessage('123456789abcdefghi1234', 'relationship', '1.0', 'out-of-band-invitation', relationshipInvitationMessage, relThreadId);
}
async function credentialOffer(credentialMessage){
  sendVerityRESTMessage('BzCbsNYhMrjHiqZDTUASHg', 'issue-credential', '1.0', 'offer', credentialMessage);
}
async function smsCredentialOfferOob(credentialMessage, relThreadId){
  sendVerityRESTMessage('123456789abcdefghi1234', 'relationship', '1.0', 'sms-out-of-band-invitation', credentialMessage, relThreadId);
}

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
  if(message['@type'] != "did:sov:123456789abcdefghi1234;spec/relationship/1.0/sms-out-of-band-invitation"){
    message['@id'] = uuid4();
  }
  if (!threadId) {
    threadId = uuid4();
  }
  if(message['@type'] == "did:sov:123456789abcdefghi1234;spec/relationship/1.0/sms-out-of-band-invitation"){
    threadId="";
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
  return post.response;
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
    console.log(JSON.stringify(req.body));
    let message = req.body;
    // insert logic to handle webhook messages
    switch (message['@type']) {
      case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/sent':
        console.log("credential is sent");
        break;
      case 'did:sov:123456789abcdefghi1234;spec/write-cred-def/0.6/needs-endorsement':
        console.log("Prepping above For Endorsement");
      case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/problem-report':
        console.log('credential issue problem report');
        break;
      case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/credential-preview':
        console.log('credential preview');
        break;      
      case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/committedanswer/1.0/problem-report':
        console.log('answer problem report');
        break;
      case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/committedanswer/1.0/answer-given':
        console.log('answer was received');
        break;
      case 'did:sov:123456789abcdefghi1234;spec/relationship/1.0/sms-invitation-sent':
        console.log("SMS invitation was sent");
        break
      case 'did:sov:123456789abcdefghi1234;spec/configs/0.6/COM_METHOD_UPDATED':
        // console.log(`The webhook endpoint for this domainDID has been updated');
        break;
      case 'did:sov:123456789abcdefghi1234;spec/issuer-setup/0.6/public-identifier-created':
        console.log('Issuer Generated for the domainDID');
        setupIssuer();
        break
      case "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/sent-response":
        console.log("Trust Ping Response Sent");
        //send verity REST API Credential Offer from relationship
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
      case 'did:sov:123456789abcdefghi1234;spec/relationship/1.0/out-of-band-invitation':
        console.log('Out Of Band Relationship has been created. A Credential offer is now being generated.');
        // relationshipInvitationOob(relationship_data, message['~thread'].thid);
      break
      case 'did:sov:123456789abcdefghi1234;spec/relationship/1.0/created':
        // relCreateMap.get(threadId)(message.did);
        tempRelationship=message.did;
        console.log('A Relationship has been created. A Credential offer is now being generated.');
        let credMessage ={
          "~for_relationship": message.did,
          "comment": "Some comment",
          "auto_issue": true,
          "by_invitation": true,
          "cred_def_id": "8Rpq313txDz77uQpGnkdsZ:3:CL:204156:test",
          "credential_values": { "firstname": "nicholas", "lastname": "zeman", "dob": "12/23/72" },
          "price": "0",
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/offer",
          "@id":message.id
        }
        credentialOffer(credMessage);
      break
      case 'did:sov:123456789abcdefghi1234;spec/relationship/1.0/invitation':
        console.log('standard Relationship invitation has been created');
        const fetch_invite = await axios.get(message.inviteURL);
        const invite = fetch_invite.data;
        console.log('invite JSON : ');
        console.log(JSON.stringify(invite));
        // send invite data to Verity 1 /accept invite
        let cloud_wallet_url = cloudWalletEndpoint+'accept_invite';
        let cloud_invite_data = {
          "protocol":"standard",
          "name":"Connection Name",
          "connection_invite":invite,
          "thid":message['~thread'].thid
        }
        // await sendCloudWalletRESTMessage('accept_invite',cloud_invite_data);
        break
      case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/protocol-invitation':
        console.log("Issue Credential Protocol Invitation Received");
        console.log("Short URL Invite:");
        console.log(message.shortInviteURL);
        // qr.toFile(`../data/new-cred-invite.png`, message.shortInviteURL);
        let oob_sms_data ={
            "~for_relationship": tempRelationship,
            "@type": "did:sov:123456789abcdefghi1234;spec/relationship/1.0/sms-out-of-band-invitation",  
            "phoneNumber": "+17073436737",
            "goalCode":message.shortInviteURL,
            "goal":"this is a deep link for SMS"
        }
        smsCredentialOfferOob(oob_sms_data, message['~thread'].thid);
        break
      case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/request-received':
        console.log('connection request received');
        break
      case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/response-sent':
        console.log('connection response sent');
        // connectionResolve(null);
        break
      case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/sent-response':
        console.log("Trust Ping Sent Response");
        break
      case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/sent':
        if(message.msg.hasOwnProperty('credential_preview')){
          console.log('credential offer preview');
          // let json_message = JSON.parse(message);
          // console.log((message["~thread"]['thid']));
          let thid = message['~thread']['thid'];
          let body = {
            "thid":thid,
            "message":"msg"
          }
          console.log(body);
          let cloudWalletResponse = await sendCloudWalletRESTMessage('receive_credentials',body);
          res.send(cloudWalletResponse);
          
        }
        if (message.msg.hasOwnProperty('credentials~attach')) {
          // credOfferResolve();
          console.log('credential offer generated');
        }
        break
      default:
        console.log(`Unexpected message type ${message['@type']}`)
        process.exit(1)
    }
  })
  app.post("api/v1/offer-credential", async function (req, res){

    console.log(req.body);
    await relationshipCreateOfferCred(req.body);
  })
  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
// run code for webhook
startWebhook(3000);