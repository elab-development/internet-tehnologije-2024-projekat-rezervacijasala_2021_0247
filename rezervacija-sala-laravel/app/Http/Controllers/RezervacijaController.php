<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\RezervacijaResource;
use App\Models\Rezervacija;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RezervacijaController extends Controller
{
    public function index()
    {
        $rezervacije = Rezervacija::all();
        return response()->json(RezervacijaResource::collection($rezervacije), 200);
    }

    public function show($id)
    {
        $rezervacija = Rezervacija::findOrFail($id);
        return response()->json(new RezervacijaResource($rezervacija), 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sala_id' => 'required|exists:salas,id',
            'datum' => 'required|date',
            'vreme_od' => 'required|date_format:H:i',
            'vreme_do' => 'required|date_format:H:i|after:vreme_od',
            'tip_dogadjaja' => 'required|string|max:255',
            'status' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        $data['user_id'] = auth()->id(); // Koristi ID ulogovanog korisnika

        $rezervacija = Rezervacija::create($data);

        return response()->json(new RezervacijaResource($rezervacija), 201);
    }

    public function update(Request $request, $id)
    {
        $rezervacija = Rezervacija::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'sala_id' => 'required|exists:salas,id',
            'datum' => 'required|date',
            'vreme_od' => 'required|date_format:H:i',
            'vreme_do' => 'required|date_format:H:i|after:vreme_od',
            'tip_dogadjaja' => 'required|string|max:255',
            'status' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rezervacija->update($request->all());

        return response()->json(new RezervacijaResource($rezervacija), 200);
    }

    public function destroy($id)
    {
        $rezervacija = Rezervacija::findOrFail($id);
        $rezervacija->delete();

        return response()->json(['message' => 'Rezervacija je uspešno obrisana.'], 200);
    }
}
