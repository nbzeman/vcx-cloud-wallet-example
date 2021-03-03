#!/usr/bin/env node
// This file establishes a Libvcx-based Cloud Wallet, able to receive credential offers and proof requests and respond to them
// Works as an automated cloud version of Connect.Me, using a REST API as a message transport to prompt the Credential Exchange

// imports
const axios = require('axios');
var request = require('request');
var cors = require('cors');
var qr = require('qr-image');
var fs = require('fs-extra');
var express = require('express');
var session = require('express-session');
const bodyParser = require('body-parser');
var vcxwebtools = require('./vcx-web-tools.js');
let complete = false;
// set up app express server
const PORT = 5050;
const app = express();
app.use(session({secret: "SecretKey"}));
app.use(bodyParser.urlencoded({ extended: false }));
const server = require('http').Server(app);
const io = require('socket.io')(server);
var vcx = require('node-vcx-wrapper');
let connection_id = 0;
const {
  Schema,  
  DisclosedProof,
  CredentialDef,
  Credential,
  Connection,
  IssuerCredential,
  Proof,
  StateType,
  Error,
  defaultLogger,
  rustAPI
} = vcx;
// sockets.io listen
io.on('connection',socket=>{
    socket.on('disconnect',()=>{
    })
    socket.on('message',function(data){
        console.log(data);
    })
})
// express server listen
server.listen(PORT,function(){
    console.log(`Listening on Port ${PORT}`);
});
// app settings for json, url, cors, and a public folder for shared use
app.use(express.json());
// express use url encoded for post messages
app.use(express.urlencoded());
// express set up Cross Origin
app.use(cors());

//simple GET to test and retrieve directory info from Data
app.get(`/api/v1/file_list`,async function(req,res){
    let pfilter = req.body['filter'];
    let filter="schema.json";
    console.log(pfilter);
    const directoryPath = `../data/`;
    let file_list = [];
    await fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            if(file.includes("schema")){
              console.log(file);
              file=file.replace('-schema.json','');
              file_list.push(file);
            }
        });
        res.send(file_list);
    });
  })
// Enterprise issue proof request
app.post(`/api/v1/request_proof`, async function(req,res){
    // receive body of request
    console.log(req.body);
    let cred_name = req.body['credential'];
    let endpoint = req.body['endpoint'];
    // make connection
    let connection = await vcxwebtools.makeConnection('QR','enterprise_connection','000');
    let details = await connection.inviteDetails(true);
    // send connection request to endpoint via request
    request.post({
      // headers
      headers: {'content-type' : 'application/json'},
      // REST API endpoint
      url: `${endpoint}/api/v1/receive_proof_request`,
      // JSON body data
      body : details
      },
      // callback
      function (error, response, body) {
          console.log(response);
          if (!error && response.statusCode == 200) {
              console.log(body);
          }
      }
    );
    // Poll for successful Connection
    let state = await connection.getState();
    while(state != 4) {
        console.log("The State of the Connection is "+ state);
        await connection.updateState();
        state = await connection.getState();
    }
    // issue proof request to enterprise
    let proof_state = await vcxwebtools.offerProof(cred_name,connection);
    io.emit('proof requested');
    console.log("Proof has processed");
    io.emit('proof processing');
    console.log(`state of y proof is ${proof_state}`);
    if (proof_state == 1){
        io.emit(`${cred_name} valid`);
        io.emit('proof valid');
        }else{
        console.log(`Proof is invalid`);
        io.emit(`${cred_name} invalid`);
        io.emit('proof invalid');
        }
})

// Enterprise Receive Proof Request
app.post(`/api/v1/receive_proof_request`, async function(req,res){
    console.log(req.body);
    let inviteDetails = JSON.stringify(req.body);
    let invitee = req.body['s']['n'];
    io.emit('recipient_news',{connection:`${invitee} has requested a Connection with you`});
    // Accept invitation
    let connection = await Connection.createWithInvite({ id: '1', invite: inviteDetails });
    await connection.connect({id:invitee});
    console.log('Connection Invite Accepted');
    await connection.updateState();
    let state = await connection.getState();
    console.log("State is :::");
    console.log(state);
    let timer = 0;
    while(state != StateType.Accepted && timer < 100){
        sleep(5000);
        await connection.updateState();
        state = await connection.getState();
        console.log("State is :::");
        console.log(state);
    }
    timer =0;
    let ser_connection = await connection.serialize();
    console.log(ser_connection);
    io.emit('recipient_news',{connection:`Public DID : ${ser_connection['data']['their_public_did']} has Connected with you`});
    io.emit('recipient_news',{connection:`${nm} has Requested a Proof : `});
    // process proof request
    let requests = await DisclosedProof.getRequests(connection);
    while(requests.length == 0){
        // sleep(5000);
        requests = await DisclosedProof.getRequests(connection);
        io.emit('news',{connection:'Waiting on Proof Requests'});
        console.log("Waiting on Requests");
    }
    io.emit('recipient_news',{connection:'Request Made'});
    io.emit('recipient_news',{connection:JSON.stringify(requests[0])});
    console.log('Creating a Disclosed proof object from proof request');
    io.emit('recipient_news',{connection:'Creating a Disclosed proof object from proof request'});
    let proof = await DisclosedProof.create({ sourceId: 'proof', request: JSON.stringify(requests[0])});
    console.log(await proof.serialize());
    console.log('Query for credentials in the wallet that satisfy the proof request');
    let credentials = await proof.getCredentials();
    console.log(credentials);
    var self_attested;
    for (let attr in credentials['attrs']) {
        credentials['attrs'][attr] = { credential: credentials['attrs'][attr][0] };
        console.log(attr);
        self_attested = attr;
    }
    // if the proof request matches the credential
    let cred_x = JSON.stringify(credentials['attrs'][self_attested]);
    console.log(`LENGTH OF CREDS IS ${cred_x}`);
    console.log(credentials['attrs']);
    // { 'Supplier CID': { credential: undefined } }
    console.log('Generate the proof');

    if(cred_x != '{}'){
        console.log("The credential exists");
        await proof.generateProof({selectedCreds: credentials, selfAttestedAttrs: {}});
    }else{
        console.log("Credential does not exist");
        io.emit('recipient_news',{connection:'You did not possess this Credential'});
        credentials = { self_attested: { credential: "undefined" } };
        await proof.generateProof({selectedCreds: credentials, selfAttestedAttrs: {}});
    }
    let s_proof = await proof.serialize();
    console.log(s_proof);
    console.log('Send the proof to agent');
    await proof.sendProof(connection);
    await proof.updateState();
    let pstate = await proof.getState();
    while(pstate !== 4){
        sleep(2000);
        console.log(`proof should have been sent  the State is : ${pstate}`);
        await proof.updateState();
        pstate = proof.getState();
    }
    console.log(`Proof sent!!`);
    io.emit('recipient_news',{connection:'Proof has been sent'});

})



//Offer Credentials


// Connections

// Get Connection Invite //

app.post('/api/v1/get_invite', async function(req,res){
  const {protocol, type, name, phonenumber} = req.body ;
  let state = 0;
  if (type === "qr" && protocol === "standard"){
    let connection = await vcxwebtools.makeConnection('QR','connection_1',req.body['phonenumber'],true);
    let qrcode = qr.image(await connection.inviteDetails(true), { type: 'png' });
    res.setHeader('Content-type', 'image/png');
    res.writeHead(200, {'Content-Type': 'image/png'});
    qrcode.pipe(res);
    io.emit("connection waiting");
    let timer = 0;
    while(state != 4 && state != 8 && timer < 100){
        sleep(5000);
        await connection.updateState();
        state = await connection.getState();
        console.log(`Connection State is :: ${state}`);
    }
    timer =0;
    if(state===8){
      console.log("Connection Redirected");
    }
  }
  else if (type === "json" && protocol === "standard") {
    let connection = await vcxwebtools.makeConnection('QR','connection_1',req.body['phonenumber'],true);
    let serialized_connection = await connection.serialize();
    let invite_details = await connection.inviteDetails(false);
    console.log(serialized_connection);
    console.log(invite_details);
    res.send(JSON.parse(invite_details));
    let timer = 0;
    while(state != 4 && state != 8 && timer < 100){
      sleep(2000);
      await connection.updateState();
      state = await connection.getState();
      console.log(`Connection State is :: ${state}`);
  }
    timer =0;
    if(state===8){
      console.log("Connection Redirected");
    }
  }
  else if (type === "json" && protocol === "outOfBand"){
    let connection = await makeOutOfBandConnection(name,true);
    let serialized_connection = await connection.serialize();
    let invite_details = await connection.inviteDetails(false);
    console.log(serialized_connection);
    console.log(invite_details);
    res.send(JSON.parse(invite_details));
    let timer = 0;
    while(state != 4 && state != 8 && timer < 100){
      sleep(2000);
      await connection.updateState();
      state = await connection.getState();
      console.log(`Connection State is :: ${state}`);
  }
    timer =0;
    if(state===8){
      console.log("Connection Redirected");
    }
  }
})

// Accept Connection Invite //

app.post('/api/v1/accept_invite', async function(req,res){
  let timer =0;
  const {protocol, connection_invite, name} = req.body ;
  let invite = JSON.stringify(connection_invite);
  console.log("Accepting Connection Invite");
  console.log(invite);
  let connection = {};
  if (protocol === "standard"){
    let data = '{"connection_type":"SMS","phone":"5555555555"}';// dummy legacy data must be included
    connection = await Connection.acceptConnectionInvite({"id":name,"invite": invite,"data":data});
  }else if (protocol === "outOfBand"){
    connection = await makeOutOfBandConnection("QR","connection-sourceId",true);
  }
  let state = 0;
  while(state != 4 && state != 8 && timer < 100){
      sleep(2000);
      timer +=1;
      await connection.updateState();
      state = await connection.getState();
      console.log("State is :::");
      console.log(state);
  }
  timer = 0;
  let serialized_connection = await connection.serialize();
  // store connection locally (upgrade to mysql soon!!)
  await fs.writeJSON(`../data/${name}-connection.json`,serialized_connection);
  res.send("Connection Accepted:: " + JSON.stringify(serialized_connection) );
  timer = 0;

})


async function makeOutOfBandConnection(type = 'QR', source_id, usePublicDid) {
  const connection = await Connection.createOutofband({ id: source_id, handshake: true });
  const connectionData = { id: source_id, connection_type: type, use_public_did: usePublicDid, update_agent_info: true };
  const connectionArgs = { data: JSON.stringify(connectionData) };
  await connection.connect(connectionArgs);
  return connection;
}

// Credentials

// Offer Credential

app.post('/api/v1/offer_credential', async function(req,res){
  console.log(req.body);
  const {user_type, connection, credential_name} = req.body;
  // user_type = "mobile", "cloud", "email"
  if(user_type==="mobile"){
      let connection = await vcxwebtools.makeConnection('QR','connection_1',req.body['phonenumber'],true);
      let qrcode = qr.image(await connection.inviteDetails(true), { type: 'png' });
      res.setHeader('Content-type', 'image/png');
      res.writeHead(200, {'Content-Type': 'image/png'});
      qrcode.pipe(res);
      io.emit("connection waiting");
      let timer = 0;
      while(state != 4 && state != 8 && timer < 100){
          sleep(2000);
          await connection.updateState();
          state = await connection.getState();
          console.log("State is :::");
          console.log(state);
      }
      timer =0;
      if(state===8){
        console.log("Connection Redirected");
      }
  }else if(user_type==="cloud"){


  }
  // 
  while(state != 4 && state != 8 && timer < 250) {
      console.log("The State of the Connection is "+ state + " "+timer);
      await sleep(2000);
      await connection.updateState();
      state = await connection.getState();
      timer+=1;
  }
  timer=0;
  // check for expiration or acceptance
  if(state == 4){
      timer = 0;
      console.log(`Connection Accepted! Connection ID is : ${connection_id}`);
      io.emit('connection ready');
      connection_id+=1;
      await vcxwebtools.storeConnection(connection, connection_id);
      console.log(` connection ID is :  ${connection_id}`);
    // reset global timeout
    timer = 0;
    io.emit('credential offered');
    let cred = await vcxwebtools.offerCredential(credential_name,connection);
    if(cred){
      io.emit('credential issued');
      complete=true;
    }
  }else if(state == 8){//check for redirected state
    timer = 0;
    console.log("Connection Redirected!");
    await connection.updateState();
    state = await connection.getState();
    io.emit('connection ready');
    // reset global timeout
    timer = 0;
    io.emit('credential offered');
    // get the redirect details
    let redirected_details = await connection.getRedirectDetails();
    // search and return name of Connection data with matching public DID
    let redirected_connection = await vcxwebtools.searchConnectionsByTheirDid(redirected_details);
    // deserialize connection return
    console.log(redirected_connection);
    // offer cred to old connection
    if(redirected_connection != false){
      let cred = await vcxwebtools.offerCredential(credential_name,redirected_connection);
      if(cred){
        io.emit('credential issued');
      }
    }else{
      io.emit('connection not found');
    }
    complete=true;
  }
  })


// Proofs

// Enterprise Offer Credentials

app.post(`/api/v1/offer_enterprise_credentials`, async function(req,res){
  console.log(req.body);
  let cred_name = req.body['credential'];
  let endpoint = req.body['endpoint'];
  let connection = await vcxwebtools.makeConnection('QR','enterprise_connection','000');
  let details = await connection.inviteDetails(true);
  console.log(details);
  console.log(endpoint);
  axios({
    method: 'post',
    url: `${endpoint}/api/v1/receive_credentials`,
    data:details,
    headers: {
        'Content-Type': 'application/json'
    }
  });
  // Poll for successful Connection
  let state = await connection.getState();
  while(state != StateType.Accepted) {
      console.log("The State of the Connection is "+ state);
      await connection.updateState();
      state = await connection.getState();
  }
  vcxwebtools.offerCredential(cred_name,connection);
})

// Enterprise Receive Credentials

app.post(`/api/v1/receive_credentials`, async function(req,res){
     //get details
     console.log("ACCEPTING REQUEST...");
     console.log(req.body);
     let inviter = req.body['label'];
     let inviteDetails = JSON.stringify(req.body);
     console.log(inviteDetails);
     let connection = await vcxwebtools.connectWithInvitation(inviter, inviteDetails);
     // build connection
     await connection.connect({id:inviter});
     console.log('Connection Invite Accepted');
     await connection.updateState();
     let state = await connection.getState();
     while(state != StateType.Accepted){
         await connection.updateState();
         state = await connection.getState();
         console.log("State is :::");
         console.log(state);
     }
     io.emit('recipient_news',{connection:`Credential offers from ${inviter} are :`});
     let offers = await Credential.getOffers(connection);
     while(offers.length < 1){
         offers = await Credential.getOffers(connection);
         console.log("Credential Offers Below:");
         console.log(JSON.stringify(offers[0]));
         io.emit('recipient_news',{connection: JSON.stringify(offers[0])});
     }
     let credential = await Credential.create({ sourceId: 'enterprise', offer: JSON.stringify(offers[0]), connection: connection});
     await credential.sendRequest({ connection: connection, payment: 0});
     let credentialState = await credential.getState();
     while (credentialState !== StateType.Accepted) {
       sleep(2);
       await credential.updateState();
       credentialState = await credential.getState();
       console.log(`Credential state is : ${credentialState}`);
     }
     let serial_cred = await credential.serialize();
     console.log(serial_cred);
     //await fs.writeJSON(`./data/received-credential.json`,serial_cred);
     //io.emit('recipient_news',{connection:`Credential Accepted`});
})

// Generate schema and credential definition based upon json file in ./data/cred_name-schema.json
app.post('/api/v1/build_credential', async function(req,res){
  let cred_name = req.body['build_cred'];
  io.emit('credential building');
  io.emit("credential built");
  let schema = await vcxwebtools.createSchema(cred_name);
  let credDef = await vcxwebtools.createCredentialDef(cred_name);
  let schema_ID = await schema.getSchemaId();
  let credDef_ID = await credDef.getCredDefId();
  //res.setHeader('Content-type', 'application/json');
//   res.end(JSON.stringify({
//   "message":"completed",
//    "Schema ID":schema_ID,
//    "Cred ID": credDef_ID 
//   }))  
})

// expiration global
function ExpireAll(){
  if(complete){
      io.emit('timer expired');
      console.log('global timer expired');
  }
}
setTimeout(ExpireAll,500000);

// polling killer
let killTime = 300000;
let killPolling = false;
let timeUp = function(x){
    if(x){
        io.emit("times up");
        console.log("times up");
        killPolling = true;
    }else{
        killPolling = false;
    }
}

//sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
