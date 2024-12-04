<?php

namespace Database\Seeders;

use App\Models\Preporuka;
use Illuminate\Database\Seeder;

class PreporukaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Preporuka::factory(15)->create();
    }
}
