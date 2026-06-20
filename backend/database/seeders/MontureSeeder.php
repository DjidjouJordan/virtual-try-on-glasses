<?php

namespace Database\Seeders;

use App\Models\Modele3D;
use App\Models\Monture;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MontureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $monturesData = [
            [
                'nom' => 'Wayfarer Classic',
                'marque' => 'Ray-Ban Style',
                'prix' => 15000.99,
                'description' => 'Monture iconique intemporelle.',
                'categorie' => '',
                'couleur' => 'bleue',
                'is_active' => true,
                'image' => 'wayfarer_sunglasses_-_eyeglasses_rims.png',
                'modele3d' => 'wayfarer_sunglasses_-_eyeglasses_rims.glb',
                'scale_offset' => '1.0'
            ],
            [
                'nom' => 'Star Sunglasses',
                'marque' => '',
                'prix' => 17889.99,
                'description' => 'Red star-shaped sunglasses.',
                'categorie' => 'Lunettes de soleil',
                'couleur' => 'rouge',
                'is_active' => false,
                'image' => 'star_sunglasses.png',
                'modele3d' => 'star_sunglasses.glb',
                'scale_offset' => '1.0'
            ],
            [
                'nom' => 'Chrome Bat sunglasses',
                'marque' => '',
                'prix' => 12009.99,
                'description' => 'Lunettes de soleil au design audacieux inspiré d\'une chauve-souris avec une  finition chromée',
                'categorie' => 'Lunettes de soleil',
                'couleur' => 'Chrome',
                'is_active' => false,
                'image' => 'chrome_bat_sunglasses.png',
                'modele3d' => 'chrome_bat_sunglasses.glb',
                'scale_offset' => '1.0'
            ],
            [
                'nom' => 'Mizu\'s Glasses Blue Eye Samurai',
                'marque' => '',
                'prix' => 129.99,
                'description' => 'Réplication 3D des lunettes de Mizu (Blue Eye Samurai) par Xavlig1992.',
                'categorie' => 'Lunettes de soleil',
                'couleur' => 'Ambre',
                'is_active' => true,
                'image' => 'mizus_glasses_blue_eye_samurai.png',
                'modele3d' => 'mizus_glasses_blue_eye_samurai.glb',
                'scale_offset' => '1.0'
            ],
            [
                'nom' => 'Heart- Glasses',
                'marque' => '',
                'prix' => 12900.99,
                'description' => 'Heart-shaped glasses by jhowars65',
                'categorie' => 'Lunettes de soleil',
                'couleur' => 'blanche',
                'is_active' => false,
                'image' => 'heart-_glasses.png',
                'modele3d' => 'heart-_glasses.glb',
                'scale_offset' => '1.0'
            ],
            [
                'nom' => 'Glasses',
                'marque' => '',
                'prix' => 129.99,
                'description' => 'Modèle 3D classique de lunettes par Anthony Yanez. Aperçu disponible dans Glasses.png.',
                'categorie' => 'Lunettes',
                'couleur' => 'Noir / Gris',
                'is_active' => true,
                'image' => 'glasses.png',
                'modele3d' => 'glasses.glb',
                'scale_offset' => '1.0'
            ],
            [
                'nom' => 'Stylish Modern High Quality Sunglasses',
                'marque' => '',
                'prix' => 12239.99,
                'description' => 'Lunettes de soleil élégantes et modernes de haute qualité. Modèle 3D créé par noob-3d.',
                'categorie' => 'Lunettes de soleil',
                'couleur' => '',
                'is_active' => false,
                'image' => 'stylish_modern_high_quality_sunglasses.png',
                'modele3d' => 'stylish_modern_high_quality_sunglasses.glb',
                'scale_offset' => '1.0'
            ],
            [
                'nom' => 'Eyeglasses',
                'marque' => 'ethan_garden',
                'prix' => 12129.99,
                'description' => 'Lunettes de vue classiques',
                'categorie' => 'Lunettes de vue',
                'couleur' => 'Noir / Métal',
                'is_active' => true,
                'image' => 'eyeglasses.png',
                'modele3d' => 'eyeglasses.glb',
                'scale_offset' => '1.0'
            ],
            [
                'nom' => 'Eyeglasses (Specs)',
                'marque' => '',
                'prix' => 19829.99,
                'description' => 'Modèle 3D détaillé de lunettes de vue (Specs) créé par Pratham.Bhatnagar.',
                'categorie' => 'Lunettes de vue',
                'couleur' => 'arc-en-ciel',
                'is_active' => true,
                'image' => 'eyeglasses_specs.png',
                'modele3d' => 'eyeglasses_specs.glb',
                'scale_offset' => '1.0'
            ]
        ];

        foreach($monturesData as $data){
            $montures = Monture::where('nom', $data['nom'])->get();

            if ($montures->isEmpty()) {
                $modele = Modele3D::create([
                    'id' => Str::uuid(),
                    'scale_offset' => $data['scale_offset']
                ]);
                $newMonture = Monture::create([
                    'id' => Str::uuid(),
                    'nom' => $data['nom'],
                    'marque' => $data['marque'],
                    'prix' => $data['prix'],
                    'description' => $data['description'],
                    'categorie' => $data['categorie'],
                    'couleur' => $data['couleur'],
                    'is_active' => $data['is_active'],
                    'modele3d_id' => $modele->id,
                ]);
                $montures = collect([$newMonture]);
            }

            // Restaure les fichiers physiques pour TOUTES les copies (doublons inclus)
            foreach ($montures as $monture) {
                $modele = $monture->modele3d;
                if (!$modele) continue;

                $glbMedia = $modele->getFirstMedia('fichier3d');
                $pathGlb = database_path('seeders/files/modeles3d/' . $data['modele3d']);
                if ($glbMedia && !file_exists($glbMedia->getPath()) && file_exists($pathGlb)) {
                    // Copie directe sans changer l'ID (préserve l'URL)
                    $dir = dirname($glbMedia->getPath());
                    if (!is_dir($dir)) mkdir($dir, 0755, true);
                    copy($pathGlb, $glbMedia->getPath());
                } elseif (!$glbMedia && file_exists($pathGlb)) {
                    $modele->addMedia($pathGlb)->preservingOriginal()->toMediaCollection('fichier3d');
                }

                $imgMedia = $monture->getFirstMedia('image');
                $pathImg = database_path('seeders/files/montures/' . $data['image']);
                $this->command->info("[DEBUG] " . $data['image'] . " | media=" . ($imgMedia ? $imgMedia->id : 'NULL') . " | src=" . (file_exists($pathImg) ? 'OK' : 'MISSING'));
                if ($imgMedia) {
                    $this->command->info("[DEBUG] dest=" . $imgMedia->getPath() . " | exists=" . (file_exists($imgMedia->getPath()) ? 'YES' : 'NO'));
                }
                if ($imgMedia && !file_exists($imgMedia->getPath()) && file_exists($pathImg)) {
                    $dir = dirname($imgMedia->getPath());
                    if (!is_dir($dir)) mkdir($dir, 0755, true);
                    $copied = copy($pathImg, $imgMedia->getPath());
                    $this->command->info("Image " . ($copied ? "restaurée" : "ERREUR COPY") . " : " . $data['image'] . " -> " . $imgMedia->getPath());
                } elseif (!$imgMedia && file_exists($pathImg)) {
                    $monture->addMedia($pathImg)->preservingOriginal()->toMediaCollection('image');
                    $this->command->info("Image créée : " . $data['image']);
                }
            }
        }

        $this->command->info('Seeding terminé.');
    }
}