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
		    '</div>',
			 //'<div style="float:left; position:absolute;"><img src="images/icon_video.png" style="width:18px; height:18px;"></div>',
			 '<img src="{url}" title="{name}"></div>',
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

   var Tree = Ext.tree;
   var tree = new Tree.TreePanel({
		    animate:true,
		    autoScroll:true,
		    loader: new Tree.TreeLoader({dataUrl:'getVideoNodes'}),
		    containerScroll: true,
		    border: false,
		    height: 300,
		    width: 300,
			 listeners: {
					render: function(){ this.getRootNode().expand(); }
			 },
			root:{ text: 'Directorio Personal',
					 draggable:false, // disable root node dragging
					 id:'home'
			}
		});
   new Tree.TreeSorter(tree, {folderSort:true});

   var treeSendFile = new Tree.TreePanel({
		    animate:true,
		    autoScroll:true,
		    loader: new Tree.TreeLoader({dataUrl:'getAllNodes'}),
		    containerScroll: true,
		    border: false,
		    height: 300,
		    width: 300,
			 listeners: {
					render: function(){ this.getRootNode().expand(); }
			 },
			root:{ text: 'Directorio Personal',
					 draggable:false, // disable root node dragging
					 id:'home'
			}
		});
   new Tree.TreeSorter(treeSendFile, {folderSort:true});

   var win, win2, win3;

	function openWindow(type){

			switch(type){
				case 'fileBrowserVideo':{
					if(!win){
						tree.render('tree');
						tree.bodyFocus.fi.setFrameEl(tree.el);
						tree.getSelectionModel().select(tree.getRootNode());
						tree.enter.defer(100, tree);

						win = new Ext.Window({
						    applyTo:'broadcastFile',
						    layout:'fit',
						    width:609,
						    height:300,
						    closeAction:'hide',
						    plain: true,

							items:[tree],

						    buttons: [{
						        text: 'Emitir a seleccionados',
								width:130,
						        handler: function(){ enviarOrdenSeleccionados('broadcast',tree.getSelectionModel().getSelectedNode().id,"broadcastVideo");}
						    },{
						        text: 'Emitir a todos',
								width:130,
						        handler: function(){ enviarOrdenTodos('broadcast',tree.getSelectionModel().getSelectedNode().id,"broadcastVideo");}
						    },{
						        text: 'Cerrar',
						        handler: function(){ win.hide();}
						    }]
						});
					}
			      win.show(this);
					break;
				}
				case 'dvd':{
					if(!win2){
						win2 = new Ext.Window({
						    applyTo:'broadcastDVD',
						    layout:'fit',
						    width:609,
						    height:300,
						    closeAction:'hide',
						    plain: true,
							html:'<div style="text-align:center;"><br><br>Introduzca su DVD y pulse Emitir.<br><br><img src="images/icon_dvd_128.png" style="border:0px;"></div>',

						    buttons: [{
						        text: 'Emitir a seleccionados',
								width:130,
						        handler: function(){ enviarOrdenSeleccionados('broadcast','DVD','broadcastVideo'); }
						    },{
						        text: 'Emitir a todos',
								width:130,
						        handler: function(){ enviarOrdenTodos('broadcast','DVD','broadcastVideo'); }
						    },{
						        text: 'Cerrar',
						        handler: function(){ win2.hide();}
						    }]
						});
					}
			      win2.show(this);
					break;
				}
				case 'fileBrowserAll':{
					treeSendFile.render('treeSendFile');
					treeSendFile.bodyFocus.fi.setFrameEl(treeSendFile.el);
				   treeSendFile.getSelectionModel().select(treeSendFile.getRootNode());
				   treeSendFile.enter.defer(100, treeSendFile);

					if(!win3){
						win3 = new Ext.Window({
									 applyTo:'windowSendFile',
									 layout:'fit',
									 width:609,
									 height:300,
									 closeAction:'hide',
									 plain: true,

									items:[treeSendFile],

									 buttons: [{
										  text: 'Enviar a seleccionados',
										width:130,
										  handler: function(){ enviarOrdenSeleccionados('sendfile',treeSendFile.getSelectionModel().getSelectedNode().id,"broadcastVideo");}
									 },{
										  text: 'Enviar a todos',
										width:130,
										  handler: function(){ enviarOrdenTodos('sendfile',treeSendFile.getSelectionModel().getSelectedNode().id,"broadcastVideo");}
									 },{
										  text: 'Cerrar',
										  handler: function(){ win3.hide();}
									 }]
								});
					}
					win3.show(this);
					break;
				}
			}
	}

   var internetON = new Ext.Action({
        text: 'Habilitar',
        handler: function(){
			enviarOrdenSeleccionados("enableInternet","","cambiaconfig");
        },
        iconCls: 'done'
    });

    var internetOFF = new Ext.Action({
        text: 'Deshabilitar',
        handler: function(){
			enviarOrdenSeleccionados("disableInternet","","cambiaconfig");
        },
        iconCls: 'cancel'
    });

    var mouseON = new Ext.Action({
        text: 'Habilitar',
        handler: function(){
			enviarOrdenSeleccionados("enableMouse","","cambiaconfig");
        },
        iconCls: 'done'
    });

    var mouseOFF = new Ext.Action({
        text: 'Deshabilitar',
        handler: function(){
			enviarOrdenSeleccionados("disableMouse","","cambiaconfig");
        },
        iconCls: 'cancel'
    });

    var messagesON = new Ext.Action({
        text: 'Habilitar',
        handler: function(){
			enviarOrdenSeleccionados("enableMessages","","cambiaconfig");
        },
        iconCls: 'done'
    });

    var messagesOFF = new Ext.Action({
        text: 'Deshabilitar',
        handler: function(){
			enviarOrdenSeleccionados("disableMessages","","cambiaconfig");
        },
        iconCls: 'cancel'
    });

    var soundON = new Ext.Action({
        text: 'Habilitar',
        handler: function(){
			enviarOrdenSeleccionados("enableSound","","cambiaconfig");
        },
        iconCls: 'done'
    });

    var soundOFF = new Ext.Action({
        text: 'Deshabilitar',
        handler: function(){
			enviarOrdenSeleccionados("disableSound","","cambiaconfig");
        },
        iconCls: 'cancel'
    });

    var projector = new Ext.Action({
        text: 'Proyector',
        iconCls: 'projector',
		  width:105,
		  iconAlign:'top',
        handler: function(){
			enviarOrdenSeleccionados("projector","","cambiaconfig");
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

    var videoDVD = new Ext.Action({
        text: 'Emitir DVD',
        handler: function(){
			openWindow("dvd")
        },
        iconCls: 'dvd'
    });

    var videoFile = new Ext.Action({
        text: 'Emitir Archivo',
        handler: function(){
			openWindow("fileBrowserVideo")
        },
        iconCls: 'movie'
    });

    var sendMessage = new Ext.Action({
        text: 'Enviar Mensaje',
        iconCls: 'message',
		  width:105,
		  iconAlign:'top',
        handler: function(){
			sendMessageWindow();
        },
    });

    var sendFile = new Ext.Action({
        text: 'Enviar Fichero',
        iconCls: 'sendFile',
		  width:105,
		  iconAlign:'top',
        handler: function(){
			openWindow("fileBrowserAll");
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
			        handler:function(){enviarOrdenSeleccionados("wakeup","","cambiaconfig");}
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
			        handler:function(){enviarOrdenSeleccionados("sleep","","cambiaconfig");}
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
					,{ text: 'Video',iconAlign:'top', width:105, iconCls: 'video', menu: [videoDVD,videoFile]}
					,sendMessage
					,sendFile]
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
