#!/bin/bash
set -e

echo "🔍 BusPass Pro - Production Validation"
echo "========================================="
echo ""

ERRORS=0
WARNINGS=0

# Check required files
echo "📁 Checking required files..."
for file in docker-compose.prod.yml apps/api/Dockerfile apps/web/Dockerfile nginx/nginx.conf apps/web/public/manifest.json apps/web/public/sw.js apps/web/index.html .env.production.example; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo "🔧 Checking environment configuration..."
if [ -f ".env.production" ]; then
    echo "  ✅ .env.production exists"
    # Check for required variables
    for var in JWT_ACCESS_SECRET JWT_REFRESH_SECRET RAZORPAY_KEY_ID RAZORPAY_KEY_SECRET DATABASE_URL; do
        if grep -q "^${var}=" .env.production && ! grep -q "^${var}=your_" .env.production; then
            echo "  ✅ $var configured"
        else
            echo "  ⚠️  $var not configured (using defaults)"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
else
    echo "  ⚠️  .env.production not found (will use .env.production.example)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "🏗️  Checking build artifacts..."
if [ -d "apps/api/dist" ]; then
    echo "  ✅ API build exists"
else
    echo "  ❌ API build missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "apps/web/dist" ]; then
    echo "  ✅ Web build exists"
else
    echo "  ❌ Web build missing"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "📦 Checking Docker images..."
if docker images | grep -q "buspass"; then
    echo "  ✅ Docker images found"
else
    echo "  ⚠️  Docker images not found (will build on deploy)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "🌐 Checking network configuration..."
if grep -q "0.0.0.0" apps/web/vite.config.ts; then
    echo "  ✅ Web server configured for all interfaces"
else
    echo "  ⚠️  Web server not configured for external access"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "📱 Checking PWA support..."
for file in apps/web/public/manifest.json apps/web/public/sw.js; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo "========================================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ Validation passed! ($WARNINGS warnings)"
    echo ""
    echo "🚀 To deploy, run: ./deploy.sh"
    echo "📖 To view the app, open: http://localhost"
else
    echo "❌ Validation failed with $ERRORS errors and $WARNINGS warnings"
    exit 1
fi