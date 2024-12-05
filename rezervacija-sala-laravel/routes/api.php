<?php

use App\Http\Controllers\KorisnickaSesijaController;
use App\Http\Controllers\PasswordController;
use App\Http\Controllers\PreporukaController;
use App\Http\Controllers\RezervacijaController;
use App\Http\Controllers\SalaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
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

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/rezervacije', [RezervacijaController::class, 'index']);
    Route::get('/rezervacije/{id}', [RezervacijaController::class, 'show']);
    Route::post('/rezervacije', [RezervacijaController::class, 'store']);
    Route::put('/rezervacije/{id}', [RezervacijaController::class, 'update']);
    Route::delete('/rezervacije/{id}', [RezervacijaController::class, 'destroy']);
});

Route::get('/rezervacije/paginacija', [RezervacijaController::class, 'paginatedAndFiltered']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/preporuke', [PreporukaController::class, 'index']);
    Route::get('/preporuke/{id}', [PreporukaController::class, 'show']);
    Route::post('/preporuke', [PreporukaController::class, 'store']);
    Route::put('/preporuke/{id}', [PreporukaController::class, 'update']);
    Route::delete('/preporuke/{id}', [PreporukaController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::resource('sale', SalaController::class);
});

Route::post('/registracija', [KorisnickaSesijaController::class, 'register']);
Route::post('/prijava', [KorisnickaSesijaController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/odjava', [KorisnickaSesijaController::class, 'logout']);
});

Route::post('/password/email', [PasswordController::class, 'posaljiLink']);
Route::post('/password/reset', [PasswordController::class, 'restartujLozinku']);