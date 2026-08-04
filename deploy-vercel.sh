#!/usr/bin/env bash
set -euo pipefail

PROJECT="campeonato-ipsa"
API_URL="https://api.campeonatoipsa.cl"
DOMAIN="campeonatoipsa.cl"

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "ERROR: define VERCEL_TOKEN antes de ejecutar (export VERCEL_TOKEN=...) o usa:"
  echo "  VERCEL_TOKEN=<token> ./deploy-vercel.sh"
  echo "Crea el token en https://vercel.com/account/tokens"
  exit 1
fi

V="npx -y vercel@latest"

echo "==> 1/5 Creando proyecto (si no existe)"
$V projects add "$PROJECT" --token "$VERCEL_TOKEN" 2>/dev/null || echo "    proyecto ya existe o no se pudo crear"

echo "==> 2/5 Vinculando directorio al proyecto"
$V link --yes --project "$PROJECT" --token "$VERCEL_TOKEN"

echo "==> 3/5 Variable de entorno NEXT_PUBLIC_API_URL (production,preview,development)"
if $V env list --token "$VERCEL_TOKEN" 2>/dev/null | grep -q "NEXT_PUBLIC_API_URL"; then
  echo "    ya existe NEXT_PUBLIC_API_URL, se omite"
else
  printf '%s' "$API_URL" | $V env add NEXT_PUBLIC_API_URL production,preview,development --no-sensitive --token "$VERCEL_TOKEN"
fi

echo "==> 4/5 Deploy a producción"
$V --prod --yes --token "$VERCEL_TOKEN"

echo "==> 5/5 Asignando dominio $DOMAIN al proyecto"
$V domains add "$DOMAIN" "$PROJECT" --token "$VERCEL_TOKEN" || echo "    no se pudo asignar el dominio; revísalo en el dashboard"

echo "✅ Deploy completo. Recordatorio manual en Cloudflare (zona $DOMAIN):"
echo "   A      $DOMAIN   -> 76.76.21.21"
echo "   CNAME  www       -> cname.vercel-dns.com"
