<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $q   = trim((string) $request->get('q', ''));
        $per = (int) $request->get('per_page', 15);

        $users = User::query()
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($w) use ($q) {
                    $w->where('name', 'like', "%$q%")
                      ->orWhere('email', 'like', "%$q%")
                      ->orWhere('role', 'like', "%$q%");
                });
            })
            ->orderByDesc('id')
            ->paginate($per);

        return response()->json($users, 200);
    }

    public function show(User $user)
    {
        return response()->json($user, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required','string','max:255'],
            'email'    => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:6'],
            'role'     => ['required', Rule::in(['korisnik','menadzer','administrator'])],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json($user, 201);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'     => ['sometimes','string','max:255'],
            'email'    => ['sometimes','email','max:255', Rule::unique('users','email')->ignore($user->id)],
            'password' => ['sometimes','nullable','string','min:6'],
            'role'     => ['sometimes', Rule::in(['korisnik','menadzer','administrator'])],
        ]);

        if (isset($validated['password']) && $validated['password']) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // zaštita: ne menjaš sam sebi admin ulogu
        if (auth()->id() === $user->id && isset($validated['role']) && $validated['role'] !== 'administrator') {
            return response()->json(['message' => 'Ne možete sebi skinuti administratorsku ulogu.'], 422);
        }

        $user->update($validated);

        return response()->json($user, 200);
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'Ne možete obrisati sopstveni nalog.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Korisnik obrisan.'], 200);
    }
}
