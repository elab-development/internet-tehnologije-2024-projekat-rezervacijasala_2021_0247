<?php

use App\Http\Controllers\KorisnickaSesijaController;
use App\Http\Controllers\PasswordController;
use App\Http\Controllers\PreporukaController;
use App\Http\Controllers\RezervacijaController;
use App\Http\Controllers\SalaController;
use App\Models\Sala;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/rezervacije/paginacija', [RezervacijaController::class, 'paginatedAndFiltered']);


Route::middleware(['auth:sanctum', 'role:korisnik,menadzer'])->group(function () {
    Route::get('/rezervacije/{id}', [RezervacijaController::class, 'show']);
    Route::put('/rezervacije/{id}', [RezervacijaController::class, 'update']);
    Route::delete('/rezervacije/{id}', [RezervacijaController::class, 'destroy']);
    Route::get('/rezervacije', [RezervacijaController::class, 'index']);
    Route::post('/rezervacije', [RezervacijaController::class, 'store']);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/preporuke/{id}', [PreporukaController::class, 'show']);
    Route::put('/preporuke/{id}', [PreporukaController::class, 'update']);
    Route::delete('/preporuke/{id}', [PreporukaController::class, 'destroy']);
    Route::get('/preporuke', [PreporukaController::class, 'index']);
    Route::post('/preporuke', [PreporukaController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'role:administrator,menadzer'])->group(function () {
    Route::resource('sale', SalaController::class);
    Route::post('/sale/upload/{id}', [SalaController::class, 'uploadFile']);
});

Route::post('/registracija', [KorisnickaSesijaController::class, 'register']);
Route::post('/prijava', [KorisnickaSesijaController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/odjava', [KorisnickaSesijaController::class, 'logout']);
});

Route::post('/password/email', [PasswordController::class, 'posaljiLink']);
Route::post('/password/reset', [PasswordController::class, 'restartujLozinku']);

Route::get('/sala/{id}/konverzija/{valuta}', function ($id, $valuta) {
    $sala = Sala::findOrFail($id);

    if (!$sala->cena) {
        return response()->json(['message' => 'Cena nije postavljena za ovu salu.'], 404);
    }

    $response = Http::get('https://api.exchangerate-api.com/v4/latest/USD');

    if ($response->successful()) {
        $exchangeRates = $response->json()['rates'];

        if (!isset($exchangeRates[$valuta])) {
            return response()->json(['message' => 'Valuta nije podržana.'], 400);
        }

        $convertedPrice = $sala->cena * $exchangeRates[$valuta];

        return response()->json([
            'sala' => $sala->naziv,
            'osnovna_cena' => $sala->cena . ' USD',
            'konvertovana_cena' => number_format($convertedPrice, 2) . " $valuta",
            'kurs' => $exchangeRates[$valuta],
        ], 200);
    }

    return response()->json(['message' => 'Greška prilikom dobijanja podataka o kursu.'], 500);
});