#!/bin/sh
set -u

DOMAIN="${CERT_DOMAIN:-golifecraft.com}"
EMAIL="${CERTBOT_EMAIL:?CERTBOT_EMAIL must be set in .env.local}"
WEBROOT="/var/www/certbot"

STAGING_FLAG=""
[ "${CERTBOT_STAGING:-0}" = "1" ] && STAGING_FLAG="--staging"

trap exit TERM

if [ ! -f "/etc/letsencrypt/renewal/${DOMAIN}.conf" ]; then
    echo "[certbot] No managed certificate for ${DOMAIN} yet; requesting the initial certificate."
    rm -rf "/etc/letsencrypt/live/${DOMAIN}" "/etc/letsencrypt/archive/${DOMAIN}"

    attempt=0
    until certbot certonly --webroot -w "${WEBROOT}" \
            -d "${DOMAIN}" -d "www.${DOMAIN}" \
            --email "${EMAIL}" --agree-tos --no-eff-email \
            --non-interactive ${STAGING_FLAG}; do
        attempt=$((attempt + 1))
        if [ "${attempt}" -ge 6 ]; then
            echo "[certbot] Initial issuance failed after ${attempt} attempts; retrying on the next renew cycle."
            break
        fi
        echo "[certbot] Gateway not reachable yet; retrying in 10s (attempt ${attempt})."
        sleep 10
    done
fi

while :; do
    certbot renew --webroot -w "${WEBROOT}" --quiet
    sleep 12h & wait $!
done
