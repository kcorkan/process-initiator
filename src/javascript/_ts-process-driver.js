Ext.define('Rally.technicalservices.ProcessDriver',{
    logger: new Rally.technicalservices.Logger(),
    projectRef: '',

/*
 * processDefinitions:  Array of Rally.technicalservices.ProcessDefinition objects to define the process for this app
 */
	processDefinitions: [],
/*
 * static_fields:  These fields will always be fetched and displayed regardless of process definition
 */
    static_fields:  ['FormattedID','Name'],  
    
	constructor: function(config){
        Ext.apply(this,config);
    },
/*
 * getDisplayFields:  Returns an array of strings representing fields to display on the grid
 * 
 */
    getDisplayFields: function(){
    	this.logger.log('getDisplayFields');
    	var display_fields = this.static_fields;
    	Ext.each(this.processDefinitions, function(pd){
    		display_fields.push(pd.rallyField);
    	},this);
    	return display_fields;
    },
/*
 * getFetchFields:  Returns an array of strings representing fields to fetch from 
 * the database.  This will include fields that should not be displayed but should
 * be fetched because they are included in the process definition
 * 
 */
    getFetchFields: function(){
    	this.logger.log('getFetchFields');
    	var fetch_fields = this.static_fields;
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
/*
 * getColumnConfigurations: Returns an array of column objects to render in the grid.  
 * 
 */
    getColumnConfigurations: function(){
    	this.logger.log('getColumnConfigurations');
    	var me = this;
    	
      	var columns = [{ 
            text: 'FormattedID',
            dataIndex: 'FormattedID',
        },{
            text: 'Name',
            dataIndex: 'Name',
            flex: 1
        }]; 
    	
    	Ext.each(this.processDefinitions, function(pd){
//    		var process_col = { 
//				 scope: this,
//				 xtype:'actioncolumn',
//				 text: pd.rallyField,
//				 items: [{
//				     icon: '/slm/images/blocked.gif',
//				     tooltip: 'Block',
//				     scope: this,
//				     value: true,
//				     handler: this._initiateProcessDialog,
//				     dataIndex: pd.rallyField
//				 }]
//    		};
    		var process_col = {
                width: 75,    
                renderer: function (v, m, rec, row, col) {
                    var id = Ext.id();
                    Ext.defer(function () {
                        Ext.widget('rallybutton', {
                            renderTo: id,
                            text: pd.shortName,
                            scope: this,
                            cls: 'secondary small',
                            handler: function () {
                                me._initiateProcessDialog(rec, row, pd, me);
                            }
                        });
                    }, 50, this);
                    return Ext.String.format('<div id="{0}"></div>', id);
                    }
                }
    		columns.push(process_col);
    	},this);
    	
     return columns;        
    },
    /*
     * addNew:  Adds a new artifact based on the process definition rules.  If there
     * is no process definition for add new, then it should launch the artifact add new window. 
     */
    addNew: function(){
    	this.logger.log('addNew');
    	alert('addNew');
    },
    /*
     * _initiateProcessDialog:  launches the process dialog for the selected process and record. 
     */
    _initiateProcessDialog: function(rec,rowIndex,pd,me){
    	me.logger.log('_initiateProcessDialog',rec,rowIndex,pd.shortName);

    	dlg = Ext.create('Rally.technicalservices.dialog.Process', {
    	     processDefinition: pd,
    	     projectRef: me.projectRef,
    	     record: rec
    	 });
    	dlg.show();
    }

});
