<?php
namespace App\Bll\Property;

use App\Models\DBSystem\UlbMaster;
use App\Models\DBSystem\UlbWardMaster;
use App\Models\Property\ActiveSafDetail;
use App\Models\Property\ChequeDetail;
use App\Models\Property\PropertyCollection;
use App\Models\Property\PropertyDetail;
use App\Models\Property\PropTransaction;
use App\Models\Property\RejectedSafDetail;
use App\Models\Property\SafCollection;
use App\Models\Property\SafDetail;
use App\Models\Property\TransactionFineRebateDetail;
use App\Models\User;

class PaymentReceiptBll{

    public $_GRID;
    public $_TranId;
    public $_TranDetail;
    public $_ChequeDtl;
    public $_CollectionDetail;
    public $_FineRebates;
    public $_UserDetail;
    public $_UlbDetail;
    public $_oldWard;
    public $_newWard;
    public $_propSafData;
    public $_owners;
    public $_tblRow;

    function __construct($tranId)
    {
        $this->_TranId = $tranId;

    }

    public function loadParam(){
        $this->_TranDetail = PropTransaction::find($this->_TranId);
        $this->_ChequeDtl = ChequeDetail::where("transaction_id",$this->_TranId)
                            ->where("lock_status",false)
                            ->orderBy("id","DESC")
                            ->first();
        $this->_FineRebates = TransactionFineRebateDetail::where("lock_status",false)->where("transaction_id",$this->_TranId)->get();
        if($this->_TranDetail->saf_detail_id){
            $this->_CollectionDetail = SafCollection::where("lock_status",false)->where("transaction_id",$this->_TranId)->get();
            $this->_propSafData = ActiveSafDetail::find($this->_TranDetail->saf_detail_id);
            if(!$this->_propSafData){
                $this->_propSafData = SafDetail::find($this->_TranDetail->saf_detail_id);
            }
            if(!$this->_propSafData){
                $this->_propSafData = RejectedSafDetail::find($this->_TranDetail->saf_detail_id);
            }
        }
        else{
            $this->_CollectionDetail = PropertyCollection::where("lock_status",false)->where("transaction_id",$this->_TranId)->get();
            $this->_propSafData = PropertyDetail::find($this->_TranDetail->property_detail_id);            
        }

        if($this->_TranDetail->user_type!="ONLINE"){
            $this->_UserDetail = User::find($this->_TranDetail->user_id);
        }
        if($this->_UserDetail){
            $this->_UserDetail->signature_img = $this->_UserDetail->signature_img ? url('/'.$this->_UserDetail->signature_img) : "";
        }
        $this->_UlbDetail = UlbMaster::find($this->_TranDetail->ulb_id);
        if($this->_UlbDetail){
            $this->_UlbDetail->logo_img = $this->_UlbDetail->logo_img ? url('/'.$this->_UlbDetail->logo_img) : "";
        }
        $this->_oldWard = UlbWardMaster::find($this->_propSafData->ward_mstr_id);
        $this->_newWard = UlbWardMaster::find($this->_propSafData->new_ward_mstr_id);
        $this->_owners = collect($this->_propSafData->getOwners())->sortBy("id");
    }

    public function generateReceipt(){
        $this->loadParam();
        $this->_GRID=[
            "description"=>"HOLDING TAX RECEIPT",
            "tranNo"=>$this->_TranDetail->tran_no,
            "tranDate"=>$this->_TranDetail->tran_date,
            "department" => "Revenue Section",
            "wardNo" =>$this->_oldWard->ward_no??"N/A",
            "newWardNo" =>$this->_newWard->ward_no??"N/A",
            "accountDescription" => "Holding Tax & Others",
            "holdingNo" => $this->_propSafData->holding_no??"",
            "newHoldingNo" => $this->_propSafData->new_holding_no??"",
            "saf_no" => $this->_propSafData->saf_no??"",
            "address" => $this->_propSafData->prop_address??"",
            "ownerName" =>$this->_owners->implode("owner_name",", "),
            "amount" => $this->_TranDetail->payable_amt,
            "amountInWords" => getIndianCurrency($this->_TranDetail->payable_amt),
            "paymentMode" => $this->_TranDetail->payment_mode,
            "paymentStatus" => $this->_TranDetail->payment_status==1 ? "Clear":"Pending",
            "chequeNo" => $this->_ChequeDtl->cheque_no??"",
            "chequeDate" => $this->_ChequeDtl->cheque_date??"",
            "bankName" => $this->_ChequeDtl->bank_name??"",
            "branchName" =>$this->_ChequeDtl->branch_name??"",
            "fromFyear"=>$this->_TranDetail->from_fyear,
            "uptoFyear"=>$this->_TranDetail->upto_fyear,
            "fromQtr"=>$this->_TranDetail->from_qtr,
            "uptoQtr"=>$this->_TranDetail->upto_qtr,

            "holdingTax" =>roundFigure(collect($this->_CollectionDetail)->sum("holding_tax")??0),
            "waterTax" =>roundFigure(collect($this->_CollectionDetail)->sum("water_tax")??0),
            "latrineTax" =>roundFigure(collect($this->_CollectionDetail)->sum("latrine_tax")??0),
            "healthCessTax" =>roundFigure(collect($this->_CollectionDetail)->sum("health_cess_tax")??0),
            "educationCessTax" =>roundFigure(collect($this->_CollectionDetail)->sum("education_cess_tax")??0),            
            "rwhTax" =>roundFigure(collect($this->_CollectionDetail)->sum("rwh_tax")??0),
            
            "propertyDtl"=>$this->_propSafData,
            "tranDtl" => $this->_TranDetail,
            "chequeDtl" => $this->_ChequeDtl,
            "ulbDtl" => $this->_UlbDetail,
            "ownerDtl" => $this->_owners,
            "fineRebate" => $this->_FineRebates,
            "userDtl"=> $this->_UserDetail,
        ];
    }
}