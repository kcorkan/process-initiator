Ext.define('Rally.technicalservices.ProcessDefinition',{
    constructor: function(config){
        Ext.apply(this,config);
    },
    processName: 'The Blocked Process',
    processType: 'Required Fields',
    rallyType: 'Defect',
    rallyField: 'Blocked',
    rallyFieldType: 'boolean',
    processDetail: {}, 
    validate: function(value, detail_field, detail_value){
    	var req_fields = [];
    	console.log('validate',value, Object.keys(this.processDetail),value, this.processDetail);
    	if (Ext.Array.contains(Object.keys(this.processDetail), value.toString())){
        	req_fields = this.processDetail[value.toString()];
    	} else {
    		req_fields = this.processDetail['ALL'];
    	}
    	console.log('req-fields',req_fields);
    	if (Ext.Array.contains(req_fields, detail_field)){
    		if (detail_value.length > 0){
    			return {valid: true};  
    		}
    	} else {
			return {valid: true};  
    	}
    	var msg = Ext.String.format("A value for field {0} is required when {1} = {2}.", detail_field, this.rallyField, value);
		return {valid: false, message: msg};  

    }
    
//    validations: [
//                  {type: 'presence',  field: 'age'},
//                  {type: 'length',    field: 'name',     min: 2},
//                  {type: 'inclusion', field: 'gender',   list: ['Male', 'Female']},
//                  {type: 'exclusion', field: 'username', list: ['Admin', 'Operator']},
//                  {type: 'format',    field: 'username', matcher: /([a-z]+)[0-9]{2,3}/}
//              ]
    
});


