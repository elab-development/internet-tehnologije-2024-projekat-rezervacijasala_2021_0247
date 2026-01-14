<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
        $frontend = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'));

        
        return $frontend.'/lozinka/reset?token='.$token.'&email='.urlencode($notifiable->email);
    });
    }
}
