<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            SalaSeeder::class,
            RezervacijaSeeder::class,
            PreporukaSeeder::class,
        ]);

        // ADMIN korisnik
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],  
            [
                'name' => 'Admin',
                'password' => Hash::make('admin12345'),  
                'role' => 'administrator',              
            ]
        );
    }
}
