<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'subtitle', 'description', 'image_url', 'daily_rate', 'status', 'gps_ready', 'hp', 'type', 'latitude', 'longitude',
        'license', 'country', 'year', 'isBusiness', 'contactName', 'contactPhone', 'address', 'city', 'state', 'zip', 'termsAccepted',
        'availableSeasons', 'minRentalDays', 'deposit', 'user_id', 'images', 'price',
        'lat', 'lng', 'pricingType', 'minPrice', 'price_low', 'price_medium', 'price_high', 'price_very_high'
    ];
    protected $casts = [
        'availableSeasons' => 'array',
        'images' => 'array',
        'isBusiness' => 'boolean',
        'termsAccepted' => 'boolean',
        'price' => 'decimal:2',
        'deposit' => 'decimal:2',
        'lat' => 'decimal:7',
        'lng' => 'decimal:7',
        'minPrice' => 'decimal:2',
        'price_low' => 'decimal:2',
        'price_medium' => 'decimal:2',
        'price_high' => 'decimal:2',
        'price_very_high' => 'decimal:2',
    ];
    public function user() {
        return $this->belongsTo(\App\Models\User::class);
    }
    public function reservations() {
        return $this->hasMany(\App\Models\EquipmentReservation::class, 'equipment_id');
    }
}
