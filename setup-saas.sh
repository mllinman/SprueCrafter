#!/bin/bash
# SprueCrafter - Quick Start Setup Script for SaaS Deployment
# This script helps set up SprueCrafter for SaaS deployment

set -e

echo "=========================================="
echo "SprueCrafter - SaaS Deployment Setup"
echo "=========================================="
echo ""

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32
}

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

echo "Creating .env file from .env.example..."
cp .env.example .env

# Generate secrets
echo ""
echo "Generating secure random secrets..."
SECRET_KEY=$(generate_secret)
JWT_SECRET_KEY=$(generate_secret)
POSTGRES_PASSWORD=$(generate_secret)
REDIS_PASSWORD=$(generate_secret)

# Update .env file with generated secrets
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|SECRET_KEY=your-secret-key-here-change-this|SECRET_KEY=${SECRET_KEY}|g" .env
    sed -i '' "s|JWT_SECRET_KEY=your-jwt-secret-key-change-this|JWT_SECRET_KEY=${JWT_SECRET_KEY}|g" .env
    sed -i '' "s|POSTGRES_PASSWORD=changeme|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|g" .env
    sed -i '' "s|REDIS_PASSWORD=changeme|REDIS_PASSWORD=${REDIS_PASSWORD}|g" .env
else
    # Linux
    sed -i "s|SECRET_KEY=your-secret-key-here-change-this|SECRET_KEY=${SECRET_KEY}|g" .env
    sed -i "s|JWT_SECRET_KEY=your-jwt-secret-key-change-this|JWT_SECRET_KEY=${JWT_SECRET_KEY}|g" .env
    sed -i "s|POSTGRES_PASSWORD=changeme|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|g" .env
    sed -i "s|REDIS_PASSWORD=changeme|REDIS_PASSWORD=${REDIS_PASSWORD}|g" .env
fi

echo "✓ Secrets generated and configured"

# Prompt for deployment type
echo ""
echo "Select deployment type:"
echo "1) Local Development (Docker Compose)"
echo "2) Kubernetes (Production)"
echo "3) Skip deployment setup"
read -p "Enter choice (1-3): " -n 1 -r DEPLOY_CHOICE
echo ""

case $DEPLOY_CHOICE in
    1)
        echo ""
        echo "Setting up for local development with Docker Compose..."
        echo ""
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed. Please install Docker first."
            echo "Visit: https://docs.docker.com/get-docker/"
            exit 1
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            echo "❌ Docker Compose is not installed. Please install Docker Compose first."
            echo "Visit: https://docs.docker.com/compose/install/"
            exit 1
        fi
        
        echo "✓ Docker and Docker Compose are installed"
        echo ""
        echo "Starting services with Docker Compose..."
        docker-compose up -d
        
        echo ""
        echo "Waiting for services to be ready..."
        sleep 10
        
        echo ""
        echo "Initializing database..."
        docker-compose exec -T backend flask db upgrade || echo "⚠️  Database initialization may have failed. Try manually: docker-compose exec backend flask db upgrade"
        
        echo ""
        echo "Setup complete! 🎉"
        echo ""
        echo "Services are running:"
        echo "  - Web UI: http://localhost:3000"
        echo "  - Backend API: http://localhost:5000"
        echo "  - API Health: http://localhost:5000/api/health"
        echo ""
        echo "To create an admin user, run:"
        echo "  docker-compose exec backend flask create-admin"
        echo ""
        echo "To view logs:"
        echo "  docker-compose logs -f"
        echo ""
        echo "To stop services:"
        echo "  docker-compose down"
        ;;
        
    2)
        echo ""
        echo "Setting up for Kubernetes deployment..."
        echo ""
        
        # Check if kubectl is installed
        if ! command -v kubectl &> /dev/null; then
            echo "❌ kubectl is not installed. Please install kubectl first."
            echo "Visit: https://kubernetes.io/docs/tasks/tools/"
            exit 1
        fi
        
        echo "✓ kubectl is installed"
        
        read -p "Enter your domain name (e.g., sprucecrafter.example.com): " DOMAIN
        read -p "Enter your Docker registry (e.g., ghcr.io/username): " REGISTRY
        
        echo ""
        echo "Creating Kubernetes secrets..."
        
        kubectl create namespace sprucecrafter --dry-run=client -o yaml | kubectl apply -f -
        
        kubectl create secret generic sprucecrafter-secrets \
            --from-literal=SECRET_KEY="${SECRET_KEY}" \
            --from-literal=JWT_SECRET_KEY="${JWT_SECRET_KEY}" \
            --from-literal=POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
            --from-literal=REDIS_PASSWORD="${REDIS_PASSWORD}" \
            --from-literal=AWS_ACCESS_KEY_ID="" \
            --from-literal=AWS_SECRET_ACCESS_KEY="" \
            --from-literal=SENTRY_DSN="" \
            -n sprucecrafter \
            --dry-run=client -o yaml | kubectl apply -f -
        
        echo "✓ Secrets created in Kubernetes"
        echo ""
        echo "Next steps:"
        echo "1. Update k8s-deployment.yaml with your domain: ${DOMAIN}"
        echo "2. Update image references to: ${REGISTRY}/sprucecrafter-backend:latest"
        echo "3. Build and push Docker images"
        echo "4. Deploy: kubectl apply -f k8s-deployment.yaml"
        echo ""
        echo "See docs/DEPLOYMENT.md for detailed instructions"
        ;;
        
    3)
        echo "Skipping deployment setup."
        ;;
        
    *)
        echo "Invalid choice. Skipping deployment setup."
        ;;
esac

echo ""
echo "=========================================="
echo "Configuration Summary"
echo "=========================================="
echo "Environment file: .env"
echo "Generated secrets have been set in .env"
echo ""
echo "⚠️  IMPORTANT: Keep your .env file secure!"
echo "   Never commit .env to version control"
echo ""
echo "For more information, see:"
echo "  - docs/DEPLOYMENT.md - Full deployment guide"
echo "  - docs/ARCHITECTURE.md - Architecture overview"
echo "  - .env.example - All configuration options"
echo ""
echo "Happy deploying! 🚀"
