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
9. VERITY_URL=https://vas.pps.evernym.com
10. DOMAIN_DID = <Your Domain DID>
11. X_API_KEY=<XAPIKEY>
12. WALLET_HOST=mysql
13. WALLET_DB_NAME=db
14. WALLET_USERNAME=root
15. WALLET_PASSWORD=password
16. WALLET_USE_SSL=false

## Local Docker Installation

1. Clone this repository into any host machine running docker and docker-compose. Install these if not already installed.
2. CD in the the cloud-wallet-example repo directory
3. Run docker-compose up --build -d in the root directory.
4. The Docker Container Set should build and then run the entrypoint script, install/install-vcx-portal.sh inside the container.
    * Container 1 : **vcx-cloud-wallet** - this container runs the libvcx/Verity 1 instance with Node Express REST API AND the Webhook Server for the Verity 2 Access
    * Container 2 : **mysqldb** - this container runs the mysql database that can be used to connect to the libvcx wallet AND store any libvcx Cloud Wallet pertinent data, such as the connection DID information
5. Once the Docker Compose set of containers has successfully completed, you can check on the status of the containers
The last several lines of the log should read:

```bash
    docker container ls
```
```
CONTAINER ID   IMAGE          COMMAND                  CREATED              STATUS              PORTS                                                                              NAMES
fadc3b82015a   ce7905592dd2   "/root/install/insta…"   About a minute ago   Up About a minute   0.0.0.0:3000->3000/tcp, :::3000->3000/tcp, 0.0.0.0:8081->80/tcp, :::8081->80/tcp   vcx-cloud-wallet
cccd442e235e   413be204e9c3   "docker-entrypoint.s…"   About a minute ago   Up About a minute   0.0.0.0:3306->3306/tcp, :::3306->3306/tcp, 33060/tcp                               mysqldb
```
IF there is an error or a status of the Supervisor says EXITED, look through the logs for errors or contact your support engineer for further assistance.

## Docker Compose Guide

For the Cloud Wallet to work properly, there are 3 containers that will be running. The two vcx wallet apps will BOTH be using vcx-cloud-wallet as the main server, with an instance of nginx running as the reverse proxy folder. Since these two servers are identical, the API endpoints are the same for both instances, but the names and ports will differ.

1. **vcx-cloud-wallet** - this container runs the libvcx/Verity 1 instance with Node Express REST API AND the Webhook Server for the Verity 2 Access
2. **mysqldb** - this container runs the mysql database that can be used to connect to the libvcx wallet AND store any libvcx Cloud Wallet pertinent data, such as the connection DID information

## Web App Logging

Logging files for output and errors can be accessed in the docker container /var/log/. Running the tail of the files will interactively log the output and errors to the console for viewing. First log into the docker container.

## SSH into the DOcker container and check the logs
```bash
  # log into the container
  docker exec -it vcx-wallet-app /bin/bash
  # read ongoing tail of log files
  tail -f /var/log/vcx*
```

## API endpoints 

***TBD***

## Remote Docker Installation

1. Clone repo into VM
2. Install docker and docker compose
3. Run docker-compose up --build -d
4. Navigate to the IP address or domain of the server, at port 8080