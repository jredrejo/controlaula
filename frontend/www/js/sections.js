/*
 * sections.js
 *
 * Copyright (c) 2009-2010 Manu Mora Gordillo <manuito @nospam@ gmail.com>
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */

var web="http://rayuela.educarex.es";

Ext.ns('Ext.ux.form');
Ext.ux.form.SearchField = Ext.extend(Ext.form.TwinTriggerField, {
    initComponent : function(){
        Ext.ux.form.SearchField.superclass.initComponent.call(this);
        this.on('specialkey', function(f, e){
            if(e.getKey() == e.ENTER){
                this.onTrigger();
            }
        }, this);
    },

    validationEvent:false,
    validateOnBlur:false,
    trigger1Class:'x-form-clear-trigger',
    trigger2Class:'x-form-search-trigger',
    hideTrigger1:true,
    hasSearch : false,

    onTrigger : function(){
		document.getElementById("frameweb").src = web = "http://"+this.getRawValue();
    }
});

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
			id:"treeVideo",
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
			id:"treeFile",
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



    var chooser, btn, varInterval;

    function insertImage(data){
    	Ext.DomHelper.append('images', {
    		tag: 'img', src: data.url, style:'margin:10px;visibility:hidden;'
    	}, true).show(true).frame();
    	btn.focus();
    };

    function choose(){
    	if(!chooser){
    		chooser = new ImageChooser({
    			url:'getCaptures',
    			width:950,
    			height:500
    		});
    	}
    	chooser.show(document.getElementById("buttons"), insertImage);
		varInterval = setInterval("chooser.reload()",REFRESH_BIGBROTHER);
    };

   var maskWindow;
   var winSendVideo, winDVD, winSendFile, winSendMessage, winWeb, winConfig, winAbout;

	function openWindow(type){

			switch(type){
				case 'fileBrowserVideo':{
					if(!winSendVideo){
						tree.render('tree');
						tree.bodyFocus.fi.setFrameEl(tree.el);
						tree.getSelectionModel().select(tree.getRootNode());
						tree.enter.defer(100, tree);

						winSendVideo = new Ext.Window({
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
						        handler: function(){
							   		maskWindow = new Ext.LoadMask("treeVideo", {msg:"Emitiendo vídeo"});
									maskWindow.show();

									sendOrderSelected('broadcast',tree.getSelectionModel().getSelectedNode().id,"broadcastVideo");
								}
						    },{
						        text: 'Emitir a todos',
								width:130,
						        handler: function(){
									maskWindow = new Ext.LoadMask("treeVideo", {msg:"Emitiendo vídeo"});
									maskWindow.show();

									sendOrderAll('broadcast',tree.getSelectionModel().getSelectedNode().id,"broadcastVideo");
								}
						    },{
						        text: 'Cerrar',
						        handler: function(){ winSendVideo.hide();}
						    }]
						});
					}
			      winSendVideo.show(this);
				  break;
				}
				case 'dvd':{
					if(!winDVD){
						winDVD = new Ext.Window({
							id:'winDVD',
						    applyTo:'broadcastDVD',
						    layout:'fit',
						    width:609,
						    height:300,
						    closeAction:'hide',
						    plain: true,
							html:'<div style="text-align:center; height:100%;" id="idDVD"><br><br>Introduzca su DVD y pulse Emitir.<br><br><img src="images/icon_dvd_128.png" style="border:0px;"></div>',

						    buttons: [{
						        text: 'Emitir a seleccionados',
								width:130,
						        handler: function(){
									maskWindow = new Ext.LoadMask("idDVD", {msg:"Emitiendo DVD"});
									maskWindow.show();
									sendOrderSelected('broadcast','DVD','broadcastDVD'); 
								}
						    },{
						        text: 'Emitir a todos',
								width:130,
						        handler: function(){
									maskWindow = new Ext.LoadMask("idDVD", {msg:"Emitiendo DVD"});
									maskWindow.show();
									sendOrderAll('broadcast','DVD','broadcastDVD'); 
								}
						    },{
						        text: 'Cerrar',
						        handler: function(){ winDVD.hide();}
						    }]
						});
					}
			      winDVD.show(this);
				  break;
				}
				case 'fileBrowserAll':{
				   treeSendFile.render('treeSendFile');
				   treeSendFile.bodyFocus.fi.setFrameEl(treeSendFile.el);
				   treeSendFile.getSelectionModel().select(treeSendFile.getRootNode());
				   treeSendFile.enter.defer(100, treeSendFile);

					if(!winSendFile){
						winSendFile = new Ext.Window({
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
										handler: function(){
											maskWindow = new Ext.LoadMask("treeFile", {msg:"Enviando archivo"});
											maskWindow.show();
											sendOrderSelected('sendfile',treeSendFile.getSelectionModel().getSelectedNode().id,"sendFile");
										}
									 },{
										text: 'Enviar a todos',
										width:130,
										handler: function(){
											maskWindow = new Ext.LoadMask("treeFile", {msg:"Enviando archivo"});
											maskWindow.show();
											sendOrderAll('sendfile',treeSendFile.getSelectionModel().getSelectedNode().id,"sendFile");
										}
									 },{
										  text: 'Cerrar',
										  handler: function(){ winSendFile.hide();}
									 }]
								});
					}
					winSendFile.show(this);
					break;
				}
				case 'sendMessage':{
					if(!winSendMessage){
						var formSendMessage = new Ext.FormPanel({
													labelAlign: 'top',
													frame:true,
													bodyStyle:'padding:5px 5px 0',
													width: 600,
													items: [{
														items:[{
															layout: 'form',
															items: [{
																xtype:'textarea',
																fieldLabel: 'Mensaje',
																name: 'message',
																anchor:'100%'
															}]
														}]
													}],
												})

						winSendMessage = new Ext.Window({
									 applyTo:'windowSendMessage',
									 layout:'fit',
									 width:450,
									 height:180,
									 closeAction:'hide',
									 plain: true,
									 focus: Ext.emptyFn,

									 items:[formSendMessage],

									 buttons: [{
										text: 'Enviar a seleccionados',
										width:130,
										handler: function(){
											maskWindow = new Ext.LoadMask("windowSendMessage", {msg:"Enviando mensaje"});
											maskWindow.show();
											sendOrderSelected('sendmessage',formSendMessage.getForm().findField("message").getValue(),"sendMessage");
										}
									 },{
										text: 'Enviar a todos',
										width:130,
										handler: function(){
											maskWindow = new Ext.LoadMask("windowSendMessage", {msg:"Enviando mensaje"});
											maskWindow.show();
											sendOrderAll('sendmessage',formSendMessage.getForm().findField("message").getValue(),"sendMessage");
										}
									 },{
										  text: 'Cerrar',
										  handler: function(){ winSendMessage.hide();}
									 }]
								});
					}
					winSendMessage.show(this);
					break;
				}
				case 'web':{
					if(!winWeb){
						winWeb = new Ext.Window({
									 applyTo:'windowWeb',
									 layout:'fit',
									 width:1000,
									 height:650,
									 closeAction:'hide',
									 plain: true,
									 focus: Ext.emptyFn,

							         html: "<iframe id='frameweb' style='width:100%; height:100%' src='http://rayuela.educarex.es'></iframe>",
									 tbar: ['<b>Web:</b> ', ' http://',
										new Ext.ux.form.SearchField({
											width:320,
											value:"rayuela.educarex.es"
										})],
									 buttons: [{
										text: 'Enviar a seleccionados',
										width:130,
										handler: function(){
											sendOrderSelected('launchweb',document.getElementById("frameweb").src,"");
										}
									 },{
										text: 'Enviar a todos',
										width:130,
										handler: function(){
											sendOrderAll('launchweb',document.getElementById("frameweb").src,"");
										}
									 },{
										  text: 'Cerrar',
										  handler: function(){ winWeb.hide();}
									 }]
								});
					}
					winWeb.show(this);
					break;
				}
				case 'config':{
					if(!winConfig){
						winConfig = new Ext.Window({
									 applyTo:'windowConfig',
									 layout:'fit',
									 width:950,
									 height:650,
									 closeAction:'hide',
									 plain: true,
									 focus: Ext.emptyFn,
									 items:[optConfigurar],
									 tbar: ['<b>Filas:</b> ',
										{
										 xtype: 'tbbutton',
										 iconCls: 'remove',
										 handler:function(){delRow();}
										},{
										 xtype: 'tbbutton',
										 iconCls: 'add',
										 handler:function(){addRow();}
										},'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;','<b>Columnas:</b> ',{
										 xtype: 'tbbutton',
										 iconCls: 'remove',
										 handler:function(){delColumn();}
										},{
										 xtype: 'tbbutton',
										 iconCls: 'add',
										 handler:function(){addColumn();}
										},],
									 buttons: [{
										  text: 'Cerrar',
										  handler: function(){ winConfig.hide();}
									 }]
								});
					}
					connection("datosaula",dataRefresh,"pintaconfig");
					winConfig.show(this);
					break;
				}
				case 'about':{
					if(!winAbout){
						winAbout = new Ext.Window({
									 applyTo:'windowAbout',
									 layout:'fit',
									 width:600,
									 height:400,
									 closeAction:'hide',
									 plain: true,
									 html:'Aplicacion para Control del Aula. Licencia GPL. Autores: bla bla bla bla bla',
									 //items:[optConfigurar],
									 buttons: [{
										  text: 'Cerrar',
										  handler: function(){ winAbout.hide();}
									 }]
								});
					}
					winAbout.show(this);
					break;
				}
			}
	}

   var internetON = new Ext.Action({
        text: 'Habilitar',
        handler: function(){
			sendOrderSelected("enableInternet","","cambiaconfig");
        },
        iconCls: 'done'
    });

    var internetOFF = new Ext.Action({
        text: 'Deshabilitar',
        handler: function(){
			sendOrderSelected("disableInternet","","cambiaconfig");
        },
        iconCls: 'cancel'
    });

    var mouseON = new Ext.Action({
        text: 'Habilitar',
        handler: function(){
			sendOrderSelected("enableMouse","","cambiaconfig");
        },
        iconCls: 'done'
    });

    var mouseOFF = new Ext.Action({
        text: 'Deshabilitar',
        handler: function(){
			sendOrderSelected("disableMouse","","cambiaconfig");
        },
        iconCls: 'cancel'
    });

    var messagesON = new Ext.Action({
        text: 'Habilitar',
        handler: function(){
			sendOrderSelected("enableMessages","","cambiaconfig");
        },
        iconCls: 'done'
    });

    var messagesOFF = new Ext.Action({
        text: 'Deshabilitar',
        handler: function(){
			sendOrderSelected("disableMessages","","cambiaconfig");
        },
        iconCls: 'cancel'
    });

    var soundON = new Ext.Action({
        text: 'Habilitar',
        handler: function(){
			sendOrderSelected("enableSound","","cambiaconfig");
        },
        iconCls: 'done'
    });

    var soundOFF = new Ext.Action({
        text: 'Deshabilitar',
        handler: function(){
			sendOrderSelected("disableSound","","cambiaconfig");
        },
        iconCls: 'cancel'
    });

    var projectorON = new Ext.Action({
        text: 'Habilitar',
        handler: function(){
			sendOrderSelected("enableProjector","","cambiaconfig");
        },
        iconCls: 'done'
    });

    var projectorOFF = new Ext.Action({
        text: 'Deshabilitar',
        handler: function(){
			sendOrderSelected("disableProjector","","cambiaconfig");
        },
        iconCls: 'cancel'
    });

    var video = new Ext.Action({
        text: 'Video',
        iconCls: 'video',
		  width:110,
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
		  width:110,
		  iconAlign:'top',
        handler: function(){
			openWindow("sendMessage");
        },
    });

    var web = new Ext.Action({
        text: 'Navegación',
        iconCls: 'internet',
		  width:110,
		  iconAlign:'top',
        handler: function(){
			openWindow("web");
        },
    });

    var sendFile = new Ext.Action({
        text: 'Enviar Fichero',
        iconCls: 'sendFile',
		  width:110,
		  iconAlign:'top',
        handler: function(){
			openWindow("fileBrowserAll");
        },
    });

    var bigBrother = new Ext.Action({
        text: 'Gran Hermano',
        iconCls: 'eye',
		  width:110,
		  iconAlign:'top',
        handler: function(){
			choose();
        },
    });

    var configClassroom = new Ext.Action({
        text: 'Configurar Aula',
        iconCls: 'config',
		  width:110,
		  iconAlign:'top',
        handler: function(){
			openWindow("config");
        },
    });

    var about = new Ext.Action({
        text: 'Controlaula',
        iconCls: 'about',
		  width:110,
		  iconAlign:'top',
        handler: function(){
			openWindow("about");
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
					width:110,
					iconAlign:'top',
					tooltip:'Seleccionar todos los equipos del Aula',
			        handler:selectAllDataView
			     },{
					text: 'Encender',
			        iconCls: 'on',
					width:110,
					iconAlign:'top',
					tooltip:'Encender los equipos seleccionados',
			        handler:function(){sendOrderSelected("wakeup","","cambiaconfig");}
			     },{
			        text: 'Selecc. Ninguno',
			        iconCls: 'none',
					width:110,
					iconAlign:'top',
					tooltip:'Deseleccionar todos los equipos del Aula',
			        handler:selectNoneDataView
			     },{
			        text: 'Apagar',
			        iconCls: 'off',
					width:110,
					iconAlign:'top',
					tooltip:'Apagar los equipos seleccionados',
			        handler:function(){sendOrderSelected("sleep","","cambiaconfig");}
			     }]
		     },{
		        xtype: 'buttongroup',
		        columns: 2,
		        defaults: { scale: 'small'},
			     title:'Acciones',
			  	  padding:5,
			     items:[
					 { text: 'Internet',iconAlign:'top', width:110, iconCls: 'internet', menu: [internetON,internetOFF]}
					,{ text: 'Altavoz',iconAlign:'top', width:110, iconCls: 'sound', menu: [soundON,soundOFF] }
					,{ text: 'Ratón/Teclado',iconAlign:'top', width:110, iconCls: 'mouse', menu: [mouseON,mouseOFF]}
					,{ text: 'Mensajes',iconAlign:'top', width:110, iconCls: 'messages', menu: [messagesON,messagesOFF]}
					,{ text: 'Proyector',iconAlign:'top', width:110, iconCls: 'projector', menu: [projectorON,projectorOFF]}
					,{ text: 'Video',iconAlign:'top', width:110, iconCls: 'video', menu: [videoDVD,videoFile]}
					,sendMessage
					,sendFile
					,web
					,bigBrother
					,configClassroom
					,about]
		     }]
		}  


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
					connection("deleteComputer",dataDelete,"cambiaconfig");
				}
			})
        }
    }];

	var structureClass = {
		id:"sctructureClass",
		cols: "",
		rows:""
	};

	var optConfigurar={
		id:'config',
		xtype: 'portal',
		iconCls: 'x-icon-configuration',
		tabTip: 'Configurar el Aula',
		style: 'padding: 10px; ',
		items:[],
		//html: '<div style="text-align:center;">Filas&nbsp;<input type="button" value="-" onClick="delRow();" style="width:25px;"/><input type="button" value="+" onClick="addRow();" style="width:25px;"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Columnas&nbsp;<input type="button" value="-" onClick="delColumn();" style="width:25px;"/><input type="button" value="+" onClick="addColumn();" style="width:25px;"/></div>',
    	listeners:{
			drop:function(){updateID(); sendClassroomConfig()},
			beforeShow:function(){connection("datosaula",dataRefresh,"pintaconfig");}
		},
	};
