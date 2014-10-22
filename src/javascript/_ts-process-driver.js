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
    		if (!pd.isNew()){
        		display_fields.push(pd.rallyField);
    		}
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
    		fetch_fields = (Ext.Array.merge(fetch_fields,pd.getProcessFields()));
    	}, this);
    	this.logger.log(fetch_fields);
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
    		if (!pd.isNew()){
				var process_col = {
						xtype: 'actioncolumn',
						buttonText: pd.shortName,
						buttonCls: 'ts-secondary-button',
						scope: this,
						items: [{
							scope: this,
			                handler: function(grid, row, col) {
			                	me._initiateProcessDialog(grid, row, pd);
			                }
			            }]
					}
				}
				
				
//				        width: 75,    
//				        renderer: function (v, m, rec, row, col) {
//				        	var id = Ext.id();
//				            
//				            Ext.create('Ext.Container', {
//				                items: [{
//				                	xtype: 'rallybutton', text: 'clickmdde', handler: function(){alert('hi');}
//				                }],
//				                renderTo: id
//				            });
//				            
//				            
//				            Ext.defer(function () {
//				                Ext.widget('rallybutton', {
//				                renderTo: id,
//				                text: pd.shortName,
//				                scope: this,
//				                cls: 'secondary small',
//				                handler: function () {
//				                    me._initiateProcessDialog(rec, row, pd, me);
//				                }
//				            });
//				        }, 50, this);
//				        return Ext.String.format('<div id="{0}"></div>', id);
//				        },
//				        editor: {xtype: 'rallybutton', text: 'clickmdde', handler: function(){alert('hi');}}
//				    }
				columns.push(process_col);
//    	 	}
    	},this);
     return columns;        
    },
    _getArtifactType: function(){
   	 return this.processDefinitions[0].rallyType;
    },
    _getNewArtifactProcessDefinition: function(){
      	 this.logger.log('_getNewArtifactProcessDefinition');
	   	 Ext.each(this.processDefinitions, function(pd){
	      		 if (pd.isNew()){
	      			 return pd;
	      		 }
	      	 },this);
      	 return {};  
       },

    /*
     * addNew:  Adds a new artifact based on the process definition rules.  If there
     * is no process definition for add new, then it should launch the artifact add new window. 
     */
    addNew: function(){
//    	this.logger.log('addNew');
    	
    	var new_pd = {};
    	if (_.isEmpty({})){
    		//kick off a new object.
    		Rally.nav.Manager.create(this._getArtifactType());

     	} else {
       	   	dlg = Ext.create('Rally.technicalservices.dialog.Process', {
      	   	     processDefinition: new_pd,
      	   	     projectRef: this.projectRef
         	 	});
       	   	dlg.show();

    	}
    	
     },
 
    /*
     * _initiateProcessDialog:  launches the process dialog for the selected process and record. 
     */
    _initiateProcessDialog: function(grid,rowIndex, pd){
    	this.logger.log('_initiateProcessDialog',grid,rowIndex,pd.shortName);
    	var rec = grid.getStore().getAt(rowIndex);
    	dlg = Ext.create('Rally.technicalservices.dialog.Process', {
    	     processDefinition: pd,
    	     projectRef: this.projectRef,
    	     record: rec
    	 });
    	dlg.show();
    }

});
