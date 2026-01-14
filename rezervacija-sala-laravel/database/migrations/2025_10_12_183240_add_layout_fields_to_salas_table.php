<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    //dodajemo ovu migraciju da bismo mogli da napravimo vizuelni raspored sala na spratovima
    public function up(): void
    {
        Schema::table('salas', function (Blueprint $table) {
            $table->integer('floor')->default(0)->after('status');               
            $table->unsignedSmallInteger('layout_x')->nullable()->after('floor');
            $table->unsignedSmallInteger('layout_y')->nullable()->after('layout_x');
            $table->unsignedSmallInteger('layout_w')->nullable()->default(1)->after('layout_y');
            $table->unsignedSmallInteger('layout_h')->nullable()->default(1)->after('layout_w');

            $table->index(['floor', 'layout_x', 'layout_y'], 'salas_floor_layout_idx');
        });
    }

    public function down(): void
    {
        Schema::table('salas', function (Blueprint $table) {
            $table->dropIndex('salas_floor_layout_idx');
            $table->dropColumn(['floor', 'layout_x', 'layout_y', 'layout_w', 'layout_h']);
        });
    }
};
