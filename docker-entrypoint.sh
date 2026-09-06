#!/bin/sh
set -e

set -a
. ./.env.production
set +a

# ensure db dir exists and belongs to node
db_dir=$(dirname $DB_URL)
mkdir -p $db_dir
chown -R node:node $db_dir

# ensure data dir exists and belongs to node
audio_dir=$(dirname $AUDIO_FILES_DIR)
mkdir -p $audio_dir
chown -R node:node $audio_dir

metrics_db_dir=$(dirname $METRICS_DB_URL)
mkdir -p $metrics_db_dir
chown -R node:node $metrics_db_dir

node ./migrate-all.js

# execute the main command as the user "node", see Dockerfile CMD
exec gosu node "$@"

