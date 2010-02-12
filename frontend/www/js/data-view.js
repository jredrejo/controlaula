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
		    '<div class="thumb"><div style="float:right;">',
		    '<img src="{internet}" style="width:28px; height:28px;"><br>',
		    '<img src="{mouse}" style="padding-top:5px; width:28px; height:28px;"><br>',
		    '<img src="{message}" style="padding-top:1px; width:28px; height:28px;">',
		    '</div><img src="{url}" title="{name}"></div>',
		    '<span class="x-editable" style="font-weight:bold;">{shortName}</span></div>',
        '</tpl>',
        '<div class="x-clear"></div>'
	);

	function selectAllDataView(){
		dataviewON.selectRange(0,dataviewON.getNodes().length);
	}
	
	function enviarOrdenSeleccionados(orden){
		if(dataviewON.getSelectedRecords().length=="0"){
			Ext.Msg.alert('Atención', 'Debe seleccionar al menos un equipo.');
			return;
		}
		
		var seleccionados="";
		for(i=0;i<dataviewON.getSelectedRecords().length;i++){
			seleccionados+=dataviewON.getSelectedRecords()[i].get("pcname");
			
			if(i+1!=dataviewON.getSelectedRecords().length)
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
									//new Ext.DataView.LabelEditor({dataIndex: 'name'})
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
											panel.setTitle('Equipos Aula ('+l+' alumno'+s+' seleccionado'+s+')');
										}
									}
								}
							});



//#########################################################################################################
//####################################### Parametros de los paneles #######################################
//#########################################################################################################

    var internetON = new Ext.Action({
        text: 'Habilitar',
        handler: function(){
			enviarOrdenSeleccionados("enabledInternet");
        },
        iconCls: 'done'
    });

    var internetOFF = new Ext.Action({
        text: 'Deshabilitar',
        handler: function(){
			enviarOrdenSeleccionados("disabledInternet");
        },
        iconCls: 'cancel'
    });

    var mouseON = new Ext.Action({
        text: 'Habilitar',
        handler: function(){
			enviarOrdenSeleccionados("enabledMouse");
        },
        iconCls: 'done'
    });

    var mouseOFF = new Ext.Action({
        text: 'Deshabilitar',
        handler: function(){
			enviarOrdenSeleccionados("disabledMouse");
        },
        iconCls: 'cancel'
    });

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
            handler:function(){
				enviarOrdenSeleccionados("wakeup");
    	    },
        },'-',{
            text: 'Apagar',
            iconCls: 'off',
            handler:function(){
				enviarOrdenSeleccionados("sleep");
    	    },
        },'-',{
			text: 'Internet',
            iconCls: 'internet',
			menu: [internetON,internetOFF]
		},'-',{
			text: 'Ratón/Teclado',
            iconCls: 'mouse',
			menu: [mouseON,mouseOFF]
		}]
    });    


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
		title: 'Equipos',
		iconCls: 'x-icon-tickets',
		style: 'padding: 10px;',
		items:[panel],
		html:"<div id='contenedor'></div>"
	};

	var optConfigurar={
        id:'config',
		xtype: 'portal',
		title: 'Configurar Aula',
		iconCls: 'x-icon-configuration',
		tabTip: 'Configurar el Aula',
		style: 'padding: 10px; ',
		items:[],
    	listeners:{
			drop:function(portal){

		//		this.setSpacing(15);
			//	portal.setSpacing(15);
		//		optConfigurar.setSpacing(15);
				var configtmp = Ext.getCmp('config');
				alert(configtmp.items.length);
				var coltmp = Ext.getCmp('col3');

//				conexion("configClass","configurarAula","");
			}
		},
//		html:"<div style='align:right'><input type='button' value='Guardar Configuracion'></div>"	
	};
