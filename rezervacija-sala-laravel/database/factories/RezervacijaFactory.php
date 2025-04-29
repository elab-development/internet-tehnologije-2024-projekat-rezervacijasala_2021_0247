<?php

namespace Database\Factories;

use App\Models\Rezervacija;
use App\Models\Sala;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RezervacijaFactory extends Factory
{
    protected $model = Rezervacija::class;

    public function definition()
    {
        return [
            'sala_id' => Sala::factory(),
            'user_id' => User::factory(),
            'datum' => $this->faker->date(),
            'vreme_od' => $this->faker->time(),
            'vreme_do' => $this->faker->time('H:i', '+1 hours'),
            'tip_dogadjaja' => $this->faker->randomElement(['konferencija', 'sastanak', 'predavanje']),
            'status' => $this->faker->randomElement(['potvrđeno', 'na čekanju', 'otkazano']),
        ];
    }
}
