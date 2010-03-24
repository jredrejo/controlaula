/*
 * mainPanel.js
 *
 * Copyright (c) 2009-2010 Manu Mora Gordillo <manuito @nospam@ gmail.com>
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */

var panel

Ext.onReady(function() {

    panel = new Ext.Panel({
        id:'images-view',
        frame:true,
        width:475,
        autoHeight:true,
     //   collapsible:true,
        layout:'column',
//        layout:'fit',
        title:'Encender/Apagar Equipos Aula (0 alumnos seleccionados)',
        items:[botonsDataview,dataviewON]
    }).render("mainDiv");  });
