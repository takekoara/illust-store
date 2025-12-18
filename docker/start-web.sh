#!/bin/bash
set -e

cd /var/www

echo "==> Running Laravel setup..."
php artisan config:clear || true
php artisan optimize || true
php artisan migrate --force || true
php artisan db:seed --class=ProductionProductSeeder --force || true
php artisan storage:link || true

echo "==> Starting web server on port ${PORT:-8080}..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8080}

