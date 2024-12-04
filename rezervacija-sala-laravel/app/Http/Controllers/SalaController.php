<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\SalaResource;
use App\Models\Sala;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SalaController extends Controller
{
    public function index()
    {
        $cacheKey = 'sale_all';
    
        $cacheDuration = 60; 
    
        $sale = cache()->remember($cacheKey, $cacheDuration, function () {
            return Sala::all();
        });
    
        return response()->json($sale, 200);
    }

    public function show($id)
    {
        $sala = Sala::findOrFail($id);
        return response()->json(new SalaResource($sala), 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'naziv' => 'required|string|max:255',
            'tip' => 'required|string|max:255',
            'kapacitet' => 'required|integer|min:1',
            'opis' => 'nullable|string',
            'status' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sala = Sala::create($request->all());

        cache()->forget('sale_all');

        return response()->json(new SalaResource($sala), 201);
    }

    public function update(Request $request, $id)
    {
        cache()->forget('sale_all');

        $sala = Sala::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'naziv' => 'required|string|max:255',
            'tip' => 'required|string|max:255',
            'kapacitet' => 'required|integer|min:1',
            'opis' => 'nullable|string',
            'status' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sala->update($request->all());

        return response()->json(new SalaResource($sala), 200);
    }

    public function destroy($id)
    {
        cache()->forget('sale_all');

        $sala = Sala::findOrFail($id);
        $sala->delete();

        return response()->json(['message' => 'Sala je uspešno obrisana.'], 200);
    }
}