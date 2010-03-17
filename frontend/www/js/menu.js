/*
 * menu.js
 *
 * Copyright (c) 2009-2010 Manu Mora Gordillo <manuito @nospam@ gmail.com>
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */

Ext.onReady(function() {

   var viewport = new Ext.Viewport({
        layout:'fit',
        items:[{
	        	xtype: 'grouptabpanel',
	    		tabWidth: 160,
	    		activeGroup: 0,
	    		items: [{
    				mainItem: 0,
    				items: [optEncender,optConfigurar,{
				     	title: 'Navegación Web',
				        iconCls: 'x-icon-templates',
				        tabTip: 'Navegación Web',
				        style: 'padding: 10px;',
//				        html: "<div>http://<input type='text' id='url' size='55' value='www.educarex.es'><input type='button' value='Ir' onClick='document.getElementById(\"frameweb\").src=\"http://\"+document.getElementById(\"url\").value;'>&nbsp;&nbsp;<input type='button' value='Enviar a los Alumnos' onClick='sendOrderAll(\"launchweb\",document.getElementById(\"url\").value,\"\");'></div><iframe id='frameweb' style='width:100%; height:100%' src='http://www.educarex.es'></iframe>"
				    },{
				        iconCls: 'x-icon-templates',
				        tabTip: 'Navegación Web',
				        style: 'padding: 10px;',
				    }]
            	}]
		}]
    });});
