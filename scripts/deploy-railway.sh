#!/usr/bin/env bash
# RoundTable — Railway Deploy Script
# Usage: RAILWAY_TOKEN=<your_token> bash scripts/deploy-railway.sh
set -e

if [ -z "$RAILWAY_TOKEN" ]; then
  echo "❌  RAILWAY_TOKEN is not set."
  echo "   Get yours at: https://railway.app/account/tokens"
  echo "   Then run:  RAILWAY_TOKEN=<token> bash scripts/deploy-railway.sh"
  exit 1
fi

echo "🚂  Deploying RoundTable backend to Railway..."

# Authenticate
railway login --token "$RAILWAY_TOKEN"

# Create project (skips if already linked)
if [ ! -f ".railway/config.json" ]; then
  echo "📦  Creating Railway project..."
  railway init --name "roundtable-api"
fi

# Set environment variables
echo "⚙️   Setting environment variables..."
railway variables set \
  NODE_ENV=production \
  DATABASE_PATH=/app/data/roundtable.db

# Deploy
echo "🚀  Deploying..."
railway up --detach

# Get the public URL
echo "🌐  Fetching deployment URL..."
sleep 5
RAILWAY_URL=$(railway status --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('url',''))" 2>/dev/null || echo "")

if [ -n "$RAILWAY_URL" ]; then
  echo ""
  echo "✅  Deployed! Your API is live at:"
  echo "    https://$RAILWAY_URL"
  echo ""
  echo "📱  Now update .env.native:"
  echo "    VITE_API_BASE_URL=https://$RAILWAY_URL"
  echo ""
  echo "    Then rebuild for native:"
  echo "    npm run build:native && npx cap sync"
else
  echo "✅  Deploy started! Check Railway dashboard for your URL."
  echo "    Then update .env.native: VITE_API_BASE_URL=https://<your-railway-url>"
fi
