<?php

namespace App\Http\Controllers;

use App\Models\Rezervacija;
use App\Models\Sala;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    // Osnovni KPI-ji (keš 60s)
    public function kpis()
    {
        $data = Cache::remember('admin.kpis', 60, function () {
            return [
                'users_total'        => User::count(),
                'rooms_total'        => Sala::count(),
                'rooms_active'       => Sala::where('status', true)->count(),
                'reservations_total' => Rezervacija::count(),
                'reservations_today' => Rezervacija::whereDate('datum', today())->count(),
            ];
        });

        return response()->json($data, 200);
    }

    // Linijski graf: broj rezervacija po danu (poslednjih N dana)
    public function reservationsDaily(Request $request)
    {
        $days = (int) $request->get('days', 30);
        $from = now()->subDays($days - 1)->startOfDay();

        $rows = Rezervacija::select([
                DB::raw('DATE(datum) as day'),
                DB::raw('COUNT(*) as cnt'),
            ])
            ->whereDate('datum', '>=', $from)
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        // popuni sve dane
        $series = [];
        for ($i = 0; $i < $days; $i++) {
            $d = $from->copy()->addDays($i)->toDateString();
            $series[$d] = 0;
        }
        foreach ($rows as $r) $series[$r->day] = (int) $r->cnt;

        return response()->json([
            'labels' => array_keys($series),
            'data'   => array_values($series),
        ], 200);
    }

    // Bar chart: top sale po broju rezervacija
    public function topRooms(Request $request)
    {
        $limit = (int) $request->get('limit', 10);

        $rows = Rezervacija::select('sala_id', DB::raw('COUNT(*) as cnt'))
            ->groupBy('sala_id')
            ->orderByDesc('cnt')
            ->limit($limit)
            ->get();

        $names = Sala::whereIn('id', $rows->pluck('sala_id'))
            ->pluck('naziv', 'id');

        return response()->json([
            'labels' => $rows->map(fn($r) => $names[$r->sala_id] ?? ('Sala #'.$r->sala_id)),
            'data'   => $rows->pluck('cnt')->map(fn($x) => (int) $x),
        ], 200);
    }

    // Pie/donut: raspodela sala po tipu
    public function roomsByType()
    {
        $rows = Sala::select('tip', DB::raw('COUNT(*) as cnt'))
            ->groupBy('tip')
            ->orderByDesc('cnt')
            ->get();

        return response()->json([
            'labels' => $rows->pluck('tip'),
            'data'   => $rows->pluck('cnt')->map(fn($x) => (int) $x),
        ], 200);
    }

    // Heatmap/kolona: broj rezervacija po satu (početni sat), poslednjih N dana
    public function hourly(Request $request)
    {
        $days = (int) $request->get('days', 14);
        $from = now()->subDays($days - 1)->startOfDay();

        $rows = Rezervacija::select([
                DB::raw("DATE_FORMAT(vreme_od, '%H') as hour"),
                DB::raw('COUNT(*) as cnt'),
            ])
            ->whereDate('datum', '>=', $from)
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        $series = array_fill(0, 24, 0);
        foreach ($rows as $r) {
            $h = (int) $r->hour;
            if ($h >= 0 && $h <= 23) $series[$h] = (int) $r->cnt;
        }

        return response()->json([
            'labels' => range(0, 23),
            'data'   => $series,
        ], 200);
    }

    // Utilization: koliko aktivnih sala je imalo makar jednu rezervaciju u 30 dana
    public function utilization()
    {
        $active = Sala::where('status', true)->count();
        $busy   = Rezervacija::whereDate('datum', '>=', now()->subDays(30))
                    ->distinct('sala_id')->count('sala_id');

        return response()->json([
            'active_rooms' => $active,
            'busy_rooms'   => $busy,
            'ratio'        => $active > 0 ? round($busy / $active, 3) : 0,
        ], 200);
    }
}
