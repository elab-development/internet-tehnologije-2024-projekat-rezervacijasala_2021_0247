<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\PreporukaResource;
use App\Models\Preporuka;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PreporukaController extends Controller
{
    public function index()
    {
        $preporuke = Preporuka::all();
        return response()->json(PreporukaResource::collection($preporuke), 200);
    }

    public function show($id)
    {
        $preporuka = Preporuka::findOrFail($id);
        return response()->json(new PreporukaResource($preporuka), 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sala_id' => 'required|exists:salas,id',
            'datum' => 'required|date',
            'vreme_od' => 'required|date_format:H:i',
            'vreme_do' => 'required|date_format:H:i|after:vreme_od',
            'tip_dogadjaja' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        $data['user_id'] = auth()->id(); // Koristi ID ulogovanog korisnika

        $preporuka = Preporuka::create($data);

        return response()->json(new PreporukaResource($preporuka), 201);
    }

    public function update(Request $request, $id)
    {
        $preporuka = Preporuka::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'sala_id' => 'required|exists:salas,id',
            'datum' => 'required|date',
            'vreme_od' => 'required|date_format:H:i',
            'vreme_do' => 'required|date_format:H:i|after:vreme_od',
            'tip_dogadjaja' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $preporuka->update($request->all());

        return response()->json(new PreporukaResource($preporuka), 200);
    }

    public function destroy($id)
    {
        $preporuka = Preporuka::findOrFail($id);
        $preporuka->delete();

        return response()->json(['message' => 'Preporuka je uspešno obrisana.'], 200);
    }
}
