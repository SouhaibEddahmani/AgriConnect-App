<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->string('license')->nullable();
            $table->string('country')->nullable();
            $table->integer('year')->nullable();
            $table->boolean('isBusiness')->default(false);
            $table->string('contactName')->nullable();
            $table->string('contactPhone')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->boolean('termsAccepted')->default(false);
            $table->json('availableSeasons')->nullable();
            $table->integer('minRentalDays')->nullable();
            $table->decimal('deposit', 8, 2)->nullable();
            $table->enum('status', ['draft', 'published', 'active', 'inactive'])->default('draft'); // Already exists, do not add again
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->json('images')->nullable();
            $table->decimal('price', 8, 2)->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->string('pricingType')->nullable();
            $table->decimal('minPrice', 8, 2)->nullable();
            $table->decimal('price_low', 8, 2)->nullable();
            $table->decimal('price_medium', 8, 2)->nullable();
            $table->decimal('price_high', 8, 2)->nullable();
            $table->decimal('price_very_high', 8, 2)->nullable();
        });
    }
    public function down(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropColumn([
                'license','country','year','isBusiness','contactName','contactPhone','address','city','state','zip','termsAccepted','availableSeasons','minRentalDays','deposit','user_id','images','price','lat','lng','pricingType','minPrice','price_low','price_medium','price_high','price_very_high'
            ]);
        });
    }
};
