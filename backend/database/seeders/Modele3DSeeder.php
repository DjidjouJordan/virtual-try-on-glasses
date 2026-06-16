<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Modele3DSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $montures = [
            [
                'id' => Str::uuid(),
                'url_fichier' => 'storage/modele3ds/chrome_bat_sunglasses.glb',
                'scale_offset' => 1.0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'id' => Str::uuid(),
                'url_fichier' => 'storage/modele3ds/chrome_bat_sunglasses.glb',
                'scale_offset' => 1.0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'id' => Str::uuid(),
                'url_fichier' => 'storage/modele3ds/eyeglasses.glb',
                'scale_offset' => 1.0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'id' => Str::uuid(),
                'url_fichier' => 'storage/modele3ds/eyeglasses_specs.glb',
                'scale_offset' => 1.0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'id' => Str::uuid(),
                'url_fichier' => 'storage/modele3ds/glasses.glb',
                'scale_offset' => 1.0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'id' => Str::uuid(),
                'url_fichier' => 'storage/modele3ds/heart-_glasses.glb',
                'scale_offset' => 1.0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'id' => Str::uuid(),
                'url_fichier' => 'storage/modele3ds/mizus_glasses_blue_eye_samurai.glb',
                'scale_offset' => 1.0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'id' => Str::uuid(),
                'url_fichier' => 'storage/modele3ds/star_sunglasses.glb',
                'scale_offset' => 1.0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'id' => Str::uuid(),
                'url_fichier' => 'storage/modele3ds/stylish_modern_high_quality_sunglasses.glb',
                'scale_offset' => 1.0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'id' => Str::uuid(),
                'url_fichier' => 'storage/modele3ds/wayfarer_sunglasses_-_eyeglasses_rims.glb',
                'scale_offset' => 1.0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'id' => Str::uuid(),
                'url_fichier' => 'storage/modele3ds/wayfarer_sunglasses_eyeglasses_rims.glb',
                'scale_offset' => 1.0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]
        ];
    }
}
