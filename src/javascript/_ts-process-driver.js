Ext.define('Rally.technicalservices.ProcessDriver',{
    processDefinitions: [],
    projectRef: '',
	constructor: function(config){
        Ext.apply(this,config);
    },
    getDisplayFields: function(){
    	var display_fields = ['FormattedID','Name'];
    	Ext.each(this.processDefinitions, function(pd){
    		display_fields.push(pd.rallyField);
    	},this);
    	return display_fields;
    },
    getFetchFields: function(){
    	var fetch_fields = ['FormattedID','Name'];
    	Ext.each(this.processDefinitions, function(pd){
    		fetch_fields.push(pd.rallyField);
    			Ext.each(Object.keys(pd.processDetail), function(pdkey){
    				Ext.each(pd.processDetail[pdkey], function(pdd){
    	    			fetch_fields.push(pdd);
    				}, this);
    			}, this);
    	}, this);
    	return fetch_fields;
    },
    getColumnConfigurations: function(){
    	var rally_field_col = {};
    	if (this.processDefinitions[0].rallyField == 'Blocked'){
    		rally_field_col = { 
				 scope: this,
				 xtype:'actioncolumn',
				 text: this.processDefinitions[0].rallyField,
				 items: [{
				     icon: '/slm/images/blocked.gif',
				     tooltip: 'Block',
				     scope: this,
				     value: true,
				     handler: this._initiateProcess,
				     dataIndex: this.processDefinitions[0].rallyField
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
    _initiateProcess: function(grid,rowIndex,colIndex){
    	console.log('_initiateProcess',grid,rowIndex,colIndex);
    	var rec = grid.getStore().getAt(rowIndex);
    	dlg = Ext.create('Rally.technicalservices.dialog.Process', {
    	     processDefinition: this.processDefinitions[0],
    	     projectRef: this.projectRef,
    	     record: rec
    	 });
    	dlg.show();
    },

});
