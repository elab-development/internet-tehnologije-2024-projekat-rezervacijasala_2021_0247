<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePreporukasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('preporukas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sala_id')->constrained('salas')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('datum');
            $table->time('vreme_od');
            $table->time('vreme_do');
            $table->string('tip_dogadjaja'); // tip događaja za koji se preporuka daje
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('preporukas');
    }
}
