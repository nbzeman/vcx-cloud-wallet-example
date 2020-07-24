// # -*- coding: utf-8 -*-

// global variables
var config = {};
var url="";
var socket;
var loader; 
var file_list;

// set up sockets.io
function sockets(){
  let message = document.getElementById("message");
  let qrimage = document.getElementById('qr');
    socket.on('connected', ()=> {
      // successful connection
      message.innerHTML="connected";
      qrimage.setAttribute("src","");
    })
    socket.on('connection waiting',()=>{
      // connection offer sent, waiting on a response
      message.innerHTML="connection waiting";
    })
    socket.on('credential_news',function(data){
      let schema_id = document.getElementById('schema_id');
      let creddef_id = document.getElementById('cred_id');
      console.log(data);
      loader.style.display="none";
      message.innerHTML = data.connection['message'];
      schema_id.innerHTML = data.connection['schema_id'];
      creddef_id.innerHTML=data.connection['cred_id'];
    })
    socket.on('message_news',function(data){
      message.innerHTML = data.connection;
    })
    socket.on('connection ready',()=>{
      // connection request send from vcx-client.js
      message.innerHTML="connection ready";
      qrimage.src="https://s3.us-east-2.amazonaws.com/static.evernym.com/images/icons/cropped-Evernym_favicon-trans-192x192.png";
    })
    socket.on('connection expired',()=>{
      // connection request expired
      message.innerHTML="connection expired";
    })
    socket.on('connection not found',()=>{
      // connection request expired
      message.innerHTML="connection not found in records. Please delete this Connection and try again.";
    })
    socket.on('credential offered',()=>{
      // credential offer sent, waiting on response
      message.innerHTML="credential offered";
    })
    socket.on('credential issued',()=>{
      // credential issued to Connect.Me user
      message.innerHTML="credential issued";
    })
    socket.on('proof requested',()=>{
      // Proof Request sent to Connect.Me user
      message.innerHTML="proof requested";
    })
    socket.on('proof valid',()=>{
      // Proof Request has been validated
      message.innerHTML="Proof Valid";
      message.className="p-3 mb-2 bg-success text-white";
      let validator = document.getElementById("results");
      validator.style.color="white";
      validator.style.backgroundColor="#86c044";
      validator.innerHTML = "Antibody Test Valid"
    })
    socket.on('proof invalid',()=>{
      // Proof has not been validated
      message.innerHTML="Proof Invalid";
      message.className="p-3 mb-2 bg-danger text-white";
      let validator = document.getElementById("results");
      validator.style.backgroundColor="red";
      validator.style.color="white";
      validator.innerHTML = "Antibody Test InValid"
    })
    socket.on('timer expired',()=>{
      // Timer for action on page has expired
      message.innerHTML="global timer expired";
    })
    socket.on('credential building',()=>{
      // Timer for action on page has expired
      message.innerHTML="Credential is being built and written to the Ledger. Please wait...";
    })
    socket.on('credential built',()=>{
      // Timer for action on page has expired
      message.innerHTML="Credential has been built and written to the Ledger";
    })
}

// Credential Build Function (all credentials must be written to the Ledger before they can be offered or issued)
function buildCred(){
  let api_path = `/api/v1/build_credential`;
  let bcred = document.getElementById("build_cred").value;
  let body={
    "build_cred":bcred
  }
  loader = document.getElementById('loader');
  loader.style.display="block";
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        console.log("response complete");
        console.log(this.response.body);
        loader.style.display="none";
      }
  }
  xhttp.open("POST", api_path, true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  // xhttp.overrideMimeType('text/plain; charset=x-user-defined');
  xhttp.send(JSON.stringify(body));
}

//Main Connection Initialization function
function proof_credential(proof,cred) {
  let api_path = `/api/v1/proof_credential`;
  let qrimage = document.getElementById('qr');
  if(proof ==null && cred==null){
    proof = document.getElementById("proof_cred").value;
    cred = document.getElementById("give_cred").value;
  }

  console.log(`${proof} and ${cred}`);
  let body = {
    "type":"qr",
    "proof_cred":proof,
    "give_cred":cred
  };
  let base64str = "";
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
          // Process response here
          console.log("RESPONSE");
          let raw = "";
          for (let i=0; i<=this.responseText.length-1; i++){
              raw += String.fromCharCode(this.responseText.charCodeAt(i) & 0xff);
          }
          base64str = btoa(raw);
          let converted_qr = `data:image/png;base64,${base64str}`;
          qrimage.style.visibility="visible";
          qrimage.style.height="300px";
          qrimage.setAttribute('src',converted_qr);
      }
  }
  xhttp.open("POST", api_path, true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.overrideMimeType('text/plain; charset=x-user-defined');
  xhttp.send(JSON.stringify(body));
}

// function to determine type of connection to make

function connectionType(){
  let connection_type = document.getElementById('user_type').value;
  let phonenumber = document.getElementById('phonenumber').value;
  let email = document.getElementById('email').value;
  let cloud_address = document.getElementById('cloud_address').value;
  let body ={};
  switch (connection_type){
    case 'qr':
    body={
      type:'qr',
    }
    break;

    case 'sms':
    body={
      type:'sms',
      phonenumber:phonenumber
    }
    break;

    case 'email':
    body={
      type:'email',
      email:email
    }
    break;

    case 'cloud_wallet':
    body={
      type:'cloud_wallet',
      email:cloud_address
    }
    break;
    default:
    body={
      type:'qr'
    }
  }
  return body;
}

function offer_credential(cred) {
  let api_path = `/api/v1/offer_credential`;
  let qrimage = document.getElementById('qr');
  let connection_type = document.getElementById('user_type').value;
  let phonenumber = document.getElementById('phonenumber').value;
  let email = document.getElementById('email').value;
  let cloud_address = document.getElementById('cloud_address').value;
  if(cred == null){
    cred = document.getElementById("give_cred").value;
  }else{
    console.log('using arg cred and not chosen cred')
  }
  let body= connectionType();
  body['give_cred'] = cred;
  let base64str = "";
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
          // Process response here
          console.log("RESPONSE");
          let raw = "";
          for (let i=0; i<=this.responseText.length-1; i++){
              raw += String.fromCharCode(this.responseText.charCodeAt(i) & 0xff);
          }
          base64str = btoa(raw);
          let converted_qr = `data:image/png;base64,${base64str}`;
          qrimage.style.visibility="visible";
          // qrimage.classList.add("opener");
          qrimage.style.height="300px";
          qrimage.setAttribute('src',converted_qr);
      }
  }
  xhttp.open("POST", api_path, true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.overrideMimeType('text/plain; charset=x-user-defined');
  xhttp.send(JSON.stringify(body));
}
function validate_proof(proof) {
  let api_path = `/api/v1/validate_proof`;
  let qrimage = document.getElementById('qr');
  if(proof ==null && cred==null){
    proof = document.getElementById("proof_cred").value;
  }
  console.log(`${proof}`);
  let body = {
    "type":"qr",
    "proof_cred":proof
  };
  let base64str = "";
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
          // Process response here
          console.log("RESPONSE");
          let raw = "";
          for (let i=0; i<=this.responseText.length-1; i++){
              raw += String.fromCharCode(this.responseText.charCodeAt(i) & 0xff);
          }
          base64str = btoa(raw);
          let converted_qr = `data:image/png;base64,${base64str}`;
          qrimage.style.visibility="visible";
          qrimage.style.height="300px";
          qrimage.setAttribute('src',converted_qr);
      }
  }
  xhttp.open("POST", api_path, true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.overrideMimeType('text/plain; charset=x-user-defined');
  xhttp.send(JSON.stringify(body));
}

function offer_credential(cred) {
  let api_path = `/api/v1/offer_credential`;
  let qrimage = document.getElementById('qr');
  if(cred == null){
    cred = document.getElementById("give_cred").value;
  }else{
    console.log('using arg cred and not chosen cred')
  }
  let body = {
    "type":"qr",
    "give_cred":cred
  };
  let base64str = "";
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
          // Process response here
          console.log("RESPONSE");
          let raw = "";
          for (let i=0; i<=this.responseText.length-1; i++){
              raw += String.fromCharCode(this.responseText.charCodeAt(i) & 0xff);
          }
          base64str = btoa(raw);
          let converted_qr = `data:image/png;base64,${base64str}`;
          qrimage.style.visibility="visible";
          // qrimage.classList.add("opener");
          qrimage.style.height="300px";
          qrimage.setAttribute('src',converted_qr);
      }
  }
  xhttp.open("POST", api_path, true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.overrideMimeType('text/plain; charset=x-user-defined');
  xhttp.send(JSON.stringify(body));
}

function make_connection() {
  let api_path = `/api/v1/store_connection`;
  let qrimage = document.getElementById('qr');
  let pcred = document.getElementById("connection_name").value;
  let gcred = document.getElementById("connection_name").value;
  console.log(`${pcred} and ${gcred}`);
  let body = {
    "type":"qr",
    "proof_cred":pcred,
    "give_cred":gcred,
    "connection_name":pcred
  };
  let base64str = "";
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if(isMobile()){
          console.log(this.response);
          let res = JSON.parse(this.response);
          //geting error here
          if (!res.data) {
              // document.getElementById("respond-message").innerHTML =
              // "URL not found need to close browser to kill session";
              return;
          }
          let encodedURL = encodeURIComponent(res.data.data.invite_url);
          let link = "https://connectme.app.link?t=" + encodedURL;
          window.location = link;   
        }else{
          // Process response here
          console.log("RESPONSE");
          let raw = "";
          for (let i=0; i<=this.responseText.length-1; i++){
              raw += String.fromCharCode(this.responseText.charCodeAt(i) & 0xff);
          }
          base64str = btoa(raw);
          let converted_qr = `data:image/png;base64,${base64str}`;
          qrimage.style.visibility="visible";
          // qrimage.classList.add("opener");
          qrimage.style.height="300px";
          qrimage.setAttribute('src',converted_qr);
        }
      }
    }
  xhttp.open("POST", api_path, true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.overrideMimeType('text/plain; charset=x-user-defined');
  xhttp.send(JSON.stringify(body));
}

// make new credential from schema json template
function makeCred(){
  let api_path = `/api/v1/make_credential`;
  let text_body = document.getElementById('schema').value;
  let schema_id = document.getElementById('schema_id');
  let cred_id = document.getElementById('cred_id');
  let body = JSON.parse(text_body);
  loader= document.getElementById("loader");
  loader.style.display="block";
  fetch(api_path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }})
  .then(response => response.json())
  .then(function(data){
       console.log(data);
       loader.style.display="none";
       schema_id.innerHTML=data['Schema ID'];
       cred_id.innerHTML=data['Cred ID'];
      }
  )
}

function askQuestion() {
  let api_path = `/api/v1/ask_question`;
  let qrimage = document.getElementById('qr');
  let qtext = document.getElementById('qtext').value;
  let body = {
    "type":"qr",
    "qtext":qtext
  };
  let base64str = "";
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
          // Process response here
          let raw = "";
          for (let i=0; i<=this.responseText.length-1; i++){
              raw += String.fromCharCode(this.responseText.charCodeAt(i) & 0xff);
          }
          base64str = btoa(raw);
          let converted_qr = `data:image/png;base64,${base64str}`;
          qrimage.style.visibility="visible";
          qrimage.style.height="300px";
          qrimage.setAttribute('src',converted_qr);
      }
  }
  xhttp.open("POST", api_path, true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.overrideMimeType('text/plain; charset=x-user-defined');
  xhttp.send(JSON.stringify(body));
}

function askConnectionQuestion() {
  let api_path = `/api/v1/ask_question_from_saved_connection`;
  let qtext = document.getElementById('qtext').value;
  let cname = document.getElementById('mconnection').value;
  let body = {
    "qtext":qtext,
    'connection-name':cname
  };
  console.log(body);
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        console.log(this.responseText);
      }
  }
  xhttp.open("POST", api_path, true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.overrideMimeType('text/plain; charset=x-user-defined');
  xhttp.send(JSON.stringify(body));
}
function addProofAttr(){
  let parent = document.getElementById('parent-div');
  let attr1 = document.getElementById('attr_0');
  let attr2 = attr1.cloneNode(true);
  let atrrs = document.getElementsByClassName('attr');
  let incremal = atrrs.length-1;
  incremal+=1;
  attr2.setAttribute('id','attr_' + incremal);
  parent.appendChild(attr2);
}

function makeComplexProof(){
  console.log('Making Proof');
  let proof={
    "attrs": [
      {
         "name": "n1",
         "restrictions":[
          {"issuer_did": ""},
          {"schema_id": ""},
          {"schema_name":""},
          {"schema_version":""},
          {"schema_issuer_did":""},
          {"issuer_did":""},
          {"cred_def_id": ""}
        ]
      }
    ],
    "sourceId":"333333",
    "name": "Proof",
    "revocationInterval": {}
  };
  let p_attrs =[];
  let attrs = document.getElementsByClassName('attr');
  for(let attr of attrs){
    console.log(attr.getAttribute('id'));
    let att = attr.children;
    for(let a of att){
      console.log(a);
      let inputs = a.getElementsByTagName('input');
      for(let i of inputs){
        console.log(i);
        p_attrs.push(i.value);
      }
    }
  }
}
// Place any GUI initialization code below
async function init(){
  socket = io('',{path:'/api/socket.io'});
  sockets();
  get_files();
}
async function getConfig(){
  fetch('vcxweb.config')
  .then(response => response.json())
  .then(function(data){
        config = data;
        console.log(config);
      }
  )
}
async function get_files(){
  let title = document.title;
  let filter="connection.json";
  let options = [];
  let file_options1 = document.getElementById('give_cred');
  let file_options2 = document.getElementById('proof_cred');
  let file_options3 = document.getElementById('build_cred');
  let file_options4 = document.getElementById('connections');
  if(title==="Make Connection"){
    filter="connection.json";
  }else if(title==="Build Credential" || title==="Credential Exchange"){
    filter="schema.json";
  }else{
    return false;
  }
  let body = {"filter":filter};
  fetch('/api/v1/file_list')
  .then(response => response.json())
  .then(function(data){
        console.log(data);
        options= data;
        if(file_options1!=null){
          options.forEach(option =>
            file_options1.add(
              new Option(option, option, false)
            )
          );
        }
        if(file_options2!=null){
          options.forEach(option =>
            file_options2.add(
              new Option(option, option, false)
            )
          );
        }
        if(file_options3!=null){
          options.forEach(option =>
            file_options3.add(
              new Option(option, option, false)
            )
          );
        }
      }
  )
}
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}
// Listen for document to be completely loaded
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
      init();
      console.log("Loaded Document");
  }
}
