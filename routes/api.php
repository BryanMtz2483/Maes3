<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

//API de logueo para obtener un token tipo BEARER y así poder usar el resto de APIS
Route::post('/login',[AuthController::class, 'login']);

Route::group(['prefix' => 'v1','middleware' => 'auth:sanctum'], function (){//para poder utilizar algunas de estas rutas se necesita el token de autenticación.
    
});