Ext.define('Rally.technicalservices.ProcessDefinition',{
    logger: new Rally.technicalservices.Logger(),
    processName: '',
    shortName: '',
    rallyType: null,  //Required
    /*
     * rallyField:  The field that the processDetail rules belong to.  If this is null, then 
     * this process definition applies to new objects.  
     * 
     */
    rallyField: null,
    /*
     * processDetail: The rules for this process
     * 
     *    EXAMPLE:
     *    {
     *    	type:  presence | inclusion* | exclusion* | format*   (*not implemented yet),
     *      field:  the field that the rule is applied to (e.g. FixedInBuild),
     *      triggerValues: [] Array of values that trigger this rule (e.g. ['Fixed', 'Closed'];  If this is empty, then it applies to all objects
     *    }
     * 
     */
    processDetail: {}, 
    

    constructor: function(config){
        Ext.apply(this,config);
    },
    
    /*
     * getProcessFields: returns the fields that are defined in all the rules for the current process
     * 
     */
    getProcessFields: function(){
    	var fields = [];
    	if (this.rallyField){
    		fields.push(this.rallyField);
    	}
    	Ext.each(Object.keys(this.processDetail), function(pdkey){
			Ext.each(this.processDetail[pdkey], function(pdd){
				fields.push(pdd);
			}, this);
		}, this);
    	this.logger.log('getProcessFields', fields);
    	return fields; 
    },
    /*
     * getRelevantProcessFields: returns the fields that are triggered by for the current value of the process field
     * 
     */
    getRelevantProcessFields: function(value){
    	
    },
    
    validate: function(value, detail_field, detail_value){
    	this.logger.log('validate',value,detail_field,detail_value);
    	var req_fields = [];
    	
    	if (Ext.Array.contains(Object.keys(this.processDetail), value.toString())){
        	req_fields = this.processDetail[value.toString()];
    	} else {
    		req_fields = this.processDetail['ALL'];
    	}

    	if (Ext.Array.contains(req_fields, detail_field)){
    		if (detail_value && detail_value.length > 0){
    			return {valid: true};  
    		}
    	} else {
			return {valid: true};  
    	}
    	var msg = Ext.String.format("A value for field {0} is required when {1} = {2}.", detail_field, this.rallyField, value);
		return {valid: false, message: msg};  

    }
    
/*
 * This is just an example of validations in the model object.  
 * Trying to make the processDetail similiar so that someday we may be able to take
 * advantage of this functionality
 * 
 * validations: [
 *	                {type: 'presence',  field: 'age'},
 *                  {type: 'length',    field: 'name',     min: 2},
 *                  {type: 'inclusion', field: 'gender',   list: ['Male', 'Female']},
 *                  {type: 'exclusion', field: 'username', list: ['Admin', 'Operator']},
 *                  {type: 'format',    field: 'username', matcher: /([a-z]+)[0-9]{2,3}/}
 *               ]
 * 
 */ 
    
});


