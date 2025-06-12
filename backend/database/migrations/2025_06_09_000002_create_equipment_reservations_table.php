<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('equipment_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('equipment_id')->constrained('equipment')->onDelete('cascade');
            $table->dateTime('start_date');
            $table->dateTime('end_date')->nullable();
            $table->enum('status', ['active', 'cancelled', 'completed'])->default('active');
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('equipment_reservations');
    }
};
