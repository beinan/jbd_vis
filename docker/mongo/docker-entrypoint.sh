#!/bin/bash

#from https://github.com/docker-library/mongo/blob/d5aca073ca71a7023e0d4193bd14642c6950d454/3.0/docker-entrypoint.sh

set -e

if [ "${1:0:1}" = '-' ]; then
    set -- mongod "$@"
fi

if [ "$1" = 'mongod' ]; then
    chown -R mongodb /data/db

    numa='numactl --interleave=all'
    if $numa true &> /dev/null; then
        set -- $numa "$@"
        fi

    exec gosu mongodb "$@"
fi

exec "$@"
