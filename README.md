# Evernym Customer Toolit

This codebase is the VCX Server and Client Web App, based on Libvcx/Libindy 1.12.0 and the associated NodeJS/Python wrappers. 

## Docker Environment parameters:

config/env.dev has the following parameters for provisioning and installing the customer toolkit app. Defaults are included currently, but can be altered for custom installs or demos. An empty enterprise seed will result in a randmoly generated seed that will export as install/eseed.txt for re-use if necessary.

1. GEN_TXN_PATH=/root/config/genesis.txn
2. AGENCY_URL=https://eas01.pps.evernym.com
3. INSTITUTION_NAME=Verity Cloud Wallet 1.0
4. INSTITUTION_LOGO=https://s3.us-east-2.amazonaws.com/static.evernym.com/images/icons/cropped-Evernym_favicon-trans-192x192.png
5. ENTERPRISE_SEED=ait5arie2uwoog5quoucheeV4die0eed **An Empty ENTERPRISE_SEED will trigger build script to auto-generate a random seed**
6. GENESIS_FILE_URL="https://raw.githubusercontent.com/sovrin-foundation/sovrin/stable/sovrin/pool_transactions_sandbox_genesis"
7. WALLET_NAME=LIBVCX_SDK_WALLET
8. WALLET_KEY=12345

## Local Docker Installation

1. Clone this repository into any host machine running docker and docker-compose. Install these if not already installed.
2. CD in the the lumedic-covid-antibody-test directory
3. Run docker-compose up --build -d in the root directory.
4. The Docker Container should build and then run the entrypoint script, install/install-vcx-portal.sh inside the container.
5. Once the entrypoint script is complete, navigate to localhost:8080 in your local browser. You can use Docker Desktop to check the container logs OR run this line in the command shell : 
```bash
    docker container logs vcx_app 
```
The last several lines of the log should read:

```bash
    Startup Actions Completed
    Checking that supervisor managed processes started
    Waiting for processes to finish starting
    Waiting for processes to finish starting
    Supervisor managed processes are started. Checking they started OK
    nginx                            RUNNING   pid 775, uptime 0:00:11
    vcx-web-app                      RUNNING   pid 776, uptime 0:00:11
    Done
```
IF there is an error or a status of the Supervisor says EXITED, look through the logs for errors or contact your support engineer for further assistance.

## Docker Compose Guide

For the Cloud Wallet to work properly, there are 3 containers that will be running. The two vcx wallet apps will BOTH be using vcx-cloud-wallet as the main server, with an instance of nginx running as the reverse proxy folder. Since these two servers are identical, the API endpoints are the same for both instances, but the names and ports will differ.

1. vcx-cloud-wallet - this app will run the cloud wallet and holder functions, running on port 8081. This will run on the internal Docker network with a hostname of "wallet-app". Any REST API calls to the Node Express Server can be sent from another container on this network using http://wallet-app/api/v1/<endpoint> or from the host machine at localhost:8081/api/v1/<endpoint>
2. vcx-enterprise-server - this app runs identical code as the vcx-cloud-wallet, but is used to send the Connection invitation and the credential offer or proof requests to the vcx-cloud-wallet server through the API endpoints.

## Web App Logging

Logging files for output and errors can be accessed in the docker container /var/log/. Running the tail of the files will interactively log the output and errors to the console for viewing. First log into the docker container.

```bash
  docker exec -it vcx-wallet-app /bin/bash
  tail -f /var/log/vcx*
```

## API endpoints 


## Remote Docker Installation

1. Clone repo into VM
2. Install docker and docker compose
3. Run docker-compose up --build -d
4. Navigate to the IP address or domain of the server, at port 8080
## Remote Docker Installation

1. Clone repo into VM (AWS EC2 or Azure)
2. Install docker and docker compose
3. Run docker-compose up --build
4. Navigate to IP or domain of VM

## Remote Docker Installation

1. Clone repo into VM (AWS EC2 or Azure)
2. Install docker and docker compose
3. Run docker-compose up --build
4. Navigate to IP or domain of VM

## Command-Line Interface Tools

**CLI-Tools** - Command line tools for NodeJS and Python are installed with this app in /server/. These can be executed at any time (separately from the vcx-server) to run standard VCX commands through the shell for testing purposes.

```bash
    python3 vcx-cli-tools.py testVCX
    node vcx-cli-tools.js testVCX
```
All functions are named identically and contain the same args. These are using a naming convention and json file-based system 
1. testVCX() - this function will test the Libvcx installation and provisioning
2. makeConnection(type, name, phonenumber) - type = 'SMS' or 'QR' and name= connection name. "phonenumber" is the phonenumber of the intended recipient. It will also write 'data/name-connection.json', which can be accessed later from the other functions.
3. createSchema(name) - This writes a schema to the ledger based upon a file named data/name-schema.json
4. createCredentialDef(name) - This writes a Credential definition to the ledger, using the schema id from the data/name-schema.json, only if it has been previously written to the Ledger.
5. offerCredential(name, connection) - This offers the credential 'name-credential-definitiom' to 'name-connection' using 'name-credentialdefinitionname-data.json'. All of these files must exist in order to offer this credential definition successfully to the connection, and the connection must exist on the remote wallet or Connect.Me install.
6. requestProof(proofname, connectionname) - Sends a request for a proof 
7. askProvableQuestion(connectionname) - This sends a sample structured message to a connection, which will come from the data/name-connection.json file and log the response to the console.

**TroubleShooting** - Running a restart of the service should fix any issues with the service if the QR code doesn't appear.

```bash
    sudo systemctl restart VCXWebApp.service
```

**Real-Time Logging** - lets you know if anything goes wrong or an error is thrown somewhere by logging the app service in real-time.

```bash
sudo journalctl -fu VCXWebApp.service
```
