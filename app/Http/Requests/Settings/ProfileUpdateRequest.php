<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use App\Models\Pipeline;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'calcom_url' => ['nullable', 'string', 'max:255', 'regex:/^[a-zA-Z0-9-_\/]+$/'], // Updated validation
            'default_pipeline_id' => ['nullable', 'string', 'exists:pipelines,id'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Convert empty string to null for default_pipeline_id
        if ($this->has('default_pipeline_id') && $this->default_pipeline_id === '') {
            $this->merge(['default_pipeline_id' => null]);
        }
    }
}
