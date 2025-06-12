<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    protected $model = \App\Models\User::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'prenom' => $this->faker->firstName(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'), // default password
            'is_admin' => false,
            'address' => $this->faker->address(),
            'phone_number' => $this->faker->phoneNumber(),
            'remember_token' => Str::random(10),
        ];
    }

    public function admin()
    {
        return $this->state([
            'name' => 'Admin',
            'prenom' => 'Super',
            'email' => 'admin@admin',
            'password' => Hash::make('admin123'),
            'is_admin' => true,
        ]);
    }
}
