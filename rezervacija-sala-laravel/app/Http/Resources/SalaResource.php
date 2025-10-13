<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SalaResource extends JsonResource
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
            'id'         => $this->id,
            'naziv'      => $this->naziv,
            'tip'        => $this->tip,
            'kapacitet'  => $this->kapacitet,
            'opis'       => $this->opis,
            'status'     => $this->status,
            'cena'       => $this->cena,

            // NOVO – za vizuelni raspored
            'floor'     => $this->floor,      // ili 'sprat' ako tako zoveš kolonu
            'layout_x'  => $this->layout_x,
            'layout_y'  => $this->layout_y,
            'layout_w'  => $this->layout_w,
            'layout_h'  => $this->layout_h,

            // meta
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
