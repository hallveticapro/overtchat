#!/bin/sh
set -e

node apps/web/scripts/chat-max-duration.cjs
exec "$@"
