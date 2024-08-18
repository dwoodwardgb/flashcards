#!/bin/sh

set -u

if [ -z "${DATABASE_URL:-}" ]; then
    echo "Database URL is not available. Please set it. Exiting...."
    exit 1
fi

db_dir=$(dirname $DATABASE_URL)

if [ ! -d $db_dir ]; then
    echo "Database directory [ ${db_dir} ] does not exist. Creating...."
    mkdir -p "$db_dir"
fi

node ace.js migration:refresh --force
node ./bin/server.js
