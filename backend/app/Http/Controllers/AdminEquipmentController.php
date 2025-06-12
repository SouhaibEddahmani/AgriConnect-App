<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use Illuminate\Http\Request;

class AdminEquipmentController extends Controller
{
    // GET /api/admin/equipment
    public function index(Request $request)
    {
        $query = \App\Models\Equipment::with('user');
        // Optionally add filters for admin
        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }
        $equipment = $query->orderBy('id', 'desc')->paginate(20);
        // Format each equipment item for frontend
        $data = collect($equipment->items())->map(function ($item) {
            $owner = $item->user;
            if (!$owner) {
                $ownerObj = [ 'name' => 'Admin' ];
            } else {
                $ownerObj = [ 'id' => $owner->id, 'name' => $owner->name . (isset($owner->prenom) ? (' ' . $owner->prenom) : '') ];
            }
            return array_merge($item->toArray(), [
                'user' => $ownerObj,
                'type' => $item->type,
                'price' => $item->price ?? $item->minPrice ?? null,
            ]);
        });
        return response()->json([
            'data' => $data,
            'total' => $equipment->total(),
            'current_page' => $equipment->currentPage(),
            'last_page' => $equipment->lastPage(),
        ]);
    }

    // DELETE /api/admin/equipment/{id}
    public function destroy($id)
    {
        $equipment = Equipment::findOrFail($id);
        // Optionally: delete images from storage
        if (is_array($equipment->images)) {
            foreach ($equipment->images as $imgUrl) {
                $path = str_replace('/storage/', '', $imgUrl);
                if (\Storage::disk('public')->exists($path)) {
                    \Storage::disk('public')->delete($path);
                }
            }
        }
        $equipment->delete();
        return response()->json(['message' => 'Equipment deleted']);
    }
}
