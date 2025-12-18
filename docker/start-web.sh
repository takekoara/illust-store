#!/bin/bash

cd /var/www

echo "==> Environment check..."
echo "PORT: ${PORT:-8080}"
echo "APP_ENV: ${APP_ENV:-not set}"
echo "DB_CONNECTION: ${DB_CONNECTION:-not set}"
echo "DATABASE_URL set: $(if [ -n "$DATABASE_URL" ]; then echo 'yes'; else echo 'no'; fi)"

echo "==> Running config:clear..."
php artisan config:clear

echo "==> Running optimize..."
php artisan optimize || echo "Optimize failed but continuing..."

echo "==> Running migrations..."
php artisan migrate --force || echo "Migration failed but continuing..."

echo "==> Running seeder..."
php artisan db:seed --class=ProductionProductSeeder --force || echo "Seeder failed but continuing..."

echo "==> Creating storage link..."
php artisan storage:link || echo "Storage link failed but continuing..."

echo "==> Starting web server on port ${PORT:-8080}..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
