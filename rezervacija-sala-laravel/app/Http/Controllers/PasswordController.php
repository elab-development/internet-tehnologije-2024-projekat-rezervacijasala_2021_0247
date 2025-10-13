<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class PasswordController extends Controller
{
    public function posaljiLink(Request $request)
    {
        // 1) validacija (ako padne, vrati 422 sa detaljima)
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        try {
            // 2) pošalji link
            $status = Password::broker()->sendResetLink(
                $request->only('email')
            );

            // 3) mapiranje statusa na jasne odgovore
            switch ($status) {
                case Password::RESET_LINK_SENT:
                    return response()->json([
                        'message' => 'Link za reset lozinke je poslat na email.',
                        'status'  => $status,
                    ], 200);

                case Password::RESET_THROTTLED: // previše pokušaja
                    return response()->json([
                        'message' => 'Previše pokušaja. Pokušajte ponovo za nekoliko minuta.',
                        'status'  => $status,
                    ], 429);

                case Password::INVALID_USER: // teoretski ne bi trebalo jer exists:users,email
                    return response()->json([
                        'message' => 'Korisnik sa tim email-om ne postoji.',
                        'status'  => $status,
                    ], 404);

                default:
                    // loguj nepoznat status
                    Log::warning('Password reset unexpected status', ['status' => $status]);
                    return response()->json([
                        'message' => 'Neuspešno slanje linka za reset lozinke.',
                        'status'  => $status,
                    ], 400);
            }
        } catch (\Throwable $e) {
            // ako mailer padne ili nešto drugo
            Log::error('Password reset exception', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Greška pri slanju email-a za reset lozinke.',
                'error'   => app()->environment('local') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function restartujLozinku(Request $request)
    {
        $request->validate([
            'email'    => 'required|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed',
            'token'    => 'required|string',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill(['password' => bcrypt($password)])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Lozinka je uspešno promenjena.'], 200);
        }

        return response()->json([
            'message' => 'Neuspešno resetovanje lozinke.',
            'status'  => $status
        ], 400);
    }
}
