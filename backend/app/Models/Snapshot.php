<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Override;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Snapshot extends Model implements HasMedia
{
    use HasFactory, HasUuids, InteractsWithMedia;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['client_id', 'date_capture', 'new_attr'];

    protected function casts(): array
    {
        return ['date_capture' => 'datetime'];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(
            Client::class,
            'client_id'
        );
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('snapshot')->useDisk('public')->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    #[Override]
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')->width(400)->height(400)->sharpen(10)->performOnCollections('snapshot');

        $this->addMediaConversion('preview')->width(1080)->height(1080)->quality(85)->performOnCollections('snapshot');
    }
}
