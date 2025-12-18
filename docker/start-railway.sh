#!/bin/bash
set -e

cd /var/www

echo "==> Running Laravel setup..."
php artisan config:clear || true
php artisan optimize || true
php artisan migrate --force || true
php artisan db:seed --class=ProductionProductSeeder --force || true
php artisan storage:link || true

echo "==> Starting supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

