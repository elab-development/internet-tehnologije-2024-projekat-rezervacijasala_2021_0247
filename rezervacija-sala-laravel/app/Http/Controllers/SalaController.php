<?php

namespace App\Http\Controllers;

use App\Http\Resources\SalaResource;
use App\Models\Sala;
use Illuminate\Http\Request;

class SalaController extends Controller
{
    public function index()
    {
        $sale = cache()->remember('sale_all', 60, fn () => Sala::query()->get());
        return response()->json(SalaResource::collection($sale), 200);
    }

    public function show($id)
    {
        $sala = Sala::findOrFail($id);
        return response()->json(new SalaResource($sala), 200);
    }

    public function store(Request $request)
    {
        // VALIDACIJA
        $validated = $request->validate([
            'naziv'      => 'required|string|max:255',
            'tip'        => 'required|string|max:255',
            'kapacitet'  => 'required|integer|min:1',
            'opis'       => 'nullable|string',
            'status'     => 'required|boolean',

            // NOVO – obavezni sprat i koordinate/veličina
            'floor'      => 'required|integer|min:0',
            'layout_x'   => 'required|integer|min:0',
            'layout_y'   => 'required|integer|min:0',
            'layout_w'   => 'required|integer|min:1',
            'layout_h'   => 'required|integer|min:1',

            // opciono
            'cena'       => 'nullable|numeric|min:0',
            'file_path'  => 'nullable|string|max:1024',
        ]);

        // SANITIZACIJA (in-place, bez helpera)
        $validated['kapacitet'] = (int) max(1, (int) $validated['kapacitet']);
        $validated['floor']     = (int) max(0, (int) $validated['floor']);
        $validated['layout_x']  = (int) max(0, (int) $validated['layout_x']);
        $validated['layout_y']  = (int) max(0, (int) $validated['layout_y']);
        $validated['layout_w']  = (int) max(1, (int) $validated['layout_w']);
        $validated['layout_h']  = (int) max(1, (int) $validated['layout_h']);
        if (array_key_exists('cena', $validated)) {
            $validated['cena'] = (float) $validated['cena'];
        }

        $sala = Sala::create($validated);

        cache()->forget('sale_all');

        return response()->json(new SalaResource($sala), 201);
    }

    public function update(Request $request, $id)
    {
        $sala = Sala::findOrFail($id);

        // VALIDACIJA (ista pravila kao za store)
        $validated = $request->validate([
            'naziv'      => 'required|string|max:255',
            'tip'        => 'required|string|max:255',
            'kapacitet'  => 'required|integer|min:1',
            'opis'       => 'nullable|string',
            'status'     => 'required|boolean',

            'floor'      => 'required|integer|min:0',
            'layout_x'   => 'required|integer|min:0',
            'layout_y'   => 'required|integer|min:0',
            'layout_w'   => 'required|integer|min:1',
            'layout_h'   => 'required|integer|min:1',

            'cena'       => 'nullable|numeric|min:0',
            'file_path'  => 'nullable|string|max:1024',
        ]);

        // SANITIZACIJA
        $validated['kapacitet'] = (int) max(1, (int) $validated['kapacitet']);
        $validated['floor']     = (int) max(0, (int) $validated['floor']);
        $validated['layout_x']  = (int) max(0, (int) $validated['layout_x']);
        $validated['layout_y']  = (int) max(0, (int) $validated['layout_y']);
        $validated['layout_w']  = (int) max(1, (int) $validated['layout_w']);
        $validated['layout_h']  = (int) max(1, (int) $validated['layout_h']);
        if (array_key_exists('cena', $validated)) {
            $validated['cena'] = (float) $validated['cena'];
        }

        $sala->update($validated);

        cache()->forget('sale_all');

        return response()->json(new SalaResource($sala), 200);
    }

    public function destroy($id)
    {
        $sala = Sala::findOrFail($id);
        $sala->delete();

        cache()->forget('sale_all');

        return response()->json(['message' => 'Sala je uspešno obrisana.'], 200);
    }

    public function uploadFile(Request $request, $id)
    {
        $sala = Sala::findOrFail($id);

        $request->validate([
            'file' => 'required|file|mimes:jpg,png,pdf,doc,docx,zip|max:5120',
        ]);

        $path = $request->file('file')->store('sala_files', 'public');
        $sala->update(['file_path' => $path]);

        cache()->forget('sale_all');

        return response()->json([
            'message'   => 'Fajl je uspešno otpremljen i povezan sa salom!',
            'file_path' => asset('storage/' . $path),
            'sala'      => new SalaResource($sala->fresh()),
        ], 200);
    }
}
