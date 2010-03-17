/*!
 * Ext JS Library 3.1.1
 * Copyright(c) 2006-2010 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
var ImageChooser = function(config){
	this.config = config;
}

var selCapture;

ImageChooser.prototype = {
    // cache data by image name for easy lookup
    lookup : {},

	show : function(el, callback){
		if(!this.win){
			this.initTemplates();

			this.store = new Ext.data.JsonStore({
			   // url: this.config.url,
					proxy: new Ext.data.HttpProxy({
						url: this.config.url,
						method: 'POST'
					}),
			    root: 'images',
			    fields: ['pcname','name', 'url'],
			    listeners: {
			    	'load': {fn:function(){ this.view.select(0); }, scope:this, single:true}
			    }
			});
			this.store.load();

			var formatData = function(data){
				if(data.url=="")
					data.url="images/pc_none.png";

				if(data.name=="")
					data.shortName="&nbsp;";
				else
					data.shortName = data.name.ellipse(15);

				this.lookup[data.name] = data;
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
					'dblclick'       : {fn:this.openVPN, scope:this},
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
				minWidth: 700,
				minHeight: 300,
				width:700,
				modal: true,
				closeAction: 'hide',
				closable: false,
				border: false,
				listeners:{
					beforehide:function(){ clearInterval(varInterval); connection("disableBigBrother","",""); }
				},
				items:[{
					id: 'img-chooser-view',
					region: 'center',
					autoScroll: true,
					items: this.view,
				},{
					id: 'img-detail-panel',
					region: 'east',
					split: true,
					width: 350,
					minWidth: 350,
					maxWidth: 350
				}],
				buttons: [{
					text: 'Cerrar',
					handler: function(){ this.win.hide(); },
					scope: this
				}],
				keys: {
					key: 27, // Esc key
					handler: function(){ this.win.hide(); },
					scope: this
				}
			};
			Ext.apply(cfg, this.config);
		    this.win = new Ext.Window(cfg);
		}

	   this.win.show(el);
		this.callback = callback;
		this.animateTarget = el;
	},

	initTemplates : function(){
		this.thumbTemplate = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="thumb-wrap" id="{name}">',
            '<span style="background-color:#4e78b1; color:#dfe8f0; height:13px; padding-top:2px; margin-bottom:2px;">{pcname}</span>',
				'<div class="thumb"><img src="{url}" title="{name}"></div>',
				'<span>{shortName}</span></div>',
			'</tpl>'
		);
		this.thumbTemplate.compile();

		this.detailsTemplate = new Ext.XTemplate(
			'<div class="details">',
				'<tpl for=".">',
					'<img src="{url}" style="width:330px;"><div class="details-info">',
					'<span><b>Equipo:&nbsp;{pcname}</b></span>',
					'<span><b>Usuario:&nbsp;{name}</b></span></div>',
					'<div style="text-align:center;"><input type="button" onClick="sendOrderPC(\'openVNC\',\'{pcname}\',\'\')" value="Ver equipo"></div>',
				'</tpl>',
			'</div>'
		);
		this.detailsTemplate.compile();
	},

	reload : function(){
		this.store.load();
		this.updateDetails();
	},

	showDetails : function(){
	    var selNode = this.view.getSelectedNodes();
	    var detailEl = Ext.getCmp('img-detail-panel').body;
		if(selNode && selNode.length > 0){
			selNode = selCapture = selNode[0];
		   var data = this.lookup[selNode.id];
         detailEl.hide();
         this.detailsTemplate.overwrite(detailEl, data);
         detailEl.slideIn('l', {stopFx:true,duration:.2});
		}else{
		    //detailEl.update('');
		}
	},

	updateDetails : function(){
	      var detailEl = Ext.getCmp('img-detail-panel').body;
		   var data = this.lookup[selCapture.id];
         //detailEl.hide();
         this.detailsTemplate.overwrite(detailEl, data);
//         detailEl.slideIn('l', {stopFx:true,duration:.2});
	},

	openVPN : function(){
        var selNode = this.view.getSelectedNodes()[0];
		var data = this.lookup[selNode.id];
		if(data["pcname"]!="")
			sendOrderPC('openVNC',data["pcname"],'');
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
