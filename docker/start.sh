#!/bin/bash
set -e

cd /var/www

echo "==> Starting Laravel initialization..."

# Laravel初期化
php artisan config:clear || true
php artisan optimize || true
php artisan migrate --force || true
php artisan db:seed --class=ProductionProductSeeder --force || true
php artisan storage:link || true

echo "==> Starting services..."

# PHP-FPMをバックグラウンドで起動
php-fpm -D

# Reverbをバックグラウンドで起動
php artisan reverb:start --host=127.0.0.1 --port=8081 &

# Nginxをフォアグラウンドで起動（メインプロセス）
exec nginx -g "daemon off;"

