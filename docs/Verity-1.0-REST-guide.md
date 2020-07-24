# Introduction

This is a guide to the RESTful functions of Verity 1.0, using Node Express Server with Sessions. This server is intended for rapid installation, deployment, and customization by an Enterprise or customer interested in creating a low-load prototype or POC for deployment with Docker. It will give you RESTful endpoints for simple Verifiable Credential Exchange using DIDcom, through the API endpoints listed below. 

## API Endpoints

"vcx-server.js" is the Node Express service, while "vcx-web-tools.js" is imported into the server in order to use the libvcx Node wrapper. "vcx-client.js" is the client script, which handles the GUI with messaging from sockets.io, and uses plain vanilla javascript to make xhr requests to the RESTful endpoints. This makes the overhead of frameworks and requirements very low. It only uses "sockets.io", a lightweight script to manage the web sockets with GUI messaging.

## Offer Credential

You can see examples of this in web/vcx-client.js. A Connection is generated, either through Initialization (Registration) or Connection Redirect (Log In), and a Credential Offer is then sent to the Connection through DIDcom. The data for this credential can come from the database or from a data object from the POST request.

1. endpoint: api/v1/offer_credential
2. POST data structure is as below. "type" indicates the QR code to be generated (as opposed to SMS) and the name of the credential (in form "name-credential-definition.json").
  ```json
    { 
      "type":"QR",
      "give_cred:"<NAME OF CREDENTIAL TO ISSUE>"
    }
  ```
3. Response : QR code stream of binary data
4. Messaging : Connection Requested, Connection Established, Credential Offer Sent, Credential Offer Received, Credential Issued, Credential Received

## Request Proof

In this flow, Proof Request can be sent to a Connection (either a returning or new user), and that Proof Request will be validated by the server. If the Proof is validated (based upon parameters in the proof-definition.json), some Credential will be offered to the user. Instead of a Credential, this could also be access to a web site or any other action specified in the code. OIDC and QR-based logins are possible with this flow.

1. endpoint: api/v1/proof_credential
2. POST data structure is as below. "type" indicates the QR code to be generated (as opposed to SMS) and the name of the credential (in form "name-credential-definition.json").
  ```json
    {  
      "type":"QR",
      "proof_cred":"<NAME OF PROOF TO REQUEST>",
      "give_cred:"<NAME OF CREDENTIAL TO ISSUE>"
    }
  ```
3. Response : QR code stream of binary data
4. Messaging : Connection Requested, Connection Established, Credential Offer Sent, Credential Offer Received, Credential Issued, Credential Received, Proof Requested, Proof Valid, Proof Invalid

## Ask Validated Question (Structured Messaging)

In this example, a specific question with specific validatable responses can be sent to a Connection via DIDcom, which would result in a validated response from the Connection. Currently the question response params are hard-coded, but this is planned to be expanded to API data input.

1. endpoint: /api/v1/ask_question
2. POST data structure is as below. "type" indicates the QR code to be generated (as opposed to SMS) and the "qtext" will be the question text that is sent with the message to the mobile user.
  ```json
    {  
      "type":"qr",
      "qtext":qtext
    }
  ```
3. Response : QR code stream of binary data
4. Messaging : Message Sent, Response Value


## Store Connection

In the absence of credentials to issue, or proofs to request, this api endpoint will generate a Connection request, accept that request, serialize the data for that Connection and store it as a JSON file or in a database of your choosing.

1. endpoint: /api/v1/store_connection
2. POST data structure is as below. "type" indicates the QR code to be generated (as opposed to SMS) and "connection_name" will be stored with the connection.json data as the "name" key in the data object.
  ```json
    {
      "type":"qr",
      "connection_name":"<CONNECTION NAME>"
    }
  ```
3. Response : QR code stream of binary data
4. Messaging : Connection Established

## Make Credential

Make Credential uses this endpoint to create a new schema, credential definition, template credential data, and a templated proof request. These are stored in a database (currently just JSON files in /data/) and established as Credentials to offer along with Proof requests to send via the web client interface. All of this data can be hard-coded or manually edited. 

1. endpoint: /api/v1/make_credential
2. POST data structure is as below. It is identical to the schema.json data structure, and indeed this actually just writes to a "name-schema.json" file in /data/, then runs the createSchema and CreateCredentialDef in order for the new Credential (also this will run the generate Proof template and template credential data files.)
  ```json
  {
    "data":{
      "attrNames":[
        "Name",
        "Country Of Origin",
        "Date Of Birth",
        "Date Of Issue"
      ],
      "version":"111.11",
      "name":"<INSERT CREDENTIAL NAME>"
    },
      "sourceId":"<IDVALUE>",
      "paymentHandle":0
  }
  ```
3. Response : QR code stream of binary data
4. Messaging : Connection Established

