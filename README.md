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



# Vagrant installation Instructions (This assumes you have installed VirtualBox and Vagrant on your host machine). This Web App Training Demo has only been tested on a Vagrant VM running on Mac OSX Mojave. It should run correctly on all other OSX versions, but it has not been bug tested in a Windows environment or an AWS VM yet. Adjustments will need to be made if you intend to run this on a cloud-based configuration (such as the global path of the genesis.txn file in the vcx-config.json).

1. *****ONLY IF YOU ARE USING A MAC OR WINDOWS HOST MACHINE WITH VAGRANT AND VIRTUALBOX INSTALLED***** In the main directory containing the VagrantFile, Run vagrant in a terminal, with the VagrantFile and ssh into the instance

```bash
    vagrant up
    vagrant ssh
```

2. 

***MAC*** Navigate to the shared directory (/vagrant) for the VM. Run the install-wizard-mac.sh bash script to install and provision Libvcx and the Sample Web App

```bash
    cd /vagrant
    bash install-wizard-mac.sh
```
***WINDOWS*** Copy the shared directory (/vagrant) to a separate directory (vcx-vagrant). Run the vcx-vagrant/install/install-wizard-win.sh bash script to install and provision Libvcx and the Sample Web App

```bash
    cp -r /vagrant vcx-vagrant
    cd vcx-vagrant/install
    bash install-wizard-win.sh
```

3. Hit Enter through the Prompts for default values (or choose custom values for yourself). You can customize the following values, but hitting Enter with a blank value will generate automatic and default values (suggested for non-advanced users)

    * Wallet Seed - you can create a 32 bit seed and re-use it for re-installing. If you choose to use the randomly generated key is will be saved in a text file for you called "eseed.txt". When re-provisioning you should use this key value in order to prevent from having to re-register your DID. 
    * VCX Enterprise Name (will show up on requests and credentials in Connect.Me)
    * VCX Enterprise Logo URL (leaving this blank will generate a robot head for the icon)
    * Enterprise Agency Server (hit Enter for the default value *highly suggested*)
    * Genesis file (hit Enter for default value *highly suggested*)


4. Let the install and provision process complete - If successful, you will see the following in your shell (your DID and verkey values will be different):

```bash
    INSTITUTION DID:
    G9myrXx8qAxaxpqdLkiMqg
    INSTITUTION VERKEY:
    9Fxpwp1dVrbHW661fQ7N33Yqj53R7w9ZfPeHYMQR996F
    ****************************
    VCX has been successfully initiated
```

5. You will need to register your DID on the Staging Net at https://selfserve.sovrin.org/ in order to Build your Credentials. (For structured messaging demos, this is not necessary)

6. Load the index.html page in a web browser by going directly to the VM IP address http://172.28.128.99 (the IP address has been hard set)

7. Go to the Build Credentials page and make sure that both credentials are built (passport and employee). The two credentials have a dropdown to select. Both must be built in order to have a successful demonstration of the Credential Exchange.

8. Return to the home page, click the Issue Credential  Request button, and using Connect.Me, scan the resulting QR code that appears in the box. IF no QR code appears, you can check the status of the VCXWebApp.service by running the following command *in your VM console*. If there are any errors, they should be logged after the command has been run.

```bash
    sudo systemctl status VCXWebApp.service
```

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
