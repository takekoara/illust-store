<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImageService
{
    /**
     * Process and store product image with optimization
     *
     * @return array ['path' => string, 'thumbnail_path' => string|null]
     */
    public function processProductImage(UploadedFile $file, string $directory = 'products', array $options = []): array
    {
        $maxWidth = $options['max_width'] ?? 1920;
        $maxHeight = $options['max_height'] ?? 1920;
        $quality = $options['quality'] ?? 85;
        $generateThumbnail = $options['generate_thumbnail'] ?? true;
        $thumbnailWidth = $options['thumbnail_width'] ?? 400;
        $thumbnailHeight = $options['thumbnail_height'] ?? 400;

        // 元のファイル名を取得
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        $filename = $originalName.'_'.time().'_'.uniqid().'.'.$extension;

        // 画像をリサイズして保存
        $path = $directory.'/'.$filename;
        $resizedImage = $this->resizeImage($file->getRealPath(), $maxWidth, $maxHeight, $quality);
        Storage::disk('public')->put($path, $resizedImage);

        $result = ['path' => $path, 'thumbnail_path' => null];

        // サムネイルを生成
        if ($generateThumbnail) {
            $thumbnailFilename = $originalName.'_thumb_'.time().'_'.uniqid().'.'.$extension;
            $thumbnailPath = $directory.'/thumbnails/'.$thumbnailFilename;
            $thumbnailImage = $this->createThumbnail($file->getRealPath(), $thumbnailWidth, $thumbnailHeight, $quality);
            Storage::disk('public')->put($thumbnailPath, $thumbnailImage);
            $result['thumbnail_path'] = $thumbnailPath;
        }

        return $result;
    }

    /**
     * Resize image maintaining aspect ratio
     */
    protected function resizeImage(string $filePath, int $maxWidth, int $maxHeight, int $quality): string
    {
        if (! function_exists('imagecreatefromstring')) {
            // GDが利用できない場合は元のファイルを返す
            return file_get_contents($filePath);
        }

        $imageInfo = getimagesize($filePath);
        if (! $imageInfo) {
            return file_get_contents($filePath);
        }

        [$originalWidth, $originalHeight, $type] = $imageInfo;

        // アスペクト比を計算
        $ratio = min($maxWidth / $originalWidth, $maxHeight / $originalHeight);
        $newWidth = (int) ($originalWidth * $ratio);
        $newHeight = (int) ($originalHeight * $ratio);

        // 元の画像を読み込む
        $source = match ($type) {
            IMAGETYPE_JPEG => imagecreatefromjpeg($filePath),
            IMAGETYPE_PNG => imagecreatefrompng($filePath),
            IMAGETYPE_GIF => imagecreatefromgif($filePath),
            IMAGETYPE_AVIF => function_exists('imagecreatefromavif') ? imagecreatefromavif($filePath) : null,
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? imagecreatefromwebp($filePath) : null,
            default => null,
        };

        if (! $source) {
            return file_get_contents($filePath);
        }

        // 新しい画像を作成
        $destination = imagecreatetruecolor($newWidth, $newHeight);

        // PNG、AVIF、WebPの透明度を保持
        if (in_array($type, [IMAGETYPE_PNG, IMAGETYPE_AVIF, IMAGETYPE_WEBP])) {
            imagealphablending($destination, false);
            imagesavealpha($destination, true);
            $transparent = imagecolorallocatealpha($destination, 255, 255, 255, 127);
            imagefilledrectangle($destination, 0, 0, $newWidth, $newHeight, $transparent);
        }

        // リサイズ
        imagecopyresampled($destination, $source, 0, 0, 0, 0, $newWidth, $newHeight, $originalWidth, $originalHeight);

        // 画像を文字列として出力
        ob_start();
        match ($type) {
            IMAGETYPE_JPEG => imagejpeg($destination, null, $quality),
            IMAGETYPE_PNG => imagepng($destination, null, (int) (9 - ($quality / 100) * 9)),
            IMAGETYPE_GIF => imagegif($destination),
            IMAGETYPE_AVIF => function_exists('imageavif') ? imageavif($destination, null, $quality) : imagejpeg($destination, null, $quality),
            IMAGETYPE_WEBP => function_exists('imagewebp') ? imagewebp($destination, null, $quality) : imagejpeg($destination, null, $quality),
            default => imagejpeg($destination, null, $quality),
        };
        $imageData = ob_get_clean();

        imagedestroy($source);
        imagedestroy($destination);

        return $imageData;
    }

    /**
     * Create thumbnail (square crop)
     */
    protected function createThumbnail(string $filePath, int $width, int $height, int $quality): string
    {
        if (! function_exists('imagecreatefromstring')) {
            return file_get_contents($filePath);
        }

        $imageInfo = getimagesize($filePath);
        if (! $imageInfo) {
            return file_get_contents($filePath);
        }

        [$originalWidth, $originalHeight, $type] = $imageInfo;

        // 元の画像を読み込む
        $source = match ($type) {
            IMAGETYPE_JPEG => imagecreatefromjpeg($filePath),
            IMAGETYPE_PNG => imagecreatefrompng($filePath),
            IMAGETYPE_GIF => imagecreatefromgif($filePath),
            IMAGETYPE_AVIF => function_exists('imagecreatefromavif') ? imagecreatefromavif($filePath) : null,
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? imagecreatefromwebp($filePath) : null,
            default => null,
        };

        if (! $source) {
            return file_get_contents($filePath);
        }

        // 正方形にクロップするサイズを計算
        $size = min($originalWidth, $originalHeight);
        $x = (int) (($originalWidth - $size) / 2);
        $y = (int) (($originalHeight - $size) / 2);

        // 新しい画像を作成
        $destination = imagecreatetruecolor($width, $height);

        // PNG、AVIF、WebPの透明度を保持
        if (in_array($type, [IMAGETYPE_PNG, IMAGETYPE_AVIF, IMAGETYPE_WEBP])) {
            imagealphablending($destination, false);
            imagesavealpha($destination, true);
            $transparent = imagecolorallocatealpha($destination, 255, 255, 255, 127);
            imagefilledrectangle($destination, 0, 0, $width, $height, $transparent);
        }

        // リサイズ（中央からクロップ）
        imagecopyresampled($destination, $source, 0, 0, $x, $y, $width, $height, $size, $size);

        // 画像を文字列として出力
        ob_start();
        match ($type) {
            IMAGETYPE_JPEG => imagejpeg($destination, null, $quality),
            IMAGETYPE_PNG => imagepng($destination, null, (int) (9 - ($quality / 100) * 9)),
            IMAGETYPE_GIF => imagegif($destination),
            IMAGETYPE_AVIF => function_exists('imageavif') ? imageavif($destination, null, $quality) : imagejpeg($destination, null, $quality),
            IMAGETYPE_WEBP => function_exists('imagewebp') ? imagewebp($destination, null, $quality) : imagejpeg($destination, null, $quality),
            default => imagejpeg($destination, null, $quality),
        };
        $imageData = ob_get_clean();

        imagedestroy($source);
        imagedestroy($destination);

        return $imageData;
    }

    /**
     * Delete image and its thumbnail
     */
    public function deleteImage(string $imagePath, ?string $thumbnailPath = null): void
    {
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }

        if ($thumbnailPath && Storage::disk('public')->exists($thumbnailPath)) {
            Storage::disk('public')->delete($thumbnailPath);
        }
    }
}
