<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('subtitle')->nullable();
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->decimal('daily_rate', 8, 2)->nullable(); // Make daily_rate nullable for flexibility
            $table->boolean('gps_ready')->default(false);
            $table->integer('hp')->nullable();
            $table->string('type');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};
