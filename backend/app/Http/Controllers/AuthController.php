<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'prenom' => $validated['prenom'] ?? null,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_admin' => false,
        ]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
            ],
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
            ],
            'token' => $token,
        ]);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'prenom' => $user->prenom,
            'email' => $user->email,
            'is_admin' => $user->is_admin,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'prenom' => $user->prenom,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'currentPassword' => 'required|string',
            'newPassword' => 'required|string|min:6',
            'confirmPassword' => 'required|string|same:newPassword',
        ]);

        if (!\Hash::check($validated['currentPassword'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 401);
        }

        $user->password = \Hash::make($validated['newPassword']);
        $user->save();

        // Optionally: $request->user()->tokens()->delete(); // Invalidate all tokens

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }
}
