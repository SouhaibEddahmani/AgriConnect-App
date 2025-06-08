<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    // List users with pagination
    public function listUsers(Request $request)
    {
        $perPage = (int) $request->query('per_page', 10);
        $users = User::orderBy('id', 'desc')->paginate($perPage);
        return response()->json($users);
    }

    // Promote user to admin (super admin only)
    public function promoteToAdmin(Request $request, $userId)
    {
        if (!$this->isSuperAdmin($request->user())) {
            return response()->json(['message' => 'Forbidden: Only super admin can promote admins'], 403);
        }
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        if ($user->is_admin) {
            return response()->json(['message' => 'User is already an admin'], 400);
        }
        $user->is_admin = true;
        $user->save();
        return response()->json(['message' => 'User promoted to admin', 'user' => $user]);
    }

    // Demote admin to user (super admin only, cannot demote self)
    public function demoteAdmin(Request $request, $userId)
    {
        if (!$this->isSuperAdmin($request->user())) {
            return response()->json(['message' => 'Forbidden: Only super admin can demote admins'], 403);
        }
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        if (!$user->is_admin) {
            return response()->json(['message' => 'User is not an admin'], 400);
        }
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Super admin cannot demote self'], 400);
        }
        $user->is_admin = false;
        $user->save();
        return response()->json(['message' => 'Admin demoted to user', 'user' => $user]);
    }

    // Delete user (super admin only, cannot delete self)
    public function deleteUser(Request $request, $userId)
    {
        if (!$this->isSuperAdmin($request->user())) {
            return response()->json(['message' => 'Forbidden: Only super admin can delete users'], 403);
        }
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Super admin cannot delete self'], 400);
        }
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    // Helper: check if user is super admin (first admin user)
    private function isSuperAdmin($user)
    {
        $firstAdmin = User::where('is_admin', true)->orderBy('id')->first();
        return $user && $firstAdmin && $user->id === $firstAdmin->id;
    }
}
