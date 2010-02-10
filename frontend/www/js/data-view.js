/*
 * data-view.js
 *
 * Copyright (c) 2009-2010 Manu Mora Gordillo <manuito @nospam@ gmail.com>
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */


//#########################################################################################################
//####################################### Parametros de DataView ##########################################
//#########################################################################################################

    var tpl = new Ext.XTemplate(
		'<tpl for=".">',
            '<div class="thumb-wrap" id="{name}">',
            '<span class="x-editable" style="background-color:#4e78b1; color:#dfe8f0; height:17px;padding-top:3px;">{pcName}</span>',
		    '<div class="thumb"><img src="{url}" title="{name}"></div>',
		    '<span class="x-editable" style="font-weight:bold;">{shortName}</span></div>',
        '</tpl>',
        '<div class="x-clear"></div>'
	);

	function selectAllDataView(){
		dataviewON.selectRange(0,dataviewON.getNodes().length);
	}
	
	function enviarOrdenSeleccionados(orden,dataview){
		if(dataview.getSelectedRecords().length=="0"){
			Ext.Msg.alert('Atención', 'Debe seleccionar al menos un equipo.');
			return;
		}
		
		var seleccionados="";
		for(i=0;i<dataview.getSelectedRecords().length;i++){
			seleccionados+=dataview.getSelectedRecords()[i].get("pcname");
			
			if(i+1!=dataview.getSelectedRecords().length)
				seleccionados+=",";
		}	
		enviarOrdenPuestos(orden,seleccionados,"");
	}
	

	var dataviewON = new Ext.DataView({
								id:'dataviewON',
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
									data.pcName = Ext.util.Format.ellipsis(data.pcname, 15);
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
								id:'dataviewNet',
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
								id:'dataviewMouse',
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

//#########################################################################################################
//####################################### Parametros de los paneles #######################################
//#########################################################################################################

    var panel = new Ext.Panel({
        id:'images-view',
        frame:true,
        width:475,
        autoHeight:true,
        collapsible:true,
        layout:'fit',
        title:'Encender/Apagar Equipos Aula (0 alumnos seleccionados)',
        items: dataviewON,
        tbar:['->',{
            text: 'Seleccionar Todo',
            iconCls: 'all',
            handler:selectAllDataView
        },'-',{
            text: 'Encender',
            iconCls: 'on',
            handler:clickHandler.createDelegate(this, [], true)
        },'-',{
            text: 'Apagar',
            iconCls: 'off',
            handler:clickHandler.createDelegate(this, [], true)
        }]
    });    

    var panel2 = new Ext.Panel({
        id:'images-view',
        frame:true,
        width:475,
        autoHeight:true,
        collapsible:true,
        layout:'fit',
        title:'Habilitar/Deshabilitar Internet (0 alumnos seleccionados)',
        items: dataviewNet,
        tbar:['->',{
            text: 'Seleccionar Todo',
            iconCls: 'all',
            handler:selectAllDataView
        },'-',{
            text: 'Habilitar Internet',
            iconCls: 'on',
            handler:clickHandler.createDelegate(this, [], true)
        },'-',{
            text: 'Deshabilitar Internet',
            iconCls: 'off',
            handler:clickHandler.createDelegate(this, [], true)
        }]
    });

    var panel3 = new Ext.Panel({
        id:'images-view',
        frame:true,
        width:475,
        autoHeight:true,
        collapsible:true,
        layout:'fit',
        title:'Habilitar/Deshabilitar Ratón/Teclado (0 alumnos seleccionados)',
        items: dataviewMouse,
        tbar:['->',{
            text: 'Seleccionar Todo',
            iconCls: 'all',
            handler:selectAllDataView
        },'-',{
            text: 'Habilitar Ratón/Teclado',
            iconCls: 'on',
            handler:clickHandler.createDelegate(this, [], true)
        },'-',{
            text: 'Deshabilitar Ratón/Teclado',
            iconCls: 'off',
            handler:clickHandler.createDelegate(this, [], true)
        }]
    });

	function clickHandler(item, opts){
		switch(item.text){
			case 'Encender':{ enviarOrdenSeleccionados("wakeup",dataviewON); break; }
			case 'Apagar':{ enviarOrdenSeleccionados("sleep",dataviewON); break; }
			case 'Habilitar Internet':{ enviarOrdenSeleccionados("enableInternet",dataviewNet); break; }
			case 'Deshabilitar Internet':{ enviarOrdenSeleccionados("disableInternet",dataviewNet); break; }
			case 'Habilitar Ratón/Teclado':{ enviarOrdenSeleccionados("enableMouse",dataviewMouse); break; }
			case 'Deshabilitar Ratón/Teclado':{ enviarOrdenSeleccionados("disableMouse",dataviewMouse); break; }
		}
	}

//#########################################################################################################
//####################################### Parametros de ConfigAula ########################################
//#########################################################################################################

    var tools = [{
        id:'gear',
        handler: function(){
            Ext.Msg.alert('Message', 'Opciones de configuracion.');
        }
    }/*,{
        id:'close',
        handler: function(e, target, panel){
            panel.ownerCt.remove(panel, true);
        }
    }*/];

	var optEncender={
		xtype: 'portal',
		title: 'Encender/Apagar',
		iconCls: 'x-icon-tickets',
		style: 'padding: 10px;',
		items:[panel],
		html:"<div id='contenedor'></div>"
	};
	var optInternet={
		xtype: 'portal',
		title: 'Internet',
		iconCls: 'x-icon-subscriptions',
		tabTip: 'Habilitar/Deshabilitar Internet',
		style: 'padding: 10px;',
		items:[panel2]
	};
	
	var optRaton={
		xtype: 'portal',
		title: 'Ratón/Teclado',
		iconCls: 'x-icon-users',
		tabTip: 'Habilitar/Deshabilitar Ratón/Teclado',
		style: 'padding: 10px;',
		items:[panel3]          
	};
	var optConfigurar={
        id:'config',
		xtype: 'portal',
		title: 'Configurar Aula',
		iconCls: 'x-icon-configuration',
		tabTip: 'Configurar el Aula',
		style: 'padding: 10px; ',
		items:[]
//		html:"<div style='align:right'><input type='button' value='Guardar Configuracion'></div>"
	};
