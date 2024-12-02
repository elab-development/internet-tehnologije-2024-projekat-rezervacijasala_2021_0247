<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sala extends Model
{
    use HasFactory;

    protected $fillable = ['naziv', 'tip', 'kapacitet', 'opis', 'status'];

    public function rezervacije()
    {
        return $this->hasMany(Rezervacija::class);
    }

    public function preporuke()
    {
        return $this->hasMany(Preporuka::class);
    }
}
