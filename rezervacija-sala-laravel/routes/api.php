<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\KorisnickaSesijaController;
use App\Http\Controllers\PasswordController;
use App\Http\Controllers\PreporukaController;
use App\Http\Controllers\RezervacijaController;
use App\Http\Controllers\SalaController;
use App\Http\Controllers\UserController;
use App\Models\Sala;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Ovde se registruju API rute aplikacije.
|
*/

// ---------------------------------------------------------------------
// AUTH / USER
// ---------------------------------------------------------------------

// Vraća trenutno ulogovanog korisnika (Sanctum)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Registracija / prijava / odjava
Route::post('/registracija', [KorisnickaSesijaController::class, 'register']);
Route::post('/prijava', [KorisnickaSesijaController::class, 'login']);
Route::middleware('auth:sanctum')->post('/odjava', [KorisnickaSesijaController::class, 'logout']);

// Zaboravljena lozinka
Route::post('/lozinka/posalji-link', [PasswordController::class, 'posaljiLink']);
Route::post('/lozinka/reset',        [PasswordController::class, 'restartujLozinku']);


// ---------------------------------------------------------------------
// SALE (PROSTORIJE)
// ---------------------------------------------------------------------

// Javno: lista i detalj (katalog i mapa moraju da rade i bez admina)
Route::apiResource('sale', SalaController::class)->only(['index', 'show']);

// Administracija sala (create/update/delete + upload fajla) — admin/menadžer
Route::middleware(['auth:sanctum', 'role:administrator,menadzer'])->group(function () {
    Route::apiResource('sale', SalaController::class)->only(['store', 'update', 'destroy']);
    Route::post('/sale/upload/{id}', [SalaController::class, 'uploadFile']);
});

// (Opcionalno) serverska pretraga sa dostupnošću u terminu
Route::get('/sale/search', [SalaController::class, 'search']);


// ---------------------------------------------------------------------
// REZERVACIJE
// ---------------------------------------------------------------------

// Čitanje liste bez autentikacije NE preporučujem (zbog privatnosti).
// Ako ti treba javno, pomeri rutu ispod iz auth grupe.
// Paginacija je korisna u administraciji, držimo je u auth grupi.
Route::middleware(['auth:sanctum', 'role:administrator,menadzer,korisnik'])->group(function () {
    
    Route::get('/rezervacije/paginacija', [RezervacijaController::class, 'paginatedAndFiltered']);
    Route::get('/rezervacije/export/csv', [RezervacijaController::class, 'exportToCsv']);
    // CRUD + eksport
    Route::get('/rezervacije', [RezervacijaController::class, 'index']);
    Route::get('/rezervacije/{id}', [RezervacijaController::class, 'show']);
    Route::post('/rezervacije', [RezervacijaController::class, 'store']);
    Route::put('/rezervacije/{id}', [RezervacijaController::class, 'update']);
    Route::delete('/rezervacije/{id}', [RezervacijaController::class, 'destroy']);

});


// ---------------------------------------------------------------------
// PREPORUKE
// ---------------------------------------------------------------------

// CRUD nad preporukama (ako čuvaš preporuke u bazi)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/preporuke', [PreporukaController::class, 'index']);
    Route::get('/preporuke/{id}', [PreporukaController::class, 'show']);
    Route::post('/preporuke', [PreporukaController::class, 'store']);
    Route::put('/preporuke/{id}', [PreporukaController::class, 'update']);
    Route::delete('/preporuke/{id}', [PreporukaController::class, 'destroy']);

    // Serverski "sistem preporuke" – predloži optimalne sale/termine
    Route::post('/preporuke/suggest', [PreporukaController::class, 'suggest']);
});


// ---------------------------------------------------------------------
// DODATNO: konverzija cene sale u valutu (javno, demo)
// ---------------------------------------------------------------------

Route::get('/sala/{id}/konverzija/{valuta}', function ($id, $valuta) {
    $sala = Sala::findOrFail($id);

    if (!$sala->cena) {
        return response()->json(['message' => 'Cena nije postavljena za ovu salu.'], 404);
    }

    $response = Http::get('https://api.exchangerate-api.com/v4/latest/USD');

    if ($response->successful()) {
        $exchangeRates = $response->json()['rates'] ?? [];

        if (!isset($exchangeRates[$valuta])) {
            return response()->json(['message' => 'Valuta nije podržana.'], 400);
        }

        $convertedPrice = $sala->cena * $exchangeRates[$valuta];

        return response()->json([
            'sala'              => $sala->naziv,
            'osnovna_cena'      => $sala->cena . ' USD',
            'konvertovana_cena' => number_format($convertedPrice, 2) . " $valuta",
            'kurs'              => $exchangeRates[$valuta],
        ], 200);
    }

    return response()->json(['message' => 'Greška prilikom dobijanja podataka o kursu.'], 500);
});


// ADMIN: dashboard + korisnici
Route::middleware(['auth:sanctum', 'role:administrator'])->group(function () {
    // KPI i grafikoni
    Route::get('/admin/kpis',                 [AdminDashboardController::class, 'kpis']);
    Route::get('/admin/reservations/daily',   [AdminDashboardController::class, 'reservationsDaily']);
    Route::get('/admin/rooms/top',            [AdminDashboardController::class, 'topRooms']);
    Route::get('/admin/rooms/by-type',        [AdminDashboardController::class, 'roomsByType']);
    Route::get('/admin/hourly',               [AdminDashboardController::class, 'hourly']);
    Route::get('/admin/utilization',          [AdminDashboardController::class, 'utilization']);

    // Upravljanje korisnicima (CRUD)
    Route::apiResource('users', UserController::class);

    Route::patch('/sale/{sala}/layout', [SalaController::class, 'updateLayout']);
        


});