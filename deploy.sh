#!/bin/bash
set -e

echo "🚀 BusPass Pro - Production Deployment"
echo "========================================="
echo ""

# Check for .env.production
if [ ! -f ".env.production" ]; then
    echo "📋 Creating .env.production from template..."
    cp .env.production.example .env.production
    echo "⚠️  Please edit .env.production with your domain and credentials, then re-run."
    echo ""
    echo "   Example:"
    echo "   FRONTEND_URL=http://yourdomain.com"
    echo "   GOOGLE_CLIENT_ID=your_google_client_id"
    echo "   RAZORPAY_KEY_ID=your_live_razorpay_key_id"
    echo ""
fi

# Load environment variables
if [ -f ".env.production" ]; then
    export $(grep -v '^#' .env.production | xargs)
fi

# Set defaults
HTTP_PORT=${HTTP_PORT:-80}
HTTPS_PORT=${HTTPS_PORT:-443}
FRONTEND_URL=${FRONTEND_URL:-http://localhost}

echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 15

# Check service health
echo "🏥 Checking API health..."
curl -f http://localhost:${HTTP_PORT}/api/health || { echo "❌ API health check failed"; exit 1; }

echo "🏥 Checking Web server..."
curl -f http://localhost:${HTTP_PORT}/ || { echo "❌ Web server health check failed"; exit 1; }

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your application is now running at:"
echo "   HTTP:  http://localhost:${HTTP_PORT}"
echo "   HTTPS: https://localhost:${HTTPS_PORT} (if SSL configured)"
echo ""
echo "📱 Mobile & iOS Support:"
echo "   - PWA manifest installed"
echo "   - Service worker enabled for offline support"
echo "   - Mobile-responsive design"
echo "   - Apple touch icons configured"
echo ""
echo "🔧 Useful commands:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo "   docker-compose -f docker-compose.prod.yml down"
echo "   docker-compose -f docker-compose.prod.yml restart"
echo ""

# Try to open the browser
if command -v xdg-open &> /dev/null; then
    xdg-open "${FRONTEND_URL}" || true
elif command -v open &> /dev/null; then
    open "${FRONTEND_URL}" || true
fi