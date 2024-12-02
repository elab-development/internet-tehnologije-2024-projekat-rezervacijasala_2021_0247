<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Preporuka extends Model
{
    use HasFactory;

    protected $fillable = ['sala_id', 'user_id', 'datum', 'vreme_od', 'vreme_do', 'tip_dogadjaja'];

    public function sala()
    {
        return $this->belongsTo(Sala::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}