# マルチステージビルド: ビルドステージ
FROM node:22-alpine AS node-builder

WORKDIR /app

# ビルド時に環境変数を受け取る（ARG）
ARG VITE_STRIPE_KEY
ARG VITE_REVERB_APP_KEY
ARG VITE_REVERB_HOST
ARG VITE_REVERB_PORT
ARG VITE_REVERB_SCHEME

# 環境変数として設定（ビルド時に使用可能にする）
ENV VITE_STRIPE_KEY=$VITE_STRIPE_KEY
ENV VITE_REVERB_APP_KEY=$VITE_REVERB_APP_KEY
ENV VITE_REVERB_HOST=$VITE_REVERB_HOST
ENV VITE_REVERB_PORT=$VITE_REVERB_PORT
ENV VITE_REVERB_SCHEME=$VITE_REVERB_SCHEME

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# Node.js依存関係をインストール
RUN npm ci

# ソースコードをコピー
COPY . .

# フロントエンドをビルド
RUN npm run build

# 本番用PHPイメージ
FROM php:8.2-fpm-alpine AS php-base

# ビルド用の依存関係をインストール
RUN apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    postgresql-dev \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    freetype-dev \
    libjpeg-turbo-dev

# 実行時用の依存関係をインストール
RUN apk add --no-cache \
    git \
    curl \
    libpng \
    libzip \
    postgresql-libs \
    oniguruma \
    freetype \
    libjpeg-turbo \
    nodejs \
    npm

# PHP拡張機能をインストール
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip

# ビルド依存関係を削除
RUN apk del .build-deps

# Composerをインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 作業ディレクトリを設定
WORKDIR /var/www/html

# アプリケーションファイルをコピー
COPY --chown=www-data:www-data . .

# Composer依存関係をインストール（本番用）
RUN composer install --optimize-autoloader --no-dev --no-interaction

# ビルド済みのフロントエンドアセットをコピー
COPY --from=node-builder --chown=www-data:www-data /app/public/build ./public/build

# ストレージとブートストラップキャッシュのディレクトリを作成
RUN mkdir -p storage/framework/{sessions,views,cache} \
    && mkdir -p storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache

# 本番用イメージ
FROM php:8.2-cli-alpine

# 実行時用の依存関係をインストール
RUN apk add --no-cache \
    libpng \
    libzip \
    postgresql-libs \
    oniguruma \
    freetype \
    libjpeg-turbo

# 作業ディレクトリを設定
WORKDIR /var/www/html

# アプリケーションファイルをコピー
COPY --from=php-base --chown=www-data:www-data /var/www/html .

# ストレージとブートストラップキャッシュのディレクトリを作成
RUN mkdir -p storage/framework/{sessions,views,cache} \
    && mkdir -p storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache

# 環境変数を設定
ENV APP_ENV=production
ENV APP_DEBUG=false

# ポートを公開
EXPOSE 8000

# 起動コマンド
CMD php artisan config:clear && \
    php artisan optimize && \
    php artisan migrate --force && \
    php artisan db:seed --class=ProductionProductSeeder --force || true && \
    php artisan storage:link || true && \
    php -S 0.0.0.0:${PORT:-8000} -t public

