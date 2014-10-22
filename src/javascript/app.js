Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    items: [
        {xtype:'container',itemId:'message_box',tpl:'Hello, <tpl>{_refObjectName}</tpl>'},
        {xtype:'container',itemId:'button_box', padding: 10},
        {xtype:'container',itemId:'grid_box', padding: 50},
        {xtype:'tsinfolink'}
    ],
    
    launch: function() {
      // Hardcoded process definitions  
    	var rally_type = 'HierarchicalRequirement';
        var pd1 = Ext.create('Rally.technicalservices.ProcessDefinition',{
            processName: '[Process] Block a User Story',
            shortName: 'Block',
            rallyType: rally_type,
            rallyField: 'Blocked',
        	processDetail: {
    	//		'true': ['BlockedReason','BlockerCategory','BlockerOwner','BlockerCreationDate','BlockerEstimatedResolutionDate','Release','Iteration','Project']
        		'true': ['BlockedReason','BlockerCategory','BlockerCreationDate','Release','Iteration','Project']
                	}
        });
        var pd2 = Ext.create('Rally.technicalservices.ProcessDefinition',{
            processName: '[Process] Create-a-User Story',
            shortName: 'Add User Story',
            processType: 'new',
            rallyType: rally_type,
        	processDetail: {
    			required : ['Name','UserStoryType','Project','Description','Iteration','Release','Owner']
        	}
        });
       
        
        
        var process_driver = Ext.create('Rally.technicalservices.ProcessDriver',{
        	processDefinitions: [pd1,pd2],
        	projectRef: this.getContext().getProjectRef()
        });
        //END Hardcoded process definitions
        
        var add_new_btn = this.down('#button_box').add({
        	xtype: 'rallybutton',
        	text: '+Add New',
        	cls: 'primary small',
//        	scope: this,
//        	handler: process_driver.addNew	
        });
        add_new_btn.on('click',process_driver.addNew, process_driver);
        
        this._loadAStoreWithAPromise(rally_type, process_driver.getFetchFields()).then({
            scope: this,
            success: function(store){
                this.down('#grid_box').add({
                    xtype: 'rallygrid',
                    store: store,
                    enableBlockedReasonPopover: false,
                    columnCfgs: process_driver.getColumnConfigurations()
                });
            },
            failure: function(error_message){
                alert(error_message);
            }
        });
    },
    _loadAStoreWithAPromise: function(model_name, model_fields){
        var deferred = Ext.create('Deft.Deferred');
        
        var defectStore = Ext.create('Rally.data.wsapi.Store', {
            model: model_name,
            fetch: model_fields,
            autoLoad: true,
            listeners: {
                load: function(store, records, successful) {
                    if (successful){
                        deferred.resolve(store);
                    } else {
                        deferred.reject('Failed to load store for model [' + model_name + '] and fields [' + model_fields.join(',') + ']');
                    }
                }
            }
        });
        return deferred.promise;
    }
});