/*
 * utils.js
 *
 * Copyright (c) 2009-2010 Manu Mora Gordillo <manuito @nospam@ gmail.com>
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */


// pintar DataView de alumnos
function pintarDataView(equipos){

	var clase = eval('(' + equipos + ')');
	var alumnos = {"images":[]};
	var cols = clase.classroom.structure.cols;
	var seleccionados = dataviewON.getSelectedIndexes();

	if(clase.classroom.pclist.length==0)
		return;

	for(i=0;i<clase.classroom.pclist.length;i++){

		var nombre = clase.classroom.pclist[i].loginname;
		var foto = clase.classroom.pclist[i].photo;
		var pcname = clase.classroom.pclist[i].PCname;
		var internet=mouse=message="images/pc_none.png";
		
		if(clase.classroom.pclist[i].PCname=="none"){
			pcname = "&nbsp;";
			nombre = "&nbsp;";
			foto = "images/pc_none.png";			
		}else if(clase.classroom.pclist[i].ON=="0"){
			nombre = "Apagado";
			foto = "images/pc_apagado.png";
		}else if(clase.classroom.pclist[i].loginname=="" && clase.classroom.pclist[i].ON=="1"){
			nombre = "Login";
			foto = "images/pc_no_logueado.png";
		}

		if(clase.classroom.pclist[i].internetEnabled=="1") internet="images/icon_web.png";
		if(clase.classroom.pclist[i].mouseEnabled=="1") mouse="images/icon_mouse.png";
		if(clase.classroom.pclist[i].messagesEnabled=="1") message="images/icon_messages.png";

		alumnos.images[i]={"name":nombre,"url":foto,"pcname":pcname,"internet":internet,"mouse":mouse,"message":message,"position":"pos"+i}

		if(dataviewON.getNodes().length!=0)
			for(var key in alumnos.images[i]){
				if(alumnos.images[i][key] != dataviewON.store.getAt(i).get(key))
					dataviewON.store.getAt(i).set(key,alumnos.images[i][key]);
			}
	}	

	if(dataviewON.getNodes().length==0){

		var myStore = new Ext.data.JsonStore({
			data: alumnos,
			root: 'images',
			fields: ['name','url','pcname','internet','mouse','message','position']
		});

		var sizeDataview = 98*parseInt(cols);
		var sizePanel = 98*parseInt(cols)+300;

/*		if(parseInt(sizePanel)<470)
			sizePanel=470;*/

		dataviewON.setWidth(sizeDataview);
		panel.setWidth(sizePanel);
		dataviewON.setStore(myStore);
	}

	dataviewON.select(seleccionados);
}

// pintar pantalla de configuracion
function pintarConfiguracionAula(equipos){

	var clase = eval('(' + equipos + ')');

	structureClass.cols=clase.classroom.structure.cols;
	structureClass.rows=clase.classroom.structure.rows;
	
	var configClass = Ext.getCmp('config');
	configClass.removeAll();

	// creacion dinamica de columnas
	for(i=0;i<clase.classroom.structure.cols;i++){
		eval("var column"+i+"={id:'col"+i+"',columnWidth:.16,style:'padding:10px 0 10px 10px',items:[]}");
		eval("configClass.add("+i+",column"+i+")");
	}
	configClass.doLayout();
	
	// añadimos los equipos a cada columna
   for(i=0;i<clase.classroom.pclist.length;i++){
		
		var nombre = Ext.util.Format.ellipsis(clase.classroom.pclist[i].loginname,15);
		var pcname = Ext.util.Format.ellipsis(clase.classroom.pclist[i].PCname,15);
		var foto = clase.classroom.pclist[i].photo;
		
		if(clase.classroom.pclist[i].PCname=="none"){
			pcname = "&nbsp;";
			foto = "images/pc_none.png";			
			nombre="&nbsp;";
		}else if(clase.classroom.pclist[i].ON=="0"){
			nombre="Apagado";
			foto = "images/pc_apagado.png";
		}else if(clase.classroom.pclist[i].loginname=="" && clase.classroom.pclist[i].ON=="1"){
			nombre = "Login";
			foto = "images/pc_no_logueado.png";
		}

	   var queColumna = parseInt(i) % parseInt(clase.classroom.structure.cols);
	   var posicionEnColumna = parseInt(i) / parseInt(clase.classroom.structure.cols);
		
		var computer={
			id: 'pc'+i,
	       	title: pcname,
	        tools: tools,
	        html: '<div style="text-align:center;"><img src="'+foto+'" style="height:50px;"/><br><b>'+nombre+'</b></div>'
	   }
	   
	   eval("column"+parseInt(queColumna)+".items["+parseInt(posicionEnColumna)+"] = computer;");
		
	   var colTMP = Ext.getCmp('col'+parseInt(queColumna));
	   colTMP.add(computer);
	   colTMP.doLayout();
	}
}

function addColumn(){

	var configClass = Ext.getCmp('config');
	var numCol = parseInt(structureClass.cols);

	if(numCol==6){
		Ext.Msg.alert('Atención', 'Seis columnas como máximo.');
		return;
	}

	eval("var column"+numCol+"={id:'col"+numCol+"',columnWidth:.16,style:'padding:10px 0 10px 10px',items:[]}");
	eval("configClass.add("+numCol+",column"+numCol+")");
	configClass.doLayout();
	
	// añadimos los equipos a cada columna
   for(i=0;i<structureClass.rows;i++){

		var nombre="Apagado";
		var foto = "images/pc_apagado.png";
		var pcname = "None";
			
		var computer={
//			id: 'pc'+i,
	        title: pcname,
	        tools: tools,
	        html: '<div style="text-align:center;"><img src="'+foto+'" style="height:50px;"/><br><b>'+nombre+'</b></div>'
	   }
	   	
	   Ext.getCmp('col'+numCol).add(computer);
	   Ext.getCmp('col'+numCol).doLayout();
	}
	structureClass.cols+=1;
	updateID();
	sendClassroomConfig();
}

function delColumn(){
	var configClass = Ext.getCmp('config');
	var numCol = parseInt(structureClass.cols);

	if(numCol==1){
		Ext.Msg.alert('Atención', 'Una columna como mínimo.');
		return;
	}

	configClass.remove('col'+(numCol-1));
	configClass.doLayout();
	structureClass.cols-=1;
	updateID();
	sendClassroomConfig();
}

function addRow(){

	var numCol = parseInt(structureClass.cols);

	// añadimos los equipos a cada columna
   for(i=0;i<numCol;i++){

		var nombre="Apagado";
		var foto = "images/pc_apagado.png";
		var pcname = "None";
			
		var computer={
			//id: 'pc'+i,
	        title: pcname,
	        tools: tools,
	        html: '<div style="text-align:center;"><img src="'+foto+'" style="height:50px;"/><br><b>'+nombre+'</b></div>'
	   }
		
	   Ext.getCmp('col'+i).add(computer);
	   Ext.getCmp('col'+i).doLayout();
	}
	structureClass.rows+=1;
	updateID();
	sendClassroomConfig();
}

function delRow(){
	var configClass = Ext.getCmp('config');
	var numCol = parseInt(structureClass.cols);

	if(structureClass.rows==1){
		Ext.Msg.alert('Atención', 'Una fila como mínimo.');
		return;
	}

	// añadimos los equipos a cada columna
   for(i=0;i<numCol;i++){

	   var colTMP = Ext.getCmp('col'+i);
	   colTMP.remove(structureClass.rows-1);
	   colTMP.doLayout();
	}

	structureClass.rows-=1;
	updateID();
	sendClassroomConfig();
}

function updateID(){

	var i=0;
	var j=0;
	Ext.getCmp('config').items.each(function(item,index,length){
		if(item.items.length>0){
			this.items.each(function(){									
				var pos = (parseInt(j)*parseInt(structureClass.cols))+parseInt(i);
				this.id = "pc"+pos;
                j++
            });
			j=0;		                
			i++;	
		}
    });
}


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
		}else if(orden=="sleep" && name!="Apagado" && name!="&nbsp;"){
			var myMask = new Ext.LoadMask(dataviewON.getSelectedRecords()[i].get("position"), {msg:"Apagando"});
			myMask.show();
		}
	}	
	enviarOrdenPuestos(orden,seleccionados,"");
}

