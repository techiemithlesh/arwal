<?php

namespace App\Models\Property;

use App\Models\DBSystem\UlbWardMaster;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyDetail extends ParamModel
{
    use HasFactory;

    public function getOwners(){
        return $this->hasMany(PropertyOwnerDetail::class,"property_detail_id","id")->where("lock_status",false)->get();
    }
    public function getFloors(){
        return $this->hasMany(PropertyFloorDetail::class,"property_detail_id","id")->where("lock_status",false)->get();
    }


    public function getWardOldWardNo(){
        return $this->belongsTo(UlbWardMaster::class,"ward_mstr_id","id")->first();
    }
    public function getWardNewdWardNo(){
        return $this->belongsTo(UlbWardMaster::class,"new_ward_mstr_id","id")->first();
    }

    public function getTrans(){
        return $this->hasMany(PropTransaction::class,"property_detail_id","id")
            ->where("lock_status",false)
            ->whereIn("payment_status",[1,2])
            ->orderBy("tran_date","ASC")
            ->orderBy("id","ASC")
            ->get();
    }

    public function getLastTran(){
        return $this->hasMany(PropTransaction::class,"property_detail_id","id")
            ->where("lock_status",false)
            ->whereIn("payment_status",[1,2])
            ->orderBy("tran_date","DESC")
            ->orderBy("id","DESC")
            ->first();
    }

    public function getAllTaxDetail(){
        return $this->hasMany(PropertyTax::class,"property_detail_id","id")->where("lock_status",false);
    }

    public function getAllDemand(){
        return $this->hasMany(PropertyDemand::class,"property_detail_id","id")->where("lock_status",false);
    }
}
