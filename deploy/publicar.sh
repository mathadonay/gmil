#!/usr/bin/env bash
# Publica a LP da GMIL a partir do checkout /srv/gmil (branch atual).
#   bash deploy/publicar.sh            → nova release + troca o symlink + reinicia
#   bash deploy/publicar.sh rollback   → volta para a release anterior
#   bash deploy/publicar.sh list       → lista releases
# Build de preview: NEXT_PUBLIC_MOSTRAR_PENDENCIAS=true (tarjas). No domínio do cliente, rode com MOSTRAR_PENDENCIAS=false.
set -euo pipefail
BASE=/srv/gmil-lp
SRC=/srv/gmil
MANTER=5
cmd=${1:-deploy}

case "$cmd" in
  list) ls -1t "$BASE/releases"; echo "atual: $(readlink "$BASE/current")"; exit 0 ;;
  rollback)
    atual=$(readlink -f "$BASE/current")
    anterior=$(ls -1dt "$BASE"/releases/* | grep -v "^$atual$" | head -1)
    [ -n "$anterior" ] || { echo "sem release anterior"; exit 1; }
    ln -sfn "$anterior" "$BASE/current.tmp" && mv -T "$BASE/current.tmp" "$BASE/current"
    systemctl restart gmil-lp && echo "voltou para $anterior"; exit 0 ;;
esac

# Nunca construir em paralelo com outro build (VPS de 1 CPU).
exec 9>/var/lock/gmil-lp-build.lock
flock -n 9 || { echo "outro build em andamento"; exit 1; }

rel="$BASE/releases/$(date +%Y%m%d-%H%M%S)-$(git -C "$SRC" rev-parse --short HEAD)"
mkdir -p "$rel"
git -C "$SRC" archive HEAD | tar -x -C "$rel"
cd "$rel"
npm ci --no-audit --no-fund
NEXT_TELEMETRY_DISABLED=1 \
NEXT_PUBLIC_SITE_URL="${SITE_URL:-https://gmil.nedir.com.br}" \
NEXT_PUBLIC_MOSTRAR_PENDENCIAS="${MOSTRAR_PENDENCIAS:-true}" \
NEXT_PUBLIC_WHATSAPP="${WHATSAPP:-}" \
NEXT_PUBLIC_GTM_ID="${GTM_ID:-}" \
  npx next build
chown -R gmil:gmil "$rel"
ln -sfn "$rel" "$BASE/current.tmp" && mv -T "$BASE/current.tmp" "$BASE/current"
systemctl restart gmil-lp
sleep 3
curl -fsS -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3020/
ls -1dt "$BASE"/releases/* | tail -n +$((MANTER + 1)) | xargs -r rm -rf
echo "publicado: $rel"
