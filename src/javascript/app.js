Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    items: [
        {xtype:'container',itemId:'message_box',tpl:'Hello, <tpl>{_refObjectName}</tpl>'},
        {xtype:'container',itemId:'display_box'},
        {xtype:'tsinfolink'}
    ],
    
    launch: function() {
        
        var m_process_defintion = Ext.create('Rally.technicalservices.ProcessDefinition',{});
        
        this._loadAStoreWithAPromise(m_process_defintion.rallyType, m_process_defintion.getDisplayFields()).then({
            scope: this,
            success: function(store){
                this.down('#display_box').add({
                    xtype: 'rallygrid',
                    store: store,
                    enableBlockedReasonPopover: false,
                    columnCfgs: m_process_defintion.getColumnConfigurations()
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