<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;

class MessageStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $conversation = $this->route('conversation');
        $userId = $this->user()?->id;

        return $userId && (
            $conversation->user_one_id === $userId ||
            $conversation->user_two_id === $userId
        );
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'message' => 'required|string|max:5000',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // レート制限: 1分間に最大30メッセージ
            $key = 'send-message:'.$this->user()->id;
            if (RateLimiter::tooManyAttempts($key, 30)) {
                $seconds = RateLimiter::availableIn($key);
                $validator->errors()->add(
                    'message',
                    "メッセージの送信が多すぎます。{$seconds}秒後に再度お試しください。"
                );
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'message.required' => 'メッセージを入力してください。',
            'message.max' => 'メッセージは5000文字以内で入力してください。',
        ];
    }

    /**
     * Handle a passed validation attempt.
     */
    protected function passedValidation()
    {
        // レート制限を記録
        $key = 'send-message:'.$this->user()->id;
        RateLimiter::hit($key, 60); // 60秒のウィンドウ
    }
}
