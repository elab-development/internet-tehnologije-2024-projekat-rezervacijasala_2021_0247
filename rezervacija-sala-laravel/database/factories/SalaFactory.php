<?php

namespace Database\Factories;

use App\Models\Sala;
use Illuminate\Database\Eloquent\Factories\Factory;

class SalaFactory extends Factory
{

    protected $model = Sala::class;
    public function definition()
    {
        return [
            'naziv' => $this->faker->word(),
            'tip' => $this->faker->randomElement(['učionica', 'konferencijska sala', 'sala za sastanke']),
            'kapacitet' => $this->faker->numberBetween(10, 100),
            'opis' => $this->faker->sentence(),
            'status' => $this->faker->boolean(),
        ];
    }
}
