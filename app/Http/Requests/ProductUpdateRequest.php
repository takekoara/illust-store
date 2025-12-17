<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $product = $this->route('product');
        return $this->user()?->id === $product->user_id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:51200', // 50MB
            'image_order' => 'nullable|array',
            'image_order.*' => 'integer|exists:product_images,id',
            'combined_order' => 'nullable|array',
            'combined_order.*.type' => 'required|in:new,existing',
            'combined_order.*.index' => 'required|integer',
            'combined_order.*.id' => 'nullable|integer|exists:product_images,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'tag_names' => 'nullable|array',
            'tag_names.*' => 'string|max:50',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'タイトルは必須です。',
            'title.max' => 'タイトルは255文字以内で入力してください。',
            'price.required' => '価格は必須です。',
            'price.numeric' => '価格は数値で入力してください。',
            'price.min' => '価格は0以上で入力してください。',
            'images.*.image' => '画像ファイルをアップロードしてください。',
            'images.*.mimes' => '画像はjpeg、png、jpg、gif形式のみ対応しています。',
            'images.*.max' => '画像サイズは50MB以下にしてください。',
            'image_order.*.exists' => '選択された画像が無効です。',
            'combined_order.*.type.in' => '画像のタイプが無効です。',
            'tags.*.exists' => '選択されたタグが無効です。',
            'tag_names.*.max' => 'タグ名は50文字以内で入力してください。',
        ];
    }
}

