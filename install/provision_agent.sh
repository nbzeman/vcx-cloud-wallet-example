#!/bin/bash

PROVISIONED_FILE="/root/config/vcx-config.json"
GEN_TXN_PATH=${GEN_TXN_PATH}
AGENCY_URL=${AGENCY_URL}
INSTITUTION_NAME=${INSTITUTION_NAME}
INSTITUTION_LOGO=${INSTITUTION_LOGO}
ENTERPRISE_SEED=${ENTERPRISE_SEED}
WALLET_NAME="LIBVCX_SDK_WALLET"
WALLET_KEY="12345"

cd /root/config
if [ -z "$ENTERPRISE_SEED" ];then
    echo "No environment seed value exists, using randomly generated Enterprise Seed...."
    ENTERPRISE_SEED="$(pwgen 32 -1)">eseed.txt   
fi     
## Provision agency into wallet
echo "Provisioning agent against: $AGENCY_URL into wallet: $WALLET_NAME"
echo "  as Insitituion: $INSTITUTION_NAME with logo: $INSTITUTION_LOGO"

# this sets up the mysql wallet
# python3 /usr/share/libvcx/provision_agent_keys.py -v --wallet-type mysql --wallet-name "${WALLET_NAME}" --storage-config "{\"db_name\": \"$WALLET_DB_NAME\", \"port\": 3306, \"write_host\": \"$WALLET_HOST\", \"read_host\": \"$WALLET_HOST\", \"use_ssl\": $WALLET_USE_SSL}" --storage-credentials "{\"user\": \"$WALLET_USERNAME\", \"pass\" : \"$WALLET_PASSWORD\"}" \ "${AGENCY_URL}" "${WALLET_KEY}" > vcx-config.json

python3 /usr/share/libvcx/provision_agent_keys.py -v --enterprise-seed "$ENTERPRISE_SEED" --wallet-name $WALLET_NAME $AGENCY_URL $WALLET_KEY > vcx-config.json

if [ $? -ne 0 ] ; then
    echo "ERROR occurred trying to provision agent! Aborting!"
    exit 1
fi
if grep '"provisioned"' vcx-config.json | grep 'false' ; then
    echo "ERROR occurred trying to provision agent! Aborting!"
    cat vcx-config.json
    exit 1
fi

# This commands substitutes <CHANGE_ME> values in libVCX configuration file with the values provided in the arguments
echo "Updating vcx-config.json..."
sed -i -e 's!"institution_name": "<NO_INSTITUTION_NAME>"!"institution_name": "'"$INSTITUTION_NAME"'"!' \
       -e 's!"institution_logo_url": "<NO_LOGO_URL>"!"institution_logo_url": "'"$INSTITUTION_LOGO"'"!' \
       -e 's!"genesis_path": "<CHANGE_ME>"!"genesis_path": "'"$GEN_TXN_PATH"'"!' \
       -e 's!"payment_method": "null"!"payment_method": "sov"!' \
       -e 's!"genesis_path"!"author_agreement": "{\\"taaDigest\\": \\"8cee5d7a573e4893b08ff53a0761a22a1607df3b3fcd7e75b98696c92879641f\\",\\"acceptanceMechanismType\\":\\"on_file\\",\\"timeOfAcceptance\\": '"$(date +%s)"'}",\n  "genesis_path"!' vcx-config.json
# chown indy.indy vcx-config.json

jq '.threadpool_count="64"' vcx-config.json > tmp && mv tmp vcx-config.json

jq '.protocol_type="3.0"' vcx-config.json > tmp && mv tmp vcx-config.json


# jq '.storage_config="{\"db_name\": \"wallet\", \"port\": 3306, \"write_host\": \"'"$WALLET_HOST"'\", \"read_host\": \"'"$WALLET_HOST"'\"}"' vcx-config.json > tmp && mv tmp vcx-config.json

# jq '.storage_credentials="{\"user\": \"'"$WALLET_USERNAME"'\", \"pass\" : \"'"$WALLET_PASSWORD"'\"}"' vcx-config.json > tmp && mv tmp vcx-config.json


INSTITUTION_DID=$(grep institution_did vcx-config.json | awk 'BEGIN {FS="\""} {print $4}')
INSTITUTION_VERKEY=$(grep institution_verkey vcx-config.json | awk 'BEGIN {FS="\""} {print $4}')
echo "Registering DID: ${INSTITUTION_DID} and VerKey: ${INSTITUTION_VERKEY} with sovrin selfserver portal"
echo "----Response Begin----"
curl -sd "{\"network\":\"stagingnet\",\"did\":\"$INSTITUTION_DID\",\"verkey\":\"$INSTITUTION_VERKEY\",\"paymentaddr\":\"\"}" https://selfserve.sovrin.org/nym
echo
echo "----Response End----"
echo "Provisioning Complete"
