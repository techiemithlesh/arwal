<?php

namespace App\Http\Controllers\DBSystem;

use App\Exceptions\CustomException;
use App\Http\Controllers\Controller;
use App\Models\DBSystem\ParamModel;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class QueryEditedController extends Controller
{
    private $conn;
    private $dbList = [
        [
            "label"=>"system",
            "value"=>null,
        ],
        [
            "label"=>"property",
            "value"=>"property",
        ],
        [
            "label"=>"water",
            "value"=>"water",
        ],
        [
            "label"=>"trade",
            "value"=>"trade",
        ],
        // [
        //     "label"=>"system",
        //     "value"=>null,
        // ],
    ];

    function __construct()
    {
        $this->conn = (new ParamModel())->getConnectionName();
    }

    private function resolveDynamicConnection($dbKey="")
    {
        $ulbId = App::has('CurrentUlbId') ? App::get('CurrentUlbId') : null;
        if($dbKey){
            $this->conn =  $ulbId ? Config::get("SystemConstant.ULB-DB.".$ulbId.".".$dbKey) : $this->conn;
        }
    }

    public function getDbList(Request $request){
        try{
            return responseMsg(true,"DB List",remove_null($this->dbList));
        }catch(CustomException $e){
            return responseMsg(false, $e->getMessage(), ""); 
        }catch(Exception $e){
            return responseMsg(false, "Server Error", ""); 
        }
    }

    public function getTableList(Request $request){
        try{
            $rules = [
                "conn"=>"nullable|in:".collect($this->dbList)->pluck("value")->implode(","),
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $this->resolveDynamicConnection($request->conn);
            $data = DB::connection($this->conn)->select("select c.relname AS name,
                    c.relkind,
                    CASE WHEN c.relkind='r' THEN 'table'
                        WHEN c.relkind='v' THEN 'view'
                        WHEN c.relkind='m' THEN 'materialized view'
                        WHEN c.relkind='f' THEN 'foreign table'
                        else 'other'
                    END as table_type
                    FROM pg_class c
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE n.nspname = 'public' 
                    AND c.relkind IN ('r','v','m','f')
                    ORDER BY c.relkind, name");
            return responseMsg(true,"Table List",remove_null($data));
        }catch(CustomException $e){
            return responseMsg(false, $e->getMessage(), ""); 
        }catch(Exception $e){
            return responseMsg(false, "Server Error", ""); 
        }
    }

    public function QueryExecute(Request $request){
        try{
            $rules = [
                "conn"=>"nullable|in:".collect($this->dbList)->pluck("value")->implode(","),
                "statement"=>"required",
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();
            $roles = $user->getRoleDetailsByUserId()->get()->first();
            if($roles->id!=1 || $user->getTable()!="users"){
                throw new CustomException("Permission Denial");
            }
            $this->resolveDynamicConnection($request->conn);
            $sql = $request->statement;
            $data = null;
            if(preg_match('/update |insert |delete |alter |create |drop |truncate |call |lock |commit |rollback /i',$sql)){
                $results = "UPDATE ". DB::connection($this->conn)->affectingStatement($sql) . " record affected";
                $data = $results;
            }else{                
                $results = DB::connection($this->conn)->select($sql);                
                $firstRow = $results[0] ?? [];
                $data["headers"] = array_keys((array) $firstRow);
                $data["data"]=$results;
                if(empty($results)){
                    $data="No data";
                }
            }
            return responseMsg(true, "Execute Successfully", $data);
        }catch(CustomException $e){
            return responseMsg(false, $e->getMessage(), ""); 
        }catch(Exception $e){
            return responseMsg(false, $e->getMessage(), ""); 
        }
    }

    
}
