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
	
	function selectNoneDataView(){
		dataviewON.selectRange(-1,-1);
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
			enviarOrdenSeleccionados("enableInternet");
        },
        iconCls: 'done'
    });

    var internetOFF = new Ext.Action({
        text: 'Deshabilitar',
        handler: function(){
			enviarOrdenSeleccionados("disableInternet");
        },
        iconCls: 'cancel'
    });

    var mouseON = new Ext.Action({
        text: 'Habilitar',
        handler: function(){
			enviarOrdenSeleccionados("enableMouse");
        },
        iconCls: 'done'
    });

    var mouseOFF = new Ext.Action({
        text: 'Deshabilitar',
        handler: function(){
			enviarOrdenSeleccionados("disableMouse");
        },
        iconCls: 'cancel'
    });

    var messagesON = new Ext.Action({
        text: 'Habilitar',
        handler: function(){
			enviarOrdenSeleccionados("enableMessages");
        },
        iconCls: 'done'
    });

    var messagesOFF = new Ext.Action({
        text: 'Deshabilitar',
        handler: function(){
			enviarOrdenSeleccionados("disableMessages");
        },
        iconCls: 'cancel'
    });

    var soundON = new Ext.Action({
        text: 'Habilitar',
        handler: function(){
			enviarOrdenSeleccionados("enableSound");
        },
        iconCls: 'done'
    });

    var soundOFF = new Ext.Action({
        text: 'Deshabilitar',
        handler: function(){
			enviarOrdenSeleccionados("disableSound");
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
        tbar:[{
            xtype: 'buttongroup',
            columns: 2,
            defaults: {
                scale: 'small'
            },
	        items:[{
	            text: 'Selecc. Todo',
	            iconCls: 'all',
	            handler:selectAllDataView
	        },{
	            text: 'Encender',
	            iconCls: 'on',
	            handler:function(){
					enviarOrdenSeleccionados("wakeup");
	    	    },
	        },{
	            text: 'Selecc. Ninguno',
	            iconCls: 'none',
	            handler:selectNoneDataView
	        },{
	            text: 'Apagar',
	            iconCls: 'off',
	            handler:function(){
					enviarOrdenSeleccionados("sleep");
	    	    },
	        }]
        },{
            xtype: 'buttongroup',
            columns: 2,
            defaults: {
                scale: 'small'
            },
	        items:[{
				text: 'Internet',
	            iconCls: 'internet',
				menu: [internetON,internetOFF]
			},{
	            text: 'Altavoz',
	            iconCls: 'sound',
				menu: [soundON,soundOFF]
	        },{
				text: 'Ratón/Teclado',
	            iconCls: 'mouse',
				menu: [mouseON,mouseOFF]
			},{
				text: 'Mensajes',
	            iconCls: 'messages',
				menu: [messagesON,messagesOFF]
			}]
        }]
 	/*	tbar: ["->",{
            text: 'Selecc. Todo',
            iconCls: 'all',
            handler:selectAllDataView
        },'-',{
            xtype: 'buttongroup',
            title: 'Equipos',
            columns: 1,
            defaults: {
                scale: 'small'
            },
            items: [{
		        text: 'Encender',
		        iconCls: 'on',
		        handler:function(){
					enviarOrdenSeleccionados("wakeup");
			    },
            },{
		        text: 'Apagar',
		        iconCls: 'off',
		        handler:function(){
					enviarOrdenSeleccionados("sleep");
			    },
            }]
        },"-",{
            xtype: 'buttongroup',
            title: 'Internet',
            columns: 1,
            defaults: {
                scale: 'small'
            },
            items: [{
				text: 'Habilitar',
		        iconCls: 'done',
		        handler:function(){
					enviarOrdenSeleccionados("enableInternet");
			    },
            },{
				text: 'Deshabilitar',
		        iconCls: 'cancel',
		        handler:function(){
					enviarOrdenSeleccionados("disableInternet");
			    },
            }]
        },"-",{
            xtype: 'buttongroup',
            title: 'Ratón/Teclado',
            columns: 1,
            defaults: {
                scale: 'small'
            },
            items: [{
				text: 'Habilitar',
		        iconCls: 'done',
		        handler:function(){
					enviarOrdenSeleccionados("endabledMouse");
			    },
            },{
				text: 'Deshabilitar',
		        iconCls: 'cancel',
		        handler:function(){
					enviarOrdenSeleccionados("disableMouse");
			    },
            }]
		},"-",{
            xtype: 'buttongroup',
            title: 'Mensajes',
            columns: 1,
            defaults: {
                scale: 'small'
            },
            items: [{
				text: 'Habilitar',
		        iconCls: 'done',
		        handler:function(){
					enviarOrdenSeleccionados("enableMessages");
			    },
            },{
				text: 'Deshabilitar',
		        iconCls: 'cancel',
		        handler:function(){
					enviarOrdenSeleccionados("disableMessages");
			    },
            }]
		}]*/
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

	var structureClass = {
		id:"sctructureClass",
		cols: "",
		rows:""
	};

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
			drop:function(){
				
				//Tras mover el equipo, obtenemos la nueva configuracion del aula
				var classroom = { "pclist": []};
				var i=0;
				var j=0;

				//Recorremos Columnas y filas para crear el nuevo pclist				
				this.items.each(function(item,index,length){
					if(item.items.length>0){
						this.items.each(function(){									
							var pos = (parseInt(j)*parseInt(structureClass.cols))+parseInt(i);
							classroom.pclist[pos]=this.title;	
			                j++
		                });
						j=0;		                
						i++;	
					}
                });
				
				// Enviamos la nueva configuracion de los puestos al backend
				dataString = Ext.util.JSON.encode(classroom);				
				conexion("classroomConfig",dataString,"cambiaconfig");
			}
		},
	};
