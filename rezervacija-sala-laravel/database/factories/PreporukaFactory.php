<?php

namespace Database\Factories;

use App\Models\Preporuka;
use App\Models\Sala;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PreporukaFactory extends Factory
{
    protected $model = Preporuka::class;
    public function definition()
    {
        return [
            'sala_id' => Sala::factory(),
            'user_id' => User::factory(),
            'datum' => $this->faker->date(),
            'vreme_od' => $this->faker->time(),
            'vreme_do' => $this->faker->time('H:i', '+1 hours'),
            'tip_dogadjaja' => $this->faker->randomElement(['konferencija', 'sastanak', 'predavanje']),
        ];
    }
}
