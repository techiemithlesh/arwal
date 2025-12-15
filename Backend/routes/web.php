<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/logo/{path}', function ($path) {
    $fullPath = public_path($path);

    if (!file_exists($fullPath) || is_dir($fullPath)) {
        abort(404);
    }

    $mimeType = mime_content_type($fullPath);
    $response = Response::file($fullPath, ['Content-Type' => $mimeType]);

    return $response;
})->where('path', '.*\.(jpg|jpeg|png|gif|svg|pdf|css|js|woff2?|ttf|ico)$');