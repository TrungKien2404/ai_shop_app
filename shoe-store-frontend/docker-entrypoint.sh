#!/bin/sh

if [ -n "$API_BASE" ]; then
  echo "Replacing API_BASE in constants.js with: $API_BASE"
  sed -i "s|const API_BASE = .*|const API_BASE = '$API_BASE';|g" /usr/share/nginx/html/js/constants.js
fi

# Chay command mac dinh cua Nginx
exec nginx -g "daemon off;"
