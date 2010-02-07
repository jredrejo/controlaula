/*!
 * Ext JS Library 3.1.0
 * Copyright(c) 2006-2009 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 */


//#########################################################################################################
//####################################### Parametros de DataView ##########################################
//#########################################################################################################

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
        width:475,
        autoHeight:true,
        collapsible:true,
        layout:'fit',
        title:'Encender/Apagar Equipos Aula (0 alumnos seleccionados)',
        items: dataviewON
    });    

    var panel2 = new Ext.Panel({
        id:'images-view',
        frame:true,
        width:475,
        autoHeight:true,
        collapsible:true,
        layout:'fit',
        title:'Habilitar/Deshabilitar Internet (0 alumnos seleccionados)',
        items: dataviewNet
    });

    var panel3 = new Ext.Panel({
        id:'images-view',
        frame:true,
        width:475,
        autoHeight:true,
        collapsible:true,
        layout:'fit',
        title:'Habilitar/Deshabilitar Ratón/Teclado (0 alumnos seleccionados)',
        items: dataviewMouse
    });


//#########################################################################################################
//####################################### Parametros de ConfigAula ########################################
//#########################################################################################################

    var tools = [{
        id:'gear',
        handler: function(){
            Ext.Msg.alert('Message', 'Opciones de configuracion.');
        }
    },{
        id:'close',
        handler: function(e, target, panel){
            panel.ownerCt.remove(panel, true);
        }
    }];

	var column1={
	   columnWidth:.16,
	   id:'col1',
	   style:'padding:10px 0 10px 10px',
	   items:[{
	       title: 'Equipo 1',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno1.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 7',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno4.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 13',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno3.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 19',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno2.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 25',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno1.png" style="height:50px;"/></div>'
	   }]
	};

	var column2={
      columnWidth:.16,
      style:'padding:10px 0 10px 10px',
      items:[{
          title: 'Equipo 2',
          layout:'fit',
          tools: tools,
          html: '<div style="text-align:center;"><img src="images/alumnos/alumno2.png" style="height:50px;"/></div>'
      },{
          title: 'Equipo 8',
          tools: tools,
          html: '<div style="text-align:center;"><img src="images/alumnos/alumno3.png" style="height:50px;"/></div>'
      },{
          title: 'Equipo 14',
          tools: tools,
          html: '<div style="text-align:center;"><img src="images/alumnos/alumno4.png" style="height:50px;"/></div>'
      },{
          title: 'Equipo 20',
          tools: tools,
          html: '<div style="text-align:center;"><img src="images/alumnos/alumno3.png" style="height:50px;"/></div>'
      },{
          title: 'Equipo 26',
          tools: tools,
          html: '<div style="text-align:center;"><img src="images/alumnos/alumno2.png" style="height:50px;"/></div>'
      }]
	};
	
	var column3={
	   columnWidth:.16,
       style:'padding:10px 0 10px 10px',
	   items:[{
	       title: 'Equipo 3',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno3.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 9',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno4.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 15',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno2.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 21',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno1.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 27',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno3.png" style="height:50px;"/></div>'
	   }]
	};
	    
	var column4={
	  columnWidth:.16,
       style:'padding:10px 0 10px 10px',
	   items:[{
	       title: 'Equipo 4',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno1.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 10',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno2.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 16',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno4.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 22',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno3.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 28',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno4.png" style="height:50px;"/></div>'
	   }]
	};
	   
	var column5={
	   columnWidth:.16,
       style:'padding:10px 0 10px 10px',
	   items:[{
	       title: 'Equipo 5',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno3.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 11',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno2.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 17',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno1.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 23',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno4.png" style="height:50px;"/></div>'
	   },{
	       title: 'Equipo 29',
	       tools: tools,
	       html: '<div style="text-align:center;"><img src="images/alumnos/alumno3.png" style="height:50px;"/></div>'
	   }]
	};    


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
		xtype: 'portal',
		id:'config',
		title: 'Configurar Aula',
		iconCls: 'x-icon-configuration',
		tabTip: 'Configurar el Aula',
		style: 'padding: 10px; ',
		items:[] 
	};
