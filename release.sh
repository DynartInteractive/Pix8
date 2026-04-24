#!/bin/bash
set -e

# Clean and build
rm -rf dist
npm run build

# Deploy via single SSH connection
SERVER="root@dynart.net"
KEY="$HOME/.ssh/server_ed25519"
DEST="/var/www/pix8.app"

tar cf - index.html dist/ css/ images/ | ssh -i "$KEY" "$SERVER" "cd $DEST && tar xf -"
