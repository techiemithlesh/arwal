<?php

namespace App\Bll\Property;

use App\Models\Property\ActiveSafDetail;
use App\Models\Property\AdvanceDetail;
use App\Models\Property\PenaltyDetail;
use App\Models\Property\PropertyDemand;
use App\Models\Property\PropertyDetail;
use App\Models\Property\PropertyNotice;
use App\Models\Property\PropertyTypeMaster;
use App\Models\Property\SafDemand;
use App\Models\Property\SafDetail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PropDemandBll{
    public $_GRID;
    public $_PROPId;
    public $_PROPERTY;
    public $_tranDate;
    public $_tranDateFyear ;
    public $_isVacantLand = false ;
    public $_demandAmount = 0;
    public $_rwhAmount = 0;
    public $_currentDemandAmount = 0 ;
    public $_arrearDemandAmount = 0;
    public $_currentDemandMonthlyPenalty = 0 ;
    public $_arrearDemandMonthlyPenalty = 0;
    public $_DemandList;
    public $_previousDemandList;
    public $_currentDemandList;
    public $_otherPenaltyList;
    public $_monthlyPenalty = 0;
    public $_demandFromFyear;
    public $_demandFromQtr;
    public $_demandUptoFyear;
    public $_demandUptoQtr;
    public $_lateAssessmentPenalty = 0 ;
    public $_notice;
    public $_noticePenalty = 0;
    public $_noticeAdditionPenalty =0;
    public $_otherPenalty = 0;
    public $_onlineRebate = 0;
    public $_jskRebate = 0;
    public $_firstQtrRebate = 0;
    public $_quarterlyRebate = 0;
    public $_specialRebate = 0;

    public $_advanceAmount = 0 ;

    public $_lastPaymentIsClear = true;

    function __construct($propId,$tranDate=null)
    {
        $this->_PROPId = $propId;
        $this->_tranDate = Carbon::parse($tranDate);
        $this->_tranDateFyear = getFY($this->_tranDate->copy()->format("Y-m-d"));
        $this->_PROPERTY = PropertyDetail::find($this->_PROPId);     
        $this->setDemandList();
        $this->testLastTran();
    }

    public function testLastTran(){
        $last = $this->_PROPERTY->getLastTran();
        if($last && $last->payment_status==2){
            $this->_lastPaymentIsClear = false;
        }
    }
    public function setDemandList(){        
        $currentFyear = getFY($this->_tranDate->copy()->format("Y-m-d"));
        $propDemand = new PropertyDemand();
        $this->_DemandList = collect($propDemand->getDueDemand($this->_PROPId))->where("fyear","<=",$this->_tranDateFyear);
        $this->_DemandList = $this->_DemandList->map(function($item){                                
                                $item = $this->getOnePercentPenalty($item);
                                return $item;
                            });
        $this->_monthlyPenalty = roundFigure($this->_DemandList->sum("monthlyPenalty"));
        $this->_demandAmount = roundFigure($this->_DemandList->sum("balance_tax"));
        $this->_rwhAmount = roundFigure($this->_DemandList->sum("due_rwh_tax"));

        $this->_currentDemandList = $currentDemand = $this->_DemandList->where("fyear",$this->_tranDateFyear);
        $currentDemandAmt = $currentDemand->sum("balance_tax");
        $currentDemandMonthlyPenalty = $currentDemand->sum("monthlyPenalty");

        $this->_previousDemandList = $previousDemand = $this->_DemandList->where("fyear","<",$this->_tranDateFyear);
        $previousDemandAmt = $previousDemand->sum("balance_tax");
        $previousDemandMonthlyPenalty = $previousDemand->sum("monthlyPenalty");

        $this->_currentDemandAmount = roundFigure($currentDemandAmt);
        $this->_arrearDemandAmount = roundFigure($previousDemandAmt);

        $this->_currentDemandMonthlyPenalty = roundFigure($currentDemandMonthlyPenalty);
        $this->_arrearDemandMonthlyPenalty = roundFigure($previousDemandMonthlyPenalty);
                
        $this->_demandFromFyear = $this->_DemandList->min("fyear");
        $this->_demandFromQtr = $this->_DemandList->where("fyear",$this->_demandFromFyear)->min("qtr");
        $this->_demandUptoFyear = $this->_DemandList->max("fyear");
        $this->_demandUptoQtr = $this->_DemandList->where("fyear",$this->_demandUptoFyear)->max("qtr");
    }

    public function getOtherPenalty(){
        $this->_otherPenaltyList = PenaltyDetail::where("lock_status",false)->where("paid_status",false)->where("property_detail_id",$this->_PROPId)->get();
        $this->_otherPenalty = roundFigure($this->_otherPenaltyList->sum("penalty_amt"));
    }

    public function noticePenalty(){
        $this->_notice = PropertyNotice::where("lock_status",false)
                        ->where("is_clear",false)
                        ->where("notice_type","Demand")
                        ->where("property_detail_id",$this->_PROPId)
                        ->orderBy("notice_date","ASC")
                        ->first();
        $day_diff = floor(Carbon::parse($this->_notice?->served_at)->diffInDays($this->_tranDate));
        $month_diff = ceil(($day_diff * 1.00)/30);
        // if($month_diff>1 && $this->_notice?->served_at){
        //     $day_diff = $day_diff - 30;
		// 	$weak_diff = ceil(($day_diff * 1.00) /7);
		// 	$month_diff = ceil(($day_diff * 1.00)/30);
        //     $PrevDemandAmount = $this->_previousDemandList->sum("balance_tax");
        //     $priveDemandPenalty = $this->_previousDemandList->sum("monthlyPenalty");
        //     $arrearDemand = $PrevDemandAmount + $priveDemandPenalty;
        //     if($weak_diff <= 1) 
		// 		$this->_noticePenalty = roundFigure(($arrearDemand) * 0.01);
		// 	elseif($weak_diff <= 2) 
		// 		$this->_noticePenalty = roundFigure(($arrearDemand) * 0.02);
		// 	elseif($month_diff <= 1) 
		// 		$this->_noticePenalty = roundFigure(($arrearDemand) * 0.03);
		// 	elseif($month_diff <= 2) 
		// 		$this->_noticePenalty = roundFigure(($arrearDemand) * 0.05);
		// 	elseif($month_diff > 2){
		// 		$this->_noticePenalty = roundFigure(($arrearDemand) * (0.05)) ;
		// 		$this->_noticeAdditionPenalty = roundFigure(($arrearDemand + $this->_noticePenalty ) * (($month_diff -2)*0.02));

        //     }
        // }

    }

    public function getQtrRebate(){
        $user = Auth()->user();
        $currentDate = $this->_tranDate->copy()->format("Y-m-d");
        list($fromYear,$uptoYear) = explode("-",$this->_tranDateFyear);
        $firstQuarterLastDate = calculateQuaterDueDate($fromYear."-04-01");
        $firstQuarterStartDate = calculateQuarterStartDate($firstQuarterLastDate);
        # 5% online Rebate
        if(!$user || $user->getTable()!="users"){ 
            $this->_onlineRebate = ($this->_currentDemandAmount * 0.0);
        }# 2.5% JSK Rebate
        elseif($user->getTable()=="users"){
            $role = $user->getRoleDetailsByUserId()->first();
            $roleId = $role->id??0;
            if(in_array($roleId,[1,8])){
                $this->_jskRebate = ($this->_currentDemandAmount * 0.0);
            }
            
        }
        # 5% first quarter rebate
        if($firstQuarterStartDate >= $currentDate && $currentDate <= $firstQuarterLastDate){
            $this->_firstQtrRebate = ($this->_currentDemandAmount * 0.05);
        }
        $this->_quarterlyRebate = roundFigure($this->_firstQtrRebate + $this->_jskRebate + $this->_onlineRebate);
    }

    public function getSpecialRebate(){
        if(in_array($this->_PROPERTY->holding_type,['PURE_RESIDENTIAL', 'VACANT_LAND'])){
            $currentDate = $this->_tranDate->copy()->format("Y-m-d");
            list($fromYear,$uptoYear) = explode("-",$this->_tranDateFyear);
            $firstQuarterLastDate = calculateQuaterDueDate($fromYear."-04-01");
            $owners = $this->_PROPERTY->getOwners();
            if($owners->count() == 1){
                $owners = $owners->first();
                #5% when female Or transgender
                if(in_array($owners->gender, ['Female','Other'])){
                    $this->_specialRebate = $this->_demandAmount * 0.0;
                }
                #5% when armed force
                if($owners->is_armed_force){
                    $this->_specialRebate = $this->_demandAmount * 0.0;
                }
                #5% when specially able
                if($owners->is_specially_abled){
                    $this->_specialRebate = $this->_demandAmount * 0.0;
                }
                #5% when Senior Citizen
                if($owners->dob && Carbon::parse($owners->dob)->diffInYears($firstQuarterLastDate)>=60){
                    $this->_specialRebate = $this->_demandAmount * 0.0;
                }
            }
            $this->_specialRebate = roundFigure($this->_specialRebate);
        }
    }

    public function getAdvanceAmount(){
        $AdvanceDetail = new AdvanceDetail();
        $this->_advanceAmount = $AdvanceDetail->getPropAdvanceAmount($this->_PROPId)->advance_amount??0;
    }

    public function getOnePercentPenalty($demandList){
        $penalty = 0 ;
        $monthDiff = 0;
        # one percent penalty applicable
        // if($demandList->due_date >='2017-06-30' && $demandList->due_date < $this->_tranDate->copy()->format("Y-m-d")){
        //     $monthDiff = floor(Carbon::parse($demandList->due_date)->diffInMonths($this->_tranDate));
        //     $penalty = roundFigure(($demandList->balance_tax * $monthDiff)/100);
        // }
        if(getFY($demandList->due_date)<getFY())
        {
            $monthDiff = floor(Carbon::parse($demandList->due_date)->diffInMonths($this->_tranDate));
            $penalty = roundFigure(($demandList->balance_tax * $monthDiff * 1.5)/100);
        }
        if(getFY($demandList->due_date)==getFY()  && $this->_tranDate->copy()->format("Y-m-d")>=FyearQutFromDate(getFY(),3) ){
            $monthDiff = floor(Carbon::parse(FyearQutUptoDate(getFY(),2))->diffInMonths($this->_tranDate));
            $penalty = roundFigure(($demandList->balance_tax * $monthDiff * 1.5)/100);
        }
        $demandList->monthDiff = $monthDiff;
        $demandList->monthlyPenalty = $penalty;
        return $demandList;
    }

    public function generateDemand(){
        $previousDemand = $this->generateGrantTax($this->_DemandList->where("fyear","<",$this->_tranDateFyear));
        $currentTax = $this->generateGrantTax($this->_DemandList->where("fyear",$this->_tranDateFyear));
        $this->_GRID = [
            "lastPaymentClear" => $this->_lastPaymentIsClear,
            "demandList"=>$this->_DemandList,
            "previousDemand"=> $this->_previousDemandList,
            "currentDemand"=> $this->_currentDemandList,
            "notice"=>$this->_notice,
            "grantTax"=>$this->generateGrantTax($this->_DemandList),
            "otherPenaltyList"=>$this->_otherPenaltyList,
            "demandAmount"=>$this->_demandAmount,
            "rwhAmount"=> $this->_rwhAmount,
            "advanceAmount" => $this->_advanceAmount,
            "lateAssessmentPenalty" => $this->_lateAssessmentPenalty,
            "OtherPenalty"=>$this->_otherPenalty,
            "monthlyPenalty"=>$this->_monthlyPenalty,
            "noticePenalty"=>$this->_noticePenalty,
            "noticeAdditionalPenalty"=> $this->_noticeAdditionPenalty,
            "rebateAmount"=>$this->_quarterlyRebate,
            "firstQuatreRebate" => roundFigure($this->_firstQtrRebate),
            "onlineRebate" => roundFigure($this->_onlineRebate),
            "jskRebate" => roundFigure($this->_jskRebate),
            "specialRebate"=>$this->_specialRebate,
            "fromFyear"=>$this->_demandFromFyear,
            "fromQtr"=>$this->_demandFromQtr,
            "uptoFyear"=>$this->_demandUptoFyear,
            "uptoQtr"=>$this->_demandUptoQtr,
            "currentDemandAmount" =>$this->_currentDemandAmount,
            "arrearDemandAmount" => $this->_arrearDemandAmount,
            "arrearDemandMonthlyPenalty"=>$this->_arrearDemandMonthlyPenalty,
            "payableAmount" => roundFigure(($this->_demandAmount + $this->_lateAssessmentPenalty + $this->_otherPenalty + $this->_monthlyPenalty + $this->_noticePenalty + $this->_noticeAdditionPenalty) - ($this->_quarterlyRebate + $this->_specialRebate + $this->_advanceAmount) ),
            "arrearPayableAmount" => roundFigure(($this->_arrearDemandAmount + $this->_lateAssessmentPenalty + $this->_otherPenalty + $this->_arrearDemandMonthlyPenalty + $this->_noticePenalty + $this->_noticeAdditionPenalty) - ( $this->_specialRebate + $this->_advanceAmount) ),
        ];
        $this->_GRID["payableAmountInWord"] = getIndianCurrency($this->_GRID["payableAmount"]);
    }

    public function generateGrantTax($demandList){
        $demandList = collect($demandList);
        $returnData = [
            "total_tax"=>roundFigure($demandList->sum("total_tax")),
            "holding_tax"=> roundFigure($demandList->sum("holding_tax")),
            "latrine_tax"=> roundFigure($demandList->sum("latrine_tax")),
            "water_tax"=> roundFigure($demandList->sum("water_tax")),
            "health_cess_tax"=> roundFigure($demandList->sum("health_cess_tax")),
            "education_cess_tax"=> roundFigure($demandList->sum("education_cess_tax")),
            "rwh_tax"=> roundFigure($demandList->sum("rwh_tax")),
            "fine_tax"=> roundFigure($demandList->sum("fine_tax")),
            "adjust_amt"=> roundFigure($demandList->sum("adjust_amt")),
            "balance_tax"=> roundFigure($demandList->sum("balance_tax")),
            "due_holding_tax"=> roundFigure($demandList->sum("due_holding_tax")),
            "due_latrine_tax"=> roundFigure($demandList->sum("due_latrine_tax")),
            "due_water_tax"=> roundFigure($demandList->sum("due_water_tax")),
            "due_health_cess_tax"=> roundFigure($demandList->sum("due_health_cess_tax")),
            "due_education_cess_tax"=> roundFigure($demandList->sum("due_education_cess_tax")),
            "due_rwh_tax"=> roundFigure($demandList->sum("due_rwh_tax")),
            "monthlyPenalty"=> roundFigure($demandList->sum("monthlyPenalty")),
        ];
        return collect($returnData);
    }

    public function getPropDue(){
        $this->getQtrRebate();
        $this->getSpecialRebate();
        $this->getAdvanceAmount();
        $this->getOtherPenalty();
        $this->noticePenalty();
        $this->generateDemand();
    }
}