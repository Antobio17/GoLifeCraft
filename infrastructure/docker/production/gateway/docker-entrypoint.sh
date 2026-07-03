#!/bin/sh
set -eu

DOMAIN="${CERT_DOMAIN:-golifecraft.com}"
LIVE_DIR="/etc/letsencrypt/live/${DOMAIN}"

if [ ! -f "${LIVE_DIR}/fullchain.pem" ]; then
    echo "[gateway] No certificate for ${DOMAIN}; generating a temporary self-signed placeholder so nginx can boot."
    mkdir -p "${LIVE_DIR}"
    openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
        -keyout "${LIVE_DIR}/privkey.pem" \
        -out "${LIVE_DIR}/fullchain.pem" \
        -subj "/CN=${DOMAIN}" >/dev/null 2>&1
    cp "${LIVE_DIR}/fullchain.pem" "${LIVE_DIR}/chain.pem"
fi

reload_on_cert_change() {
    last=""
    while :; do
        sleep 60
        current="$(openssl x509 -in "${LIVE_DIR}/fullchain.pem" -noout -fingerprint 2>/dev/null || echo none)"
        if [ -n "${last}" ] && [ "${current}" != "none" ] && [ "${current}" != "${last}" ]; then
            echo "[gateway] Certificate change detected; reloading nginx."
            nginx -s reload 2>/dev/null || true
        fi
        last="${current}"
    done
}

reload_on_cert_change &

exec nginx -g 'daemon off;'
