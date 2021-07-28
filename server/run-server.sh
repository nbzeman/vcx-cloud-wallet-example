#!/bin/bash
SUPERVISOR=${SUPERVISOR}
echo "Running Node Express VCX Server"
set -e
cp /root/web/default /etc/nginx/sites-available/default &&
cat /etc/nginx/sites-available/default
node $SUPERVISOR