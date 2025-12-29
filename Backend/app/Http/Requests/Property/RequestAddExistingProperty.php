<?php

namespace App\Http\Requests\Property;

use App\Models\Property\PropertyDetail;
use Illuminate\Foundation\Http\FormRequest;

class RequestAddExistingProperty extends RequestAddSaf
{
    protected $_PropertyDetail;    
    function __construct(){
        parent::__construct();
        $this->_PropertyDetail = new PropertyDetail();

    }
    public function rules(): array
    {
        $rules = parent::rules();
        $rules["assessmentType"]="nullable";
        $rules["previousHoldingId"]="nullable";
        $rules["demandPaidUpto"]="nullable|date";
        $rules["holdingNo"] = "required|unique:".$this->_PropertyDetail->getConnectionName().".".$this->_PropertyDetail->getTable().",holding_no";
        return $rules;
    }
}
