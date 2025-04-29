<?php

namespace Database\Seeders;

use App\Models\Rezervacija;
use Illuminate\Database\Seeder;

class RezervacijaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Rezervacija::factory(20)->create();
    }
}
