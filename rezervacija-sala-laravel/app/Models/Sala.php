<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sala extends Model
{
    use HasFactory;

    protected $fillable = [
        'naziv','tip','kapacitet','opis','status','file_path','cena',
        // NOVO:
        'floor','layout_x','layout_y','layout_w','layout_h',
    ];

    protected $casts = [
        'status'    => 'boolean',
        'kapacitet' => 'integer',
        'floor'     => 'integer',
        'layout_x'  => 'integer',
        'layout_y'  => 'integer',
        'layout_w'  => 'integer',
        'layout_h'  => 'integer',
        'cena'      => 'decimal:2',
    ];

    public function rezervacije()
    {
        return $this->hasMany(Rezervacija::class);
    }

    public function preporuke()
    {
        return $this->hasMany(Preporuka::class);
    }
}
