Ext.define('Rally.technicalservices.dialog.Process',{
    extend: 'Rally.ui.dialog.Dialog',
    logger: new Rally.technicalservices.Logger(),
    autoShow: true,
    draggable: true,
    width: 400,
    processDefinition: null,
    record: null,
    projectRef: null,
    
    constructor: function(config){
         Ext.apply(this,config);
	     
   	     this.title = this.processDefinition.processName;
         this.items = this._buildItems(this.record, this.processDefinition);
         this.logger.log('ProcessDefinition dialog constructor', this.title, this.items);
         
         this.callParent(arguments);

         if (this.processDefinition.isNew()){
             Rally.data.ModelFactory.getModel({
         	    type: this.processDefinition.rallyType,
         	    scope: this,
         	    success: function(model) {
         	    	var record = Ext.create(model, {});
         	    	this.record = record;
         	    	this.logger.log('New record created. Building fields',this.processDefinition.getProcessFields());
         	    	this._buildDetailFields(this.processDefinition.getProcessFields());
         	    }
         	});
         } else {
             this.down('#' + this.processDefinition.rallyField).setValue(this.record.get(this.processDefinition.rallyField));
         } 
    },
    _buildItems: function(rec){
  	     var items = [];
  	     items.push({xtype:'container',itemId:'message_box'});
  	     if (!this.processDefinition.isNew()){
  	  	     items.push(this._getProcessFieldComponent(rec));  	    	 
  	     }
  	     items.push(this._getDetailFieldsComponentBox());
  	     items.push(this._getSaveButton());
  	     items.push(this._getCancelButton());
  	     return items;
    },
    _getSaveButton: function(){
    	return {
            xtype     : 'rallybutton',
            text      : 'Save',
            scope: this,
            handler      : this._save
    	}
    },
    _getCancelButton: function(){
    	return {
            xtype     : 'rallybutton',
            text      : 'Cancel',
            scope: this,
            handler      : this._cancel
        }
    },

    _getDetailFieldsComponentBox: function(){
		return {
				xtype: 'container',
				itemId: 'detail-container'
		};

    },
    _getProcessFieldComponent: function(rec){
    	this.logger.log('_getProcessFieldComponent', rec);
    	
    	if (this.processDefinition.isNew()){
    		return {};
    	}
    	var field_value = rec.get(this.processDefinition.rallyField);
    	var field = rec.getField(this.processDefinition.rallyField)
    	
    	var component = this._getFieldComponent(field, field_value);
    	component['scope'] = this;
    	if (component.xtype == 'rallycheckboxfield'){
        	component['handler'] = this._processFieldChanged;
    	} else { //Dropdown list
        	component['listeners'] = {
                	scope: this,
                	change: this._processFieldChanged
                };
    	}
    	return component;
    },
    _processFieldChanged: function(ctl, val){
    	this.logger.log('_processFieldChanged',ctl, ctl.getValue());
    	this.down('#detail-container').removeAll();
    	this.down('#message_box').update('');

    	var detail_fields = this.processDefinition.getTriggeredProcessFields(ctl.value.toString());
    	this.record.set(this.processDefinition.rallyField,ctl.getValue());
    	
    	Ext.each(detail_fields, function(df){
    		this.logger.log('_processFieldChanged => detail_field', df);
        	var field_obj = this.record.getField(df);
        	var field_val = this.record.get(df);
        	var detail_component = this._getFieldComponent(field_obj, field_val);
    		this.down('#detail-container').add(detail_component);
    	}, this);
    },
    _buildDetailFields: function(detail_fields){
    	this.down('#detail-container').removeAll();
    	this.down('#message_box').update('');

    	Ext.each(detail_fields, function(df){
    		this.logger.log('_buildDetailFields => detail_field', df);
        	var field_obj = this.record.getField(df);
        	var field_val = this.record.get(df);
        	var detail_component = this._getFieldComponent(field_obj, field_val);
    		this.down('#detail-container').add(detail_component);
    	}, this);
    	
    },
    _getFieldComponent: function(field, val){
    	this.logger.log('_getFieldComponent',field.name, val, field.attributeDefinition.AttributeType);
     
    	var field_name = field.name;
    	if (field.attributeDefinition.Custom){
    		field_name = field_name.replace(/^c\_/,"");
    	}
    	
    	var component = {
       		 itemId: field_name,
       		 fieldLabel: field.displayName,
       		 labelWidth: 150,
       		 minWidth: 400
        };

    	//"BINARY_DATA", "BOOLEAN", "COLLECTION", "DATE", "DECIMAL", "INTEGER", "OBJECT", "QUANTITY", "RATING", "STATE", "STRING", "TEXT", "WEB_LINK", "RAW"
    	switch(field.attributeDefinition.AttributeType){
    		case 'BOOLEAN':  
    			component['xtype'] = 'rallycheckboxfield';
    			break;
    		case 'TEXT':
    			component['xtype'] = 'textareafield';
    			break;
    		case 'STRING':
    		case 'STATE':
    		case 'RATING':
    			console.log(field.attributeDefinition.AllowedValues);
    			if (field.attributeDefinition.AttributeType == 'RATING' || 
    					field.attributeDefinition.AllowedValues.length > 0){
    				component['xtype'] = 'rallyfieldvaluecombobox';
    				component['model'] = this.processDefinition.rallyType;
    				component['field'] = field.name;

    			} else {
    				component['xtype'] = 'textfield';
    			}
    			break;
    		case 'DATE':
    			component['xtype'] = 'rallydatefield';

    			break;
    		case 'DECIMAL':
    		case 'INTEGER':
    			component['xtype'] = 'rallynumberfield';
    			break;
    		case 'OBJECT':
    			//Release, Iteration, User, Project, artifact links
    			var schema = field.attributeDefinition.SchemaType;
    			console.log('schema',schema);
    			if (schema == 'Iteration') {
    				component['xtype'] = 'rallyiterationcombobox';
    				component['allowNoEntry'] = true;
    				if (val && val._ref){
        				val = val._ref;
    				}
    			} else if (schema == 'Release') {
    				component['xtype'] = 'rallyreleasecombobox';
    				component['allowNoEntry'] = true;

    				if (val && val._ref){
        				val = val._ref;
    				}
    			} else if (schema == 'User') {
    				component['xtype'] = 'rallyusersearchcombobox';
    				component['allowNoEntry'] = true;

    				component['project'] = this.projectRef;
    				if (val && val._ref){
        				val = val._ref;
    				}
    			} else if (schema == 'Project') {
    				component['xtype'] = 'rallyprojectpicker';
    				component['allowNoEntry'] = true;

    				val = this.projectRef;
    				
    			} else {
    				//This is a project or artifact link and shouldn't be changed.
    			}
    			break;
    		case 'QUANTITY':
   // 		case 'STATE':
    		case 'WEB_LINK':
    			
    		//These should not be options for this 
    		//case 'RATING':
    		case 'RAW':
    		case 'BINARY_DATA':
    		case 'COLLECTION':
    		default:
    			component['xtype'] = 'container';
    	}
         if (field.attributeDefinition.ReadOnly == true){
        //we need to do something with read only
         }
         this.logger.log('value', val);
        if (val && val.length > 0){
        	component['value'] = val;
        }
        return component;

    },
    _save: function(){
    	//validate
    	this.down('#message_box').update('');
    	var validated = false;
    	if (this.processDefinition.isNew()){
    		validated = this._validateNew();
    	} else {
    		validated = this._validate()
    	}
    	
    	if (validated) {
        	this.record.save();
        	this._cancel();
    	}
    },
    _validate: function(){
    	
    	var val = this.record.get(this.processDefinition.rallyField);
    	var validated = true;
    	Ext.each(this.down('#detail-container').items.items, function(item){
    		var validation_result = this.processDefinition.validate(item.itemId, item.value, val);
    		console.log(validation_result, validation_result.valid == false, item.itemId);
    		if (validation_result.valid == false){
    			validated = false;
    			this.down('#message_box').update('<font color="red">' + validation_result.message + '</font>');
    		} else {
        		this.record.set(item.itemId, item.value);
    		}
    	},this);
    	return validated;
    },
    _validateNew: function(){
    	this.logger.log('_validateNew');
    	var validated = true;
    	Ext.each(this.down('#detail-container').items.items, function(item){
    		var validation_result = this.processDefinition.validate(item.itemId, item.value);
    		if (validation_result.valid == false){
    			validated = false;
    			this.down('#message_box').update('<font color="red">' + validation_result.message + '</font>');
    		} else {
        		this.record.set(item.itemId, item.value);
    		}
    	},this);
    	return validated;
    	
    },
     _cancel: function(){
    	this.destroy();
    }
});