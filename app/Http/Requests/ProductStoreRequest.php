<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
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
            'images' => 'required|array|min:1',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,avif,webp|max:51200', // 50MB
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
            'images.required' => '画像は最低1枚必要です。',
            'images.min' => '画像は最低1枚必要です。',
            'images.*.image' => '画像ファイルをアップロードしてください。',
            'images.*.mimes' => '画像はjpeg、png、jpg、gif、avif、webp形式のみ対応しています。',
            'images.*.max' => '画像サイズは50MB以下にしてください。',
            'tags.*.exists' => '選択されたタグが無効です。',
            'tag_names.*.max' => 'タグ名は50文字以内で入力してください。',
        ];
    }
}
