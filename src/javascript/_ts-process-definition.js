Ext.define('Rally.technicalservices.ProcessDefinition',{
    constructor: function(config){
        Ext.apply(this,config);
    },
    processName: 'Blocked',
    processType: 'Required Fields',
    rallyType: 'Defect',
    rallyField: 'Blocked',
    rallyFieldValue: true,
    parameters: ['Notes'],
    getDisplayFields: function(){
    	return ['FormattedID','Name',this.rallyField];
    },
    getColumnConfigurations: function(){
    	var rally_field_col = {};
    	if (this.rallyField == 'Blocked'){
    		rally_field_col = { 
				 scope: this,
				 xtype:'actioncolumn',
				 items: [{
				     icon: '/slm/images/blocked.gif',
				     tooltip: 'Block',
				     scope: this,
				     value: true,
				     handler: this._initiateProcess
				 }]
    		};
    	} 
    	
     	var columns = [{ 
             text: 'FormattedID',
             dataIndex: 'FormattedID',
         },{
             text: 'Name',
             dataIndex: 'Name',
             flex: 1
         }, 
         rally_field_col];
     return columns;        
    },
    _initiateProcess: function(){
    	alert ('process');
    }
    
   
});
