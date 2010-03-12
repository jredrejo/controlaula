/*!
 * Ext JS Library 3.1.0
 * Copyright(c) 2006-2009 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
var ImageChooser = function(config){
	this.config = config;
}

ImageChooser.prototype = {
    // cache data by image name for easy lookup
    lookup : {},

	show : function(el, callback){
//		if(!this.win){
			this.initTemplates();

			this.store = new Ext.data.JsonStore({
				proxy: new Ext.data.HttpProxy({
					url: this.config.url,
					method: 'POST'
				}),
			    root: 'images',
			    fields: [
			        'pcname', 'username', 'url',
			        {name:'lastmod', type:'date', dateFormat:'timestamp'}
			    ],
			    listeners: {
			    	'load': {fn:function(){ this.view.select(0); }, scope:this, single:true}
			    }
			});

			this.store.load();

			var formatSize = function(data){
		        if(data.size < 1024) {
		            return data.size + " bytes";
		        } else {
		            return (Math.round(((data.size*10) / 1024))/10) + " KB";
		        }
		    };

			var formatData = function(data){
		    	data.shortName = data.username.ellipse(15);
		    	data.sizeString = formatSize(data);
		    	data.dateString = new Date(data.lastmod).format("m/d/Y g:i a");
		    	this.lookup[data.username] = data;
		    	return data;
		    };

		    this.view = new Ext.DataView({
				tpl: this.thumbTemplate,
				singleSelect: true,
				overClass:'x-view-over',
				itemSelector: 'div.thumb-wrap',
				emptyText : '<div style="padding:10px;">No images match the specified filter</div>',
				store: this.store,
				listeners: {
					'selectionchange': {fn:this.showDetails, scope:this, buffer:100},
					'dblclick'       : {fn:this.doCallback, scope:this},
					'loadexception'  : {fn:this.onLoadException, scope:this},
					'beforeselect'   : {fn:function(view){
				        return view.store.getRange().length > 0;
				    }}
				},
				prepareData: formatData.createDelegate(this)
			});

			var cfg = {
		    	title: 'Gran Hermano',
		    	id: 'img-chooser-dlg',
		    	layout: 'border',
				minWidth: 500,
				minHeight: 300,
				modal: true,
				closeAction: 'hide',
				border: false,
				items:[{
					id: 'img-chooser-view',
					region: 'center',
					autoScroll: true,
					items: this.view,
/*                    tbar:[{
                    	text: 'Filter:'
                    },{
                    	xtype: 'textfield',
                    	id: 'filter',
                    	selectOnFocus: true,
                    	width: 100,
                    	listeners: {
                    		'render': {fn:function(){
						    	Ext.getCmp('filter').getEl().on('keyup', function(){
						    		this.filter();
						    	}, this, {buffer:500});
                    		}, scope:this}
                    	}
                    }, ' ', '-', {
                    	text: 'Sort By:'
                    }, {
                    	id: 'sortSelect',
                    	xtype: 'combo',
				        typeAhead: true,
				        triggerAction: 'all',
				        width: 100,
				        editable: false,
				        mode: 'local',
				        displayField: 'desc',
				        valueField: 'name',
				        lazyInit: false,
				        value: 'name',
				        store: new Ext.data.ArrayStore({
					        fields: ['name', 'desc'],
					        data : [['name', 'Name'],['size', 'File Size'],['lastmod', 'Last Modified']]
					    }),
					    listeners: {
							'select': {fn:this.sortImages, scope:this}
					    }
				    }]*/
				},{
					id: 'img-detail-panel',
					region: 'east',
					split: true,
					width: 150,
					minWidth: 150,
					maxWidth: 250
				}],
				buttons: [{
					text: 'Cerrar',
					handler: function(){ clearInterval(varInterval); this.win.hide(); },
					scope: this
				}],
				keys: {
					key: 27, // Esc key
					handler: function(){ clearInterval(varInterval); this.win.hide(); },
					scope: this
				}
			};
			Ext.apply(cfg, this.config);
		    this.win = new Ext.Window(cfg);
//		}

	//	this.reset();
	    this.win.show(el);
		this.callback = callback;
		this.animateTarget = el;
	},

	initTemplates : function(){
		this.thumbTemplate = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="thumb-wrap" id="{pcname}">',
				'<div class="thumb"><img src="{url}" title="{pcname}"></div>',
				'<span>{shortName}</span></div>',
			'</tpl>'
		);
		this.thumbTemplate.compile();

		this.detailsTemplate = new Ext.XTemplate(
			'<div class="details">',
				'<tpl for=".">',
					'<img src="{url}"><div class="details-info">',
					'<b>Equipo:</b>',
					'<span>{pcname}</span>',
					'<b>Usuario:</b>',
					'<span>{username}</span>',
					'<b>Último refresco:</b>',
					'<span>{dateString}</span></div>',
					'<div style="text-align:center;"><input type="button" onClick="conexion(\"openVNC\",\"{\'args\':{pcname}}\",\"\")" value="Abrir puesto {pcname}"></div>',
				'</tpl>',
			'</div>'
		);
		this.detailsTemplate.compile();
	},

	showDetails : function(){
	    var selNode = this.view.getSelectedNodes();
	    var detailEl = Ext.getCmp('img-detail-panel').body;
		if(selNode && selNode.length > 0){
			selNode = selNode[0];
			Ext.getCmp('ok-btn').enable();
		    var data = this.lookup[selNode.id];
            detailEl.hide();
            this.detailsTemplate.overwrite(detailEl, data);
            detailEl.slideIn('l', {stopFx:true,duration:.2});
		}else{
		    Ext.getCmp('ok-btn').disable();
		    detailEl.update('');
		}
	},

/*	filter : function(){
		var filter = Ext.getCmp('filter');
		this.view.store.filter('name', filter.getValue());
		this.view.select(0);
	},

	sortImages : function(){
		var v = Ext.getCmp('sortSelect').getValue();
    	this.view.store.sort(v, v == 'name' ? 'asc' : 'desc');
    	this.view.select(0);
    },

	reset : function(){
		if(this.win.rendered){
			Ext.getCmp('filter').reset();
			this.view.getEl().dom.scrollTop = 0;
		}
	    this.view.store.clearFilter();
		this.view.select(0);
	},*/

	doCallback : function(){
        var selNode = this.view.getSelectedNodes()[0];
		var callback = this.callback;
		var lookup = this.lookup;
		this.win.hide(this.animateTarget, function(){
            if(selNode && callback){
				var data = lookup[selNode.id];
				callback(data);
			}
		});
    },

	onLoadException : function(v,o){
	    this.view.getEl().update('<div style="padding:10px;">Error loading images.</div>');
	}
};

String.prototype.ellipse = function(maxLength){
    if(this.length > maxLength){
        return this.substr(0, maxLength-3) + '...';
    }
    return this;
};
