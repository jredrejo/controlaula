/*
 * grouptabs.js
 *
 * Copyright (c) 2009-2010 Manu Mora Gordillo <manuito @nospam@ gmail.com>
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */

Ext.onReady(function() {
	Ext.QuickTips.init();
	
    var viewport = new Ext.Viewport({
        layout:'fit',
        items:[{
	        	xtype: 'grouptabpanel',
	    		tabWidth: 160,
	    		activeGroup: 0,
	    		items: [{
    				mainItem: 1,
    				items: [optConfigurar,optEncender]
            },{
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
               html: "<div>http://<input type='text' id='url' size='55' value='www.educarex.es'><input type='button' value='Ir' onClick='document.getElementById(\"frameweb\").src=\"http://\"+document.getElementById(\"url\").value;'>&nbsp;&nbsp;<input type='button' value='Enviar a los Alumnos' onClick='enviarOrdenTodos(\"launchweb\",document.getElementById(\"url\").value);'></div><iframe id='frameweb' style='width:100%; height:100%' src='http://www.educarex.es'></iframe>"
           		}/*, {
            	title: 'Enviar Página',
               iconCls: 'x-icon-templates',
               tabTip: 'Enviar Página',
               style: 'padding: 10px;',
               html: "Aquí pondremos las opciones para enviar una página a los alumnos"
               }*/]
            },{
            expanded: true,
            items: [{
            	title: 'Configuracion',
               iconCls: 'x-icon-configuration',
               tabTip: 'Configuracion',
               style: 'padding: 10px;',
               html: "Menú de configuración"
               },{
               	title: 'Aula',
                  iconCls: 'x-icon-templates',
                  tabTip: 'Configuración del Aula',
                  style: 'padding: 10px;',
                  html: "Aquí pondremos las opciones de configuración del Aula"
                },{
                	title: 'Equipo',
                 	iconCls: 'x-icon-templates',
                  tabTip: 'Configuración del Equipo',
                  style: 'padding: 10px;',
                  html: "Aquí pondremos las opciones de configuración del Equipo"
                }]
            }]
		}]
    });
	estadoAula();
	estadoAulaConfig();
});
