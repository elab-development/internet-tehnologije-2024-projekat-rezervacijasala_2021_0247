<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PreporukaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'sala_id' => $this->sala_id,
            'user_id' => $this->user_id,
            'datum' => $this->datum,
            'vreme_od' => $this->vreme_od,
            'vreme_do' => $this->vreme_do,
            'tip_dogadjaja' => $this->tip_dogadjaja,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
