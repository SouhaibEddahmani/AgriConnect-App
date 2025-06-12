<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\EquipmentReservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class EquipmentController extends Controller
{
    // GET /api/equipment
    public function index(Request $request)
    {
        $query = Equipment::query();
        // Filtering
        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }
        if ($priceRange = $request->query('priceRange')) {
            if ($priceRange === 'under-300') $query->where('daily_rate', '<', 300);
            elseif ($priceRange === '300-350') $query->whereBetween('daily_rate', [300, 350]);
            elseif ($priceRange === 'over-350') $query->where('daily_rate', '>', 350);
        }
        if ($availability = $request->query('availability')) {
            if ($availability === 'now') $query->where('status', 'active');
        }
        if ($sortBy = $request->query('sortBy')) {
            if ($sortBy === 'price-low') $query->orderBy('daily_rate', 'asc');
            elseif ($sortBy === 'price-high') $query->orderBy('daily_rate', 'desc');
        } else {
            $query->orderBy('id', 'desc');
        }
        $perPage = (int) $request->query('per_page', 10);
        $equipment = $query->paginate($perPage);
        $equipment->getCollection()->transform(function ($item) {
            // Normalize image paths
            $item->images = collect($item->images ?? [])->map(function($img) {
                $img = ltrim($img, '/');
                if (!str_starts_with($img, 'storage/equipment/')) {
                    if (str_starts_with($img, 'equipment/')) {
                        $img = 'storage/' . $img;
                    } else {
                        $img = 'storage/equipment/' . $img;
                    }
                }
                return $img;
            })->toArray();
            $item->distance = null;
            return $item;
        });
        return response()->json([
            'data' => $equipment->items(),
            'total' => $equipment->total(),
            'current_page' => $equipment->currentPage(),
            'last_page' => $equipment->lastPage(),
        ]);
    }

    // GET /api/equipment/types
    public function types()
    {
        $types = ["Tractors", "Harvesters", "Planters", "Irrigation", "Seeders", "Sprayers"];
        return response()->json(['data' => $types]);
    }

    // POST /api/equipment/{id}/reserve
    public function reserve(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $equipment = Equipment::find($id);
        if (!$equipment || $equipment->status !== 'active') {
            return response()->json(['message' => 'Equipment not available for reservation'], 400);
        }
        $validated = $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
        ]);
        // Prevent overlapping reservations
        $overlap = \App\Models\EquipmentReservation::where('equipment_id', $equipment->id)
            ->where('status', 'active')
            ->where(function($q) use ($validated) {
                $q->whereBetween('start_date', [$validated['start_date'], $validated['end_date']])
                  ->orWhereBetween('end_date', [$validated['start_date'], $validated['end_date']])
                  ->orWhere(function($q2) use ($validated) {
                      $q2->where('start_date', '<=', $validated['start_date'])
                         ->where('end_date', '>=', $validated['end_date']);
                  });
            })->exists();
        if ($overlap) {
            return response()->json(['message' => 'Equipment is already reserved for the selected period.'], 422);
        }
        $reservation = EquipmentReservation::create([
            'user_id' => $user->id,
            'equipment_id' => $equipment->id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => 'pending',
        ]);
        return response()->json([
            'message' => 'Reservation created successfully',
            'reservation' => $reservation
        ]);
    }

    // POST /api/equipment (Create Listing)
    public function store(Request $request)
    {
        $user = $request->user();
        // Dynamic validation for images: accept files (FormData) or URLs (JSON)
        $imagesRule = ['nullable', 'array', 'max:5'];
        $imagesItemRule = [
            'nullable',
            function ($attribute, $value, $fail) use ($request) {
                // Extract the numeric index from the attribute (e.g., images.0)
                if (preg_match('/images\\.(\\d+)/', $attribute, $matches)) {
                    $idx = $matches[1];
                    $file = $request->file("images.$idx");
                    \Log::info("[EquipmentController] images.{$idx} value:", ['value' => $value, 'file' => $file]);
                    if ($file) {
                        if (!$file->isValid() || !in_array($file->extension(), ['jpg', 'jpeg', 'png'])) {
                            $fail('The ' . $attribute . ' must be a valid image file (jpg, jpeg, png).');
                        }
                        if ($file->getSize() > 10240 * 1024) {
                            $fail('The ' . $attribute . ' may not be greater than 10MB.');
                        }
                        return;
                    }
                }
                // If not a file, check if it's a valid URL string
                if (is_string($value)) {
                    if (!filter_var($value, FILTER_VALIDATE_URL)) {
                        $fail('The ' . $attribute . ' must be a valid URL.');
                    }
                } elseif (!is_null($value)) {
                    $fail('The ' . $attribute . ' must be a file upload or a URL.');
                }
            }
        ];
        $validated = $request->validate(array_merge([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'description' => 'nullable|string',
            'license' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'year' => 'nullable|integer',
            'isBusiness' => 'boolean',
            'contactName' => 'nullable|string|max:255',
            'contactPhone' => 'nullable|string|max:32',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'zip' => 'nullable|string|max:32',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'termsAccepted' => 'required|boolean|in:1,true',
            'availableSeasons' => 'nullable|array',
            'availableSeasons.*' => 'string',
            'pricingType' => 'nullable|string|max:32',
            'minPrice' => 'nullable|numeric',
            'price_low' => 'nullable|numeric',
            'price_medium' => 'nullable|numeric',
            'price_high' => 'nullable|numeric',
            'price_very_high' => 'nullable|numeric',
            'price' => 'nullable|numeric',
            'minRentalDays' => 'nullable|integer',
            'deposit' => 'nullable|numeric',
            'status' => ['nullable', \Illuminate\Validation\Rule::in(['draft', 'published'])],
        ], [
            'images' => $imagesRule,
            'images.*' => $imagesItemRule,
        ]));
        $imageUrls = [];
        if (isset($validated['images']) && is_array($validated['images'])) {
            foreach ($validated['images'] as $idx => $img) {
                if ($request->hasFile("images.$idx")) {
                    $file = $request->file("images.$idx");
                    if ($file && $file->isValid()) {
                        $path = $file->store('equipment', 'public');
                        // Always store as /storage/equipment/filename.ext
                        $imageUrls[] = '/storage/' . ltrim($path, '/');
                    }
                } elseif (is_string($img)) {
                    // If it's a URL, store as-is
                    $imageUrls[] = $img;
                }
            }
        }
        $equipment = Equipment::create(array_merge($validated, [
            'user_id' => $user->id,
            'images' => $imageUrls,
            // Always set status to 'active' (published) by default
            'status' => 'active',
        ]));
        return response()->json([
            'message' => 'Equipment created',
            'equipment' => $equipment
        ], 201);
    }

    // GET /api/equipment/{id} (Get Details)
    public function show(Request $request, $id)
    {
        $equipment = Equipment::with('user')->findOrFail($id);
        $user = $request->user();
        $isOwner = $user && ($user->id === $equipment->user_id || ($user->is_admin ?? false));
        // Only return reservation info if requested by owner or admin
        $reservations = [];
        if ($isOwner) {
            $reservations = $equipment->reservations()->orderBy('start_date', 'desc')->get();
        }
        // Normalize image paths
        $images = collect($equipment->images ?? [])->map(function($img) {
            // Remove leading slash if present
            $img = ltrim($img, '/');
            // Ensure it starts with storage/equipment/
            if (!str_starts_with($img, 'storage/equipment/')) {
                // If it already contains 'equipment/', just prepend 'storage/'
                if (str_starts_with($img, 'equipment/')) {
                    $img = 'storage/' . $img;
                } else {
                    $img = 'storage/equipment/' . $img;
                }
            }
            return $img;
        })->toArray();
        $equipmentArr = $equipment->toArray();
        $equipmentArr['images'] = $images;
        return response()->json([
            'equipment' => $equipmentArr,
            'isOwner' => $isOwner,
            'reservations' => $reservations,
        ]);
    }

    // DELETE /api/equipment/{id} (Delete Listing)
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $equipment = Equipment::findOrFail($id);
        if ($equipment->user_id !== $user->id && !($user->is_admin ?? false)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        // Delete images from storage
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

    // GET /api/my-equipment (User's Listings)
    public function myEquipment(Request $request)
    {
        $user = $request->user();
        $listings = Equipment::where('user_id', $user->id)->get();
        return response()->json(['data' => $listings]);
    }

    // GET /api/user-equipment (User's Equipment)
    public function userEquipment(Request $request)
    {
        $user = $request->user();
        $equipment = Equipment::where('user_id', $user->id)->get();
        // Normalize image paths for each equipment
        $equipment = $equipment->map(function ($item) {
            $item->images = collect($item->images ?? [])->map(function($img) {
                $img = ltrim($img, '/');
                if (!str_starts_with($img, 'storage/equipment/')) {
                    if (str_starts_with($img, 'equipment/')) {
                        $img = 'storage/' . $img;
                    } else {
                        $img = 'storage/equipment/' . $img;
                    }
                }
                return $img;
            })->toArray();
            return $item;
        });
        return response()->json(['data' => $equipment]);
    }
}
