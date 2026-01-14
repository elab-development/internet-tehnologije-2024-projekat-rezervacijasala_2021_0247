<?php

namespace Database\Factories;

use App\Models\Sala;
use Illuminate\Database\Eloquent\Factories\Factory;

class SalaFactory extends Factory
{

    protected $model = Sala::class;
    public function definition()
    {
         
        $gridCols = 20;   // broj ćelija po širini
        $gridRows = 12;   // broj ćelija po visini

        $w = $this->faker->numberBetween(2, 4);
        $h = $this->faker->numberBetween(2, 3);
        $x = $this->faker->numberBetween(0, max(0, $gridCols - $w));
        $y = $this->faker->numberBetween(0, max(0, $gridRows - $h));
        return [
            'naziv' => $this->faker->word(),
            'tip' => $this->faker->randomElement(['učionica', 'konferencijska sala', 'sala za sastanke']),
            'kapacitet' => $this->faker->numberBetween(10, 100),
            'opis' => $this->faker->sentence(),
            'status' => $this->faker->boolean(),

             // NOVO: layout
            'floor'      => $this->faker->numberBetween(0, 3),
            'layout_x'   => $x,
            'layout_y'   => $y,
            'layout_w'   => $w,
            'layout_h'   => $h,
        ];
    }
}
