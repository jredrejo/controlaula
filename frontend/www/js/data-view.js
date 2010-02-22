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
            '<div class="thumb-wrap" id="{position}">',
            '<span class="x-editable" style="background-color:#4e78b1; color:#dfe8f0; height:17px; padding-top:3px;">{pcName}</span>',
		    '<div class="thumb"><div style="float:right;">',
		    '<img src="{internet}" style="width:20px; height:20px;"><br>',
		    '<img src="{mouse}" style="padding-top:3px; width:20px; height:20px;"><br>',
		    '<img src="{message}" style="padding-top:0px; width:20px; height:20px;">',
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

		var seleccionados = Array();
		for(i=0;i<dataviewON.getSelectedRecords().length;i++){
			seleccionados[i] = dataviewON.getSelectedRecords()[i].get("pcname");
			var name = dataviewON.getSelectedRecords()[i].get("name")

			if(orden=="wakeup" && name=="Apagado"){
				var myMask = new Ext.LoadMask(dataviewON.getSelectedRecords()[i].get("position"), {msg:"Encendiendo"});
				myMask.show();
			}else if(orden=="sleep" && name!="Apagado" && name!="None"){
				var myMask = new Ext.LoadMask(dataviewON.getSelectedRecords()[i].get("position"), {msg:"Apagando"});
				myMask.show();
			}
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
           columnWidth: 0.6,
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

	var botonsDataview = {

         columnWidth: 0.4,
      //   xtype: 'fieldset',
         labelWidth: 90,
         //title:'',
         defaults: {width: 300, border:true},    // Default config options for child items
         defaultType: 'textfield',
         autoHeight: true,
         bodyStyle: Ext.isIE ? 'padding:0 0 5px 15px;' : 'padding:10px 15px;',
         border: false,
         style: {
             "margin-left": "10px", // when you add custom margin in IE 6...
             "margin-right": Ext.isIE6 ? (Ext.isStrict ? "-10px" : "-13px") : "0"  // you have to adjust for it somewhere else
         },
       items:[{
           xtype: 'buttongroup',
           columns: 2,
           defaults: {scale: 'small', padding:5},
			  title:'Equipos',
			  padding:5,
	        items:[{
			         text: 'Selecc. Todo',
			         iconCls: 'all',
						width:105,
						iconAlign:'top',
						tooltip:'Seleccionar todos los equipos del Aula',
			         handler:selectAllDataView
			     },{
			         text: 'Encender',
			         iconCls: 'on',
						width:105,
						iconAlign:'top',
						tooltip:'Encender los equipos seleccionados',
			         handler:function(){enviarOrdenSeleccionados("wakeup");}
			     },{
			         text: 'Selecc. Ninguno',
			         iconCls: 'none',
						width:105,
						iconAlign:'top',
						tooltip:'Deseleccionar todos los equipos del Aula',
			         handler:selectNoneDataView
			     },{
			         text: 'Apagar',
			         iconCls: 'off',
						width:105,
						iconAlign:'top',
						tooltip:'Apagar los equipos seleccionados',
			         handler:function(){enviarOrdenSeleccionados("sleep");}
			     }]
		     },{
		        xtype: 'buttongroup',
		        columns: 2,
		        defaults: { scale: 'small'},
			     title:'Acciones',
			  	  padding:5,
			     items:[
					 { text: 'Internet',iconAlign:'top', width:105, iconCls: 'internet', menu: [internetON,internetOFF]}
					,{ text: 'Altavoz',iconAlign:'top', width:105, iconCls: 'sound', menu: [soundON,soundOFF] }
					,{ text: 'Ratón/Teclado',iconAlign:'top', width:105, iconCls: 'mouse', menu: [mouseON,mouseOFF]}
					,{ text: 'Mensajes',iconAlign:'top', width:105, iconCls: 'messages', menu: [messagesON,messagesOFF]}
				  ]
		     }]
		}

//#########################################################################################################
//####################################### Parametros de los paneles #######################################
//#########################################################################################################



    var panel = new Ext.Panel({
        id:'images-view',
        frame:true,
        width:475,
        autoHeight:true,
     //   collapsible:true,
        layout:'column',
//        layout:'fit',
        title:'Encender/Apagar Equipos Aula (0 alumnos seleccionados)',
        items:[dataviewON,botonsDataview]
 /*       tbar:[{
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
        }]*/
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
