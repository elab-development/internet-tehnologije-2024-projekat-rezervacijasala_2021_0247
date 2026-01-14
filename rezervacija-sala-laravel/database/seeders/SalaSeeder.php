<?php

namespace Database\Seeders;

use App\Models\Sala;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Factories\Sequence;

class SalaSeeder extends Seeder
{
    public function run(): void
    {
        // Parametri "mape"
        $floors   = [0, 1, 2];  // spratovi
        $cellW    = 2;          // širina svake sobe u ćelijama
        $cellH    = 2;          // visina svake sobe u ćelijama
        $cols     = 10;         // koliko “pločica” po širini sprata
        $rows     = 6;          // po visini
        $perFloor = min(intval(($cols * $rows) / ($cellW * $cellH)), 12); // do 12 soba po spratu

        $sequenceStates = [];

        foreach ($floors as $f) {
            $placed = 0;
       
            for ($y = 0; $y + $cellH <= $rows && $placed < $perFloor; $y += $cellH) {
                for ($x = 0; $x + $cellW <= $cols && $placed < $perFloor; $x += $cellW) {
                    $sequenceStates[] = [
                        'floor'    => $f,
                        'layout_x' => $x,
                        'layout_y' => $y,
                        'layout_w' => $cellW,
                        'layout_h' => $cellH,
                    ];
                    $placed++;
                }
            }
        }
 

        Sala::factory()
            ->count(count($sequenceStates))
            ->state(new Sequence(...$sequenceStates))
            ->create();
    }
}
