Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    items: [
        {xtype:'container',itemId:'settings_box'},
        {xtype:'container',itemId:'message_box',tpl:'Hello, <tpl>{_refObjectName}</tpl>'},
        {xtype:'container',itemId:'button_box', padding: 10},
        {xtype:'container',itemId:'grid_box', padding: 50},
        {xtype:'tsinfolink'}
    ],
    
    launch: function() {
    	this._fetchProcessList().then({
    		scope: this,
    		success: function(){
    	        if (this.isExternal()){
        			console.log('success');
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
    },
    _fetchProcessList: function(){
    	var deferred = Ext.create('Deft.Deferred');
    	Rally.technicalservices.util.PreferenceSaving.fetchFromJSON(Rally.technicalservices.ProcessDefinition.getProcessDefinitionPrefix(), 
    			this.getContext().getWorkspace()).then({
    				scope: this,
    				success: function(obj){
    					console.log('_fetchProcessList', obj, obj[0].getKeys());
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
                    listeners: {
                    	change: function(cb, newValue){
                    		console.log('change',newValue);
                    	}
                    },
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
//	                }
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
          
          console.log(process_defs);
          if (process_defs.length == 0){
        	  this.down('#message_box').update('No processes have been defined for this app.  Please use the App Settings to define at least one process.');
        	  return;
          }
          
    	  //Build and save column settings...this means that we need to get the display names and multi-list
          var process_driver = Ext.create('Rally.technicalservices.ProcessDriver',{
          	processDefinitions: process_defs,
          	projectRef: this.getContext().getProjectRef()
          });
          
          var add_new_btn = this.down('#button_box').add({
          	xtype: 'rallybutton',
          	text: process_driver.getAddNewText(),
          	cls: 'primary small',
          });
          add_new_btn.on('click',process_driver.addNew, process_driver);
          
          this._loadAStoreWithAPromise(settings.type, process_driver.getFetchFields()).then({
              scope: this,
              success: function(store){
                  this.down('#grid_box').add({
                      xtype: 'rallygrid',
                      store: store,
                      enableBlockedReasonPopover: false,
                      columnCfgs: process_driver.getColumnConfigurations(),
                      showRowActionsColumn: false,
                      enableBulkEdit: false,
                      enableRanking: false,
                      enableEditing: false
                  });
              },
              failure: function(error_message){
                  alert(error_message);
              }
          });
      },

});