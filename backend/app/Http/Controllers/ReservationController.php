<?php

namespace App\Http\Controllers;

use App\Models\EquipmentReservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReservationController extends Controller
{
    // GET /api/reservations/{id}
    public function show($id)
    {
        $reservation = EquipmentReservation::with(['equipment', 'user'])->findOrFail($id);
        $user = Auth::user();
        if ($user && ($user->id === $reservation->user_id || ($user->is_admin ?? false))) {
            return response()->json(['reservation' => $reservation]);
        }
        return response()->json(['message' => 'Forbidden'], 403);
    }

    // GET /api/user/reservations
    public function userReservations(Request $request)
    {
        $user = $request->user();
        $reservations = EquipmentReservation::with('equipment')
            ->where('user_id', $user->id)
            ->orderBy('start_date', 'desc')
            ->get();
        return response()->json(['data' => $reservations]);
    }
}
