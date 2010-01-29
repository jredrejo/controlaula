/*!
 * Ext JS Library 3.1.0
 * Copyright(c) 2006-2009 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 */

Ext.onReady(function() {
	Ext.QuickTips.init();
    
    // create some portlet tools using built in Ext tool ids
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

    var viewport = new Ext.Viewport({
        layout:'fit',
        items:[{
            xtype: 'grouptabpanel',
    		tabWidth: 160,
    		activeGroup: 0,
    		items: [{
    			mainItem: 1,
    			items: [{
    				title: 'Encender/Apagar',
                    layout: 'fit',
                    iconCls: 'x-icon-tickets',
                    tabTip: 'Encender/Apagar equipos',
                    style: 'padding: 10px;',
					html:	"aquí colocamos equiposAlumnos.html"
    			}, 
                {
                    xtype: 'portal',
                    title: 'Equipos',
                    tabTip: 'Equipos del Aula',
                    items:[{
                        columnWidth:.16,
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
                    },{
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
                    },{
                        columnWidth:.16,
                        style:'padding:10px',
                        items:[{
                            title: 'Equipo 3',
                            layout:'fit',
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
                    },{
                        columnWidth:.16,
                        style:'padding:10px',
                        items:[{
                            title: 'Equipo 4',
                            layout:'fit',
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
                    },{
                        columnWidth:.16,
                        style:'padding:10px',
                        items:[{
                            title: 'Equipo 5',
                            layout:'fit',
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
                    },{
                        columnWidth:.16,
                        style:'padding:10px',
                        items:[{
                            title: 'Equipo 6',
                            layout:'fit',
                            tools: tools,
                            html: '<div style="text-align:center;"><img src="images/alumnos/alumno2.png" style="height:50px;"/></div>'
                        },{
                            title: 'Equipo 12',
                            tools: tools,
                            html: '<div style="text-align:center;"><img src="images/alumnos/alumno1.png" style="height:50px;"/></div>'
                        },{
                            title: 'Equipo 18',
                            tools: tools,
                            html: '<div style="text-align:center;"><img src="images/alumnos/alumno4.png" style="height:50px;"/></div>'
                        },{
                            title: 'Equipo 24',
                            tools: tools,
                            html: '<div style="text-align:center;"><img src="images/alumnos/alumno3.png" style="height:50px;"/></div>'
                        },{
                            title: 'Equipo 30',
                            tools: tools,
                            html: '<div style="text-align:center;"><img src="images/alumnos/alumno2.png" style="height:50px;"/></div>'
                        }]
                    }]                    
                }, {
    				title: 'Internet',
                    iconCls: 'x-icon-subscriptions',
                    tabTip: 'Habilitar/Deshabilitar Internet',
                    items:""              
    			}, {
    				title: 'Ratón/Teclado',
                    iconCls: 'x-icon-users',
                    tabTip: 'Habilitar/Deshabilitar Ratón/Teclado',
                    style: 'padding: 10px;',
                    items:""		
    			}]
            }, {
                expanded: true,
                items: [{
                    title: 'Opciones',
                    iconCls: 'x-icon-configuration',
                    tabTip: 'Opciones',
                    style: 'padding: 10px;',
                    html: "Menú de Opciones"
                }, {
                    title: 'Proyector',
                    iconCls: 'x-icon-templates',
                    tabTip: 'Proyector',
                    style: 'padding: 10px;',
                    html: "Aquí pondremos las opciones de Proyector"
                }, {
                    title: 'Emitir Video',
                    iconCls: 'x-icon-templates',
                    tabTip: 'Video',
                    style: 'padding: 10px;',
                    html: "Aquí pondremos las opciones de video"
                }, {
                    title: 'Gran Hermano',
                    iconCls: 'x-icon-templates',
                    tabTip: 'Gran Hermano',
                    style: 'padding: 10px;',
                    html: "Aquí pondremos las opciones de Gran Hermano"
                }, {
                    title: 'Enviar Fichero',
                    iconCls: 'x-icon-templates',
                    tabTip: 'Enviar Fichero',
                    style: 'padding: 10px;',
                    html: "Aquí pondremos las opciones de Enviar Fichero"
                }, {
                    title: 'Enviar Mensaje',
                    iconCls: 'x-icon-templates',
                    tabTip: 'Enviar Mensaje',
                    style: 'padding: 10px;',
                    html: "Aquí pondremos las opciones de Enviar Mensaje"
                }]
            },{
                expanded: true,
                items: [{
                    title: 'Navegación Web',
                    iconCls: 'x-icon-configuration',
                    tabTip: 'Navegación Web',
                    style: 'padding: 10px;',
                    html: "Menú de Navegación Web"
                }, {
                    title: 'Enviar Página',
                    iconCls: 'x-icon-templates',
                    tabTip: 'Enviar Página',
                    style: 'padding: 10px;',
                    html: "Aquí pondremos las opciones para enviar una página a los alumnos"
                }]
            },{
                expanded: true,
                items: [{
                    title: 'Configuracion',
                    iconCls: 'x-icon-configuration',
                    tabTip: 'Configuracion',
                    style: 'padding: 10px;',
                    html: "Menú de configuración"
                }, {
                    title: 'Aula',
                    iconCls: 'x-icon-templates',
                    tabTip: 'Configuración del Aula',
                    style: 'padding: 10px;',
                    html: "Aquí pondremos las opciones de configuración del Aula"
                }, {
                    title: 'Equipo',
                    iconCls: 'x-icon-templates',
                    tabTip: 'Configuración del Equipo',
                    style: 'padding: 10px;',
                    html: "Aquí pondremos las opciones de configuración del Equipo"
                }]
            }]
		}]
    });
});
