/*
 * sections.js
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
		    '</div><div style="float:left; position:absolute;"><img src="images/icon_video.png" style="width:18px; height:18px;"></div><img src="{url}" title="{name}"></div>',
		    '<span class="x-editable" style="font-weight:bold;">{shortName}</span></div>',
        '</tpl>',
        '<div class="x-clear"></div>'
	);

	var dataviewON = new Ext.DataView({
								id:'dataviewON',
								tpl: tpl,
								autoHeight:true,
								multiSelect: true,
								overClass:'x-view-over',
								itemSelector:'div.thumb-wrap',
								emptyText: 'No images to display',
           					//columnWidth: 0.6,
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





/*	function inputFileOnChange() {
		var v_console = '';
		v_console += 'value: ' + document.getElementById('selectFileVideo').value;
		v_console += '<br \/>';
	
		if(document.getElementById('selectFileVideo').files) {
			// Support: nsIDOMFile, nsIDOMFileList
			v_console += 'files.length: ' + document.getElementById('selectFileVideo').files.length;
			v_console += '<br \/>';
		
			v_console += 'fileName: ' + document.getElementById('selectFileVideo').files.item(0).fileName;
			v_console += '<br \/>';
		
			v_console += 'fileSize: ' + document.getElementById('selectFileVideo').files.item(0).fileSize;
			v_console += '<br \/>';
		
			v_console += 'data: ' + document.getElementById('selectFileVideo').files.item(0).getAsDataURL();
			v_console += 'data: ' + document.getElementById('selectFileVideo').files.item(0).getAsBinary();
			v_console += 'data: ' + document.getElementById('selectFileVideo').files.item(0).getAsText();
			v_console += '<br \/>';
		};
	
		alert(v_console);
	};*/





    var broadcastOptions = new Ext.Panel({
        id:'main-panel',
        baseCls:'x-plain',
        layout:'table',
        layoutConfig: {columns:2},
        // applied to child components
        defaults: {frame:true, width:242, height: 285},
        items:[{
            title:'DVD',
			html:'<div style="text-align:center;"><br><br>Introduzca su DVD y pulse Emitir DVD.<br><br><a href="javascript:enviarOrdenSeleccionados(\'broadcast\',\'DVD\');"><img src="images/icon_dvd.png" style="border:0px;"><br><span style="font-weight:bold; color:black; text-decoration:none;">Emitir DVD</span></a></div>',
        },{
            title:'Fichero',
			html:'<div style="text-align:center; ">Seleccione el fichero y pulser Emitir Vídeo.<br><br><input type="file" id="selectFileVideo" size="10" class="x-form-text x-form-field"><br><br><a href="javascript:broadcastFileVideo();"><img src="images/icon_movie.png" style="border:0px;"><br><span style="font-weight:bold; color:black; text-decoration:none;">Emitir Vídeo</span></a></div>',
        }]
    });

    var win;

	function broadcastFileVideo(){
		if(document.getElementById("selectFileVideo").value.trim()==""){
			Ext.Msg.alert('Atención', 'Debe seleccionar un archivo de vídeo.');
			return;
		}
		enviarOrdenSeleccionados('broadcast',document.getElementById("selectFileVideo").value);
	}

	function broadcastWindow(){

		if(!win){
            win = new Ext.Window({
                applyTo:'selectBroadcast',
                layout:'fit',
                width:500,
                height:300,
                closeAction:'hide',
                plain: true,

				items:[broadcastOptions],

                buttons: [{
                    text: 'Cerrar',
                    handler: function(){
                        win.hide();
                    }
                }]
            });
        }
        win.show(this);
	}


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

    var projector = new Ext.Action({
        text: 'Proyector',
        iconCls: 'projector',
		width:105,
		iconAlign:'top',
        handler: function(){
			enviarOrdenSeleccionados("projector");
        },
    });

    var video = new Ext.Action({
        text: 'Video',
        iconCls: 'video',
		width:105,
		iconAlign:'top',
        handler: function(){
			broadcastWindow();
        },
    });

	var botonsDataview = {

        // columnWidth: 500,
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
					,projector
					,video]
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

    var tools = [/*{
        id:'gear',
        handler: function(){
            Ext.Msg.alert('Message', 'Opciones de configuracion.');
        }
    },*/{
        id:'close',
        handler: function(e, target, panel){
            Ext.Msg.confirm('Elminar equipo','¿Desea realmente eliminar el equipo?',function(result){
				if(result=="yes"){
					panel.setTitle("");
					panel.update('<div style="text-align:center;"><img src="images/pc_none.png" style="height:50px;"/><br><b>&nbsp;</b></div>');

					dataDelete = Ext.util.JSON.encode({ pclist:panel.id });	
					conexion("deleteComputer",dataDelete,"cambiaconfig");
				}
			})
        }
    }];

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
		html: '<div style="text-align:center;">Filas&nbsp;<input type="button" value="-" onClick="delRow();" style="width:25px;"/><input type="button" value="+" onClick="addRow();" style="width:25px;"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Columnas&nbsp;<input type="button" value="-" onClick="delColumn();" style="width:25px;"/><input type="button" value="+" onClick="addColumn();" style="width:25px;"/></div>',
    	listeners:{
			drop:function(){updateID(); sendClassroomConfig()},
			beforeShow:function(){conexion("datosaula",dataRefresh,"pintaconfig");}
		},
	};
