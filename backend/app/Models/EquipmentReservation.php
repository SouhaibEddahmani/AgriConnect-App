<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EquipmentReservation extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id', 'equipment_id', 'start_date', 'end_date', 'status'
    ];
    public function equipment() { return $this->belongsTo(Equipment::class); }
    public function user() { return $this->belongsTo(\App\Models\User::class); }
}
