Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    items: [
        {xtype:'container',itemId:'settings_box'},
        {xtype:'container',itemId:'message_box',tpl:'Hello, <tpl>{_refObjectName}</tpl>'},
        {xtype:'container',itemId:'button_box', layout: {type:'hbox'}, padding: 10},
        {xtype:'container',itemId:'filter_box', layout: {type:'hbox'}, padding: 10},
        {xtype:'container',itemId:'grid_box', padding: 50},
        {xtype:'tsinfolink'}
    ],
    config: {
        defaultSettings: {
            type: 'Defect',
            displayColumns: 'Name,FormattedID'
        }
    },
    displayFieldBlacklist: ['Changesets','Description','Notes','RevisionHistory','Tags','Attachments',
                            'Tasks','Discussion','DragAndDropRank','LatestDiscussionAgeInMinutes'],
    launch: function() {
    	this._fetchProcessList().then({
    		scope: this,
    		success: function(){
    	        if (this.isExternal()){
    	            this.showSettings();
    	        } else {
    	            this.onSettingsUpdate(this.getSettings());  //(this.config.type,this.config.pageSize,this.config.fetch,this.config.columns);
    	        }        
    	 
    		},
    		failure: function(error){
    			this.logger.log(error);
    			this.processList = [];
    		}
    	}); 
    },

    _fetchProcessList: function(){
    	var deferred = Ext.create('Deft.Deferred');
    	Rally.technicalservices.util.PreferenceSaving.fetchFromJSON(Rally.technicalservices.ProcessDefinition.getProcessDefinitionPrefix(), 
    			this.getContext().getWorkspace()).then({
    				scope: this,
    				success: function(obj){
    					
    	    			 this.processList = obj[0];
    					deferred.resolve();
    				},
    				failure: function(){
    					deferred.reject("Could not load preference keys");
    				}
    			});
    	return deferred.promise;
    },
    _getProcessListStore: function(){
    	var data = [];
    	
    	Ext.each(this.processList.getKeys(), function(key){
    		data.push({'key': key, 'name':this.processList.get(key).processName});
    	},this);
    	return Ext.create('Rally.data.custom.Store',{
    		data: data
    	});
    },
    _configureProcess: function(){
   	    var deferred = Ext.create('Deft.Deferred');
    	dlg = Ext.create('Rally.ui.dialog.Dialog', {
   	   		y: 0,
   	   		modal: true,
   	   		items: [{
   	   			xtype: 'rallybutton',
   	   			text: 'Save',
   	   			handler: function(){
   	   				
   	   			}
   	   		}]
    	});
	   	dlg.show();    
	   	
    },
    getSettingsFields: function(){
    	this.logger.log('getSettingsFields');
    	var store = this._getProcessListStore();

        var filters = Ext.create('Rally.data.wsapi.Filter',{
            property:'Name',
            operator: 'contains',
            value: 'rally.technicalservices.process-initiator.'
        });
        filters = filters.and(Ext.create('Rally.data.wsapi.Filter',{
            property:'Workspace',
            value: this.getContext().getWorkspace()}));
    	
        return [{
                    name: 'type',
                    xtype:'rallycombobox',
                    displayField: 'DisplayName',
                    storeConfig: {
                        model:'TypeDefinition',
                       filters: [{property: 'Restorable',value:true},
                                 {property: 'Creatable', value: true}]
                    },
                    autoExpand: true,
                    fieldLabel: 'Rally Type:',
                    valueField:'TypePath',
            		labelWidth: 100,
            		value: 'Defect',
                    listeners: {
                    	change: function(cb, newValue){
                    		console.log('change',newValue);
                    	}
                    },
                    bubbleEvents: ['change', 'ready'],
                    readyEvent: 'ready'
//                },{
//	                name: 'processes',
//	                xtype: 'rallymultiobjectpicker',
//	                labelWidth: 100,
//	                fieldLabel: 'Processes:',
//	                storeConfig: {
//	                	model: 'preference',
//	                	fetch: ['Name'],
//	                	filters: filters,
//	                	pageSize: 20
//	                 }
        		},{
        			name: 'displayColumns',
        			xtype: 'rallyfieldpicker',
        			fieldLabel: 'Display Columns:',
        			modelTypes: ['Defect'],
        			labelWidth: 100,
        			autoExpand: false,
        			alwaysExpanded: false,
        			fieldBlackList: this.displayFieldBlacklist, 
        			handlesEvents: {
        				change: function(cb, newVal){
        					this.modelTypes = [newVal];
        					this.refreshWithNewContext(this.context);
        				},
        				ready: function(cb){
        					this.modelTypes = [cb.getValue()];
        					this.refreshWithNewContext(this.context);
        				}
        			}
        		}];
    },
    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
      },
      //showSettings:  Override
      showSettings: function(options) {      
          var fields = this.getSettingsFields(); 

    	  this._appSettings = Ext.create('Rally.app.AppSettings', Ext.apply({
              fields: this.getSettingsFields(),
              settings: this.getSettings(),
              context: this.getContext(),
              settingsScope: this.settingsScope,
              autoScroll: true
          }, options));

          this._appSettings.on('cancel', this._hideSettings, this);
          this._appSettings.on('save', this._onSettingsSaved, this);
          if (this.isExternal()){
              if (this.down('#settings_box').getComponent(this._appSettings.id)==undefined){
                  this.down('#settings_box').add(this._appSettings);
              }
          } else {
              this.hide();
              this.up().add(this._appSettings);
          }
          return this._appSettings;
      },
      _onSettingsSaved: function(settings){
          Ext.apply(this.settings, settings);
          this._hideSettings();
          this.onSettingsUpdate(settings);
      },
     
      //onSettingsUpdate:  Override
      onSettingsUpdate: function (settings){
          this.logger.log('onSettingsUpdate', settings);
          
//          var process_def_keys = [];
//          if (settings.processDefinitions) {
//              process_def_keys = settings.processDefinitions.split('\n');
//          }
        var process_def_keys = [];
        if (settings.type) {
            Ext.each(this.processList.getKeys(), function(key){
            	if (this.processList.get(key).rallyType.toLowerCase() == settings.type.toLowerCase()){
            		process_def_keys.push(key);
            	}
            },this);
         }
        
          var process_defs = [];
          Ext.each(process_def_keys, function(pdk){
        	  var pd = Ext.create('Rally.technicalservices.ProcessDefinition',{}, this.processList.get(pdk));
        	  process_defs.push(pd);
          },this);
          
          if (process_defs.length == 0){
        	  this.down('#message_box').update('No processes have been defined for this app.  Please use the App Settings to define at least one process.');
        	  return;
          }
          
    	  //Build and save column settings...this means that we need to get the display names and multi-list
          var process_driver = Ext.create('Rally.technicalservices.ProcessDriver',{
          	processDefinitions: process_defs,
          	projectRef: this.getContext().getProjectRef()
          });
          
          /*
           * Add New Button
           */
          var add_new_btn = this.down('#button_box').add({
            	xtype: 'rallybutton',
            	text: process_driver.getAddNewText(),
            	cls: 'primary small',
          });
          add_new_btn.on('click',process_driver.addNew, process_driver);
          
          /*
           * Filter Controls 
           */ 
          var columns = this.settings.displayColumns.toString().split(',');  
          var cb = this.down('#filter_box').add({
        	  xtype: 'rallycombobox',
        	  fieldLabel: 'Filter Results By',
        	  labelAlign: 'right',
        	  itemId: 'filter-property',
        	  allowNoEntry: true,
        	  noEntryText: '-- Select Column --',
        	  store: this._getFilterPropertyStore(columns),
        	  displayField: 'name',
        	  valueField: 'name',
        	  padding: 5,
        	  listeners: {
        		  scope: this,
        		  change: this.addFilterCriteriaBoxes
        	  }        	  
          });
          cb.setValue('Name');

          /*
           * Grid
           */
          var fetch_fields = Ext.Array.merge(process_driver.getFetchFields(), columns);
          var store_configs = {
              model: settings.type,
              fetch: process_driver.getFetchFields(),
              autoLoad: true,
              pageSize: 500,
          };
          
          if (settings.type.toLowerCase() == 'hierarchicalrequirement'){
        	  store_configs['groupField'] = 'Feature';
        	  store_configs['groupDir'] = 'ASC';
              store_configs['getGroupString'] = function(record) {
                  var feature = record.get('Feature');
                  return (feature && feature._refObjectName) || 'No Feature';
              }
              if (!Ext.Array.contains(store_configs['fetch'],'Feature')){
            	  store_configs['fetch'].push('Feature');
              }
          } 
          var artifact_store =  Ext.create('Rally.data.wsapi.Store', store_configs);	  
          
          var grid_configs = {
                  xtype: 'rallygrid',
                  store: artifact_store,
                  itemId: 'data-grid',
                  enableBlockedReasonPopover: false,
                  columnCfgs: process_driver.getColumnConfigurations(columns),
                  showRowActionsColumn: false,
                  enableBulkEdit: false,
                  enableRanking: false,
                  enableEditing: false,
                  showPagingToolbar: true,
                  pagingToolbarCfg: {
                	  pageSizes: [20, 50, 200, 500]
                  }
          };
          
          if (settings.type.toLowerCase() == 'hierarchicalrequirement'){
        	  grid_configs['features'] =  [{
                  ftype: 'groupingsummary',
                  groupHeaderTpl: '{name} ({rows.length})'
              }];
          }
    	  this.down('#grid_box').add(grid_configs);

      },
      /*
       * Filter Functions
       * 
       */
      _filterGrid: function(){
    	 var prop = this.down('#filter-property').getValue();
    	 var op = this.down('#filter-operator').getValue(); 
    	 var val = this.down('#filter-value').getValue(); 
    	 var f = Ext.create('Rally.data.wsapi.Filter',{
    		    property: prop,
    		    operator: op,
    		    value   : val
    		});
    	  this.down('#data-grid').filter(f,true,true);
      },

      addFilterCriteriaBoxes: function(cb, newValue){
    	  this.logger.log('addFilterCriteriaBoxes', newValue);
          if (this.down('#filter-operator')){this.down('#filter-operator').destroy();}
          if (this.down('#filter-value')){this.down('#filter-value').destroy();}
          if (this.down('#filter-button')){this.down('#filter-button').destroy();}
          if (this.down('#clear-filter-button')){this.down('#clear-filter-button').destroy();}
         
    	  var cbo = this.down('#filter_box').add({
        	  xtype: 'rallycombobox',
        	  itemId: 'filter-operator',
        	  displayField: 'name',
        	  valueField: 'name',
        	  allowNoEntry: true,
        	  noEntryText: '-- Select Operator --',
        	  padding: 5,
        	  store: this._getFilterOperatorStore(newValue)
          });
    	 cbo.setValue('=');
    	  
    	  var filter_value_ctl = this._getFilterValueControl(newValue);
          this.down('#filter_box').add(filter_value_ctl);         
          
          this.down('#filter_box').add({
        	  xtype: 'rallybutton',
        	  itemId: 'filter-button',
        	  scope: this, 
        	  text: 'Filter',
        	  margin: 5,
        	  handler: this._filterGrid
          });
          
          this.down('#filter_box').add({
        	  xtype: 'rallybutton',
        	  itemId: 'clear-filter-button',
        	  scope: this, 
        	  text: 'Clear',
        	  margin: 5,
        	  handler: this._clearGridFilter
          });

      },
      _getFilterValueControl: function(newVal){
    	  var ctl = {
        	  xtype: 'rallytextfield',
        	  padding: 5,
        	  itemId: 'filter-value'
          };
    	  if (newVal && (newVal.toLowerCase() == 'project')){
    		  ctl = {
    				  xtype: 'rallyprojectpicker',
    				  itemId: 'filter-value',
    	        	  padding: 5
    		  };
    	  }
    	  if (newVal && (newVal.toLowerCase() == 'owner' || newVal.toLowerCase() == 'submittedby')){
    		  ctl = {
    			xtype: 'rallyusersearchcombobox',
    			project: this.getContext().getProject(),
				itemId: 'filter-value',
				padding: 5
    		  };
    	  }
    	  return ctl; 
      },
      _clearGridFilter: function(){
    	  this.down('#data-grid').getStore().clearFilter();
    	  this.down('#filter-property').setValue(null);
    	  this.down('#filter-operator').setValue(null);
    	  this.down('#filter-value').setValue('');

      },
      _getFilterPropertyStore: function(columns){
		  	this.logger.log('_getFilterPropertyStore');
		
		  	var data = [];
			Ext.each(columns, function(col){
		        data.push( {'name': col} );
			},this);
			
			var fb_store = Ext.create('Rally.data.custom.Store', {
		        data: data,
		        autoLoad: true
		    });
			return fb_store; 
      },

      _getFilterOperatorStore: function(newVal){
		  	this.logger.log('_getFilterOperatorStore');

		  	var data = [ {'name':'='}, {'name':'contains'}];
		  	if (newVal && (newVal.toLowerCase() == 'owner' || newVal.toLowerCase() == 'submittedby' ||
		  			newVal.toLowerCase() == 'project')){
		  		data = [ {'name':'='}];
		  	}
		  	
			var fb_store = Ext.create('Rally.data.custom.Store', {
		        data: data,
		        autoLoad: true
		    });
			return fb_store; 
      }
});