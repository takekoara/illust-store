# マルチステージビルド: ビルドステージ
FROM node:22-alpine AS node-builder

WORKDIR /app

# ビルド時に環境変数を受け取る
ARG VITE_STRIPE_KEY
ARG VITE_REVERB_APP_KEY
ARG VITE_REVERB_HOST
ARG VITE_REVERB_PORT
ARG VITE_REVERB_SCHEME

ENV VITE_STRIPE_KEY=$VITE_STRIPE_KEY
ENV VITE_REVERB_APP_KEY=$VITE_REVERB_APP_KEY
ENV VITE_REVERB_HOST=$VITE_REVERB_HOST
ENV VITE_REVERB_PORT=$VITE_REVERB_PORT
ENV VITE_REVERB_SCHEME=$VITE_REVERB_SCHEME

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 本番用PHPイメージ
FROM php:8.2-cli-bookworm

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libpng-dev \
    libzip-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libpq-dev \
    libonig-dev \
    curl \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# PHP拡張機能をインストール
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo pdo_pgsql pdo_mysql zip exif pcntl bcmath

# Composerをインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# アプリケーションファイルをコピー
COPY . .

# Composer依存関係をインストール
RUN composer install --no-dev --optimize-autoloader --no-interaction

# ビルド済みアセットをコピー
COPY --from=node-builder /app/public/build ./public/build

# ディレクトリ作成と権限設定
RUN mkdir -p storage/framework/{sessions,views,cache} \
    && mkdir -p storage/logs \
    && chmod -R 777 storage bootstrap/cache

ENV APP_ENV=production
ENV APP_DEBUG=false

# Railwayは$PORT環境変数を使用
EXPOSE 8080

# 起動スクリプト
COPY docker/start-web.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

CMD ["/usr/local/bin/start.sh"]
