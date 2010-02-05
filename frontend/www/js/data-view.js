/*!
 * Ext JS Library 3.1.0
 * Copyright(c) 2006-2009 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 */


    var tpl = new Ext.XTemplate(
		'<tpl for=".">',
            '<div class="thumb-wrap" id="{name}">',
		    '<div class="thumb"><img src="{url}" title="{name}"></div>',
		    '<span class="x-editable">{shortName}</span></div>',
        '</tpl>',
        '<div class="x-clear"></div>'
	);

	var dataviewON = new Ext.DataView({
								tpl: tpl,
								autoHeight:true,
								multiSelect: true,
								overClass:'x-view-over',
								itemSelector:'div.thumb-wrap',
								emptyText: 'No images to display',

								plugins: [
									new Ext.DataView.DragSelector(),
									new Ext.DataView.LabelEditor({dataIndex: 'name'})
								],

								prepareData: function(data){
									data.shortName = Ext.util.Format.ellipsis(data.name, 15);
									return data;
								},
						
								listeners: {
									selectionchange: {
										fn: function(dv,nodes){
											var l = nodes.length;
											var s = l != 1 ? 's' : '';
											panel.setTitle('Encender/Apagar Equipos Aula ('+l+' alumno'+s+' seleccionado'+s+')');
										}
									}
								}
							});

	var dataviewNet = new Ext.DataView({
								tpl: tpl,
								autoHeight:true,
								multiSelect: true,
								overClass:'x-view-over',
								itemSelector:'div.thumb-wrap',
								emptyText: 'No images to display',

								plugins: [
									new Ext.DataView.DragSelector(),
									new Ext.DataView.LabelEditor({dataIndex: 'name'})
								],

								prepareData: function(data){
									data.shortName = Ext.util.Format.ellipsis(data.name, 15);
									return data;
								},
						
								listeners: {
									selectionchange: {
										fn: function(dv,nodes){
											var l = nodes.length;
											var s = l != 1 ? 's' : '';
											panel2.setTitle('Habilitar/Deshabilitar Internet ('+l+' alumno'+s+' seleccionado'+s+')');
										}
									}
								}
							});

	var dataviewMouse = new Ext.DataView({
								tpl: tpl,
								autoHeight:true,
								multiSelect: true,
								overClass:'x-view-over',
								itemSelector:'div.thumb-wrap',
								emptyText: 'No images to display',

								plugins: [
									new Ext.DataView.DragSelector(),
									new Ext.DataView.LabelEditor({dataIndex: 'name'})
								],

								prepareData: function(data){
									data.shortName = Ext.util.Format.ellipsis(data.name, 15);
									return data;
								},
						
								listeners: {
									selectionchange: {
										fn: function(dv,nodes){
											var l = nodes.length;
											var s = l != 1 ? 's' : '';
											panel3.setTitle('Habilitar/Deshabilitar Internet ('+l+' alumno'+s+' seleccionado'+s+')');
										}
									}
								}
							});

    var panel = new Ext.Panel({
        id:'images-view',
        frame:true,
        width:625,
        autoHeight:true,
        collapsible:true,
        layout:'fit',
        title:'Encender/Apagar Equipos Aula (0 alumnos seleccionados)',
        items: dataviewON
    });    

    var panel2 = new Ext.Panel({
        id:'images-view',
        frame:true,
        width:625,
        autoHeight:true,
        collapsible:true,
        layout:'fit',
        title:'Habilitar/Deshabilitar Internet (0 alumnos seleccionados)',
        items: dataviewNet
    });

    var panel3 = new Ext.Panel({
        id:'images-view',
        frame:true,
        width:625,
        autoHeight:true,
        collapsible:true,
        layout:'fit',
        title:'Habilitar/Deshabilitar Ratón/Teclado (0 alumnos seleccionados)',
        items: dataviewMouse
    });
