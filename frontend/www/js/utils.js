/*
 * utils.js
 *
 * Copyright (c) 2009-2010 Manu Mora Gordillo <manuito @nospam@ gmail.com>
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */

var REFRESH_BIGBROTHER = 3000; /* in miliseconds*/
var REFRESH_CLASSROOM = 5000; /* in miliseconds*/


// Print DataView classroom
function printClassroom(equipos){

	var class = eval('(' + equipos + ')');
	var students = {"images":[]};
	var cols = class.classroom.structure.cols;
	var selected = dataviewON.getSelectedIndexes();

	if(class.classroom.pclist.length==0)
		return;

	for(var i=0;i<class.classroom.pclist.length;i++){

		var name = class.classroom.pclist[i].loginname;
		var photo = class.classroom.pclist[i].photo;
		var pcname = class.classroom.pclist[i].PCname;
		var internet=mouse=message="images/pc_none.png";
		
		if(class.classroom.pclist[i].PCname=="none"){
			pcname = "&nbsp;";
			name = "&nbsp;";
			photo = "images/pc_none.png";			
		}else if(class.classroom.pclist[i].ON=="0"){
			name = "Apagado";
			photo = "images/pc_apagado.png";
		}else if(class.classroom.pclist[i].loginname=="" && class.classroom.pclist[i].ON=="1"){
			name = "Login";
			photo = "images/pc_no_logueado.png";
		}

		if(class.classroom.pclist[i].internetEnabled=="1") internet="images/icon_web.png";
		if(class.classroom.pclist[i].mouseEnabled=="1") mouse="images/icon_mouse.png";
		if(class.classroom.pclist[i].messagesEnabled=="1") message="images/icon_messages.png";

		students.images[i]={"name":name,"url":photo,"pcname":pcname,"internet":internet,"mouse":mouse,"message":message,"position":"pos"+i}

/*		if(dataviewON.getNodes().length!=0)
			for(var key in students.images[i]){
				try{
					if(students.images[i][key] != dataviewON.store.getAt(i).get(key))
						dataviewON.store.getAt(i).set(key,students.images[i][key]);
				}catch(error){
					MyRecordType = Ext.data.Record.create(['name','url','pcname','internet','mouse','message','position']);
					myrec = new MyRecordType(students.images[i]);
					//ds.PartnersCombo.add(myrec);
					dataviewON.store.add(myrec);
				}
			}*/
	}	

//	if(dataviewON.getNodes().length==0){

		var myStore = new Ext.data.JsonStore({
			data: students,
			root: 'images',
			fields: ['name','url','pcname','internet','mouse','message','position']
		});
		dataviewON.setStore(myStore);
//	}

	var sizeDataview = 98*parseInt(cols);
	var sizePanel = 98*parseInt(cols)+280;
	dataviewON.setWidth(sizeDataview);
	panel.setWidth(sizePanel);

	dataviewON.select(selected);
}

// Print DataView classroom
function printClassroomConfig(computers){

	var class = eval('(' + computers + ')');

	structureClass.cols=class.classroom.structure.cols;
	structureClass.rows=class.classroom.structure.rows;
	
	var configClass = Ext.getCmp('config');
	configClass.removeAll();

	// Dynamic creation of columns
	for(i=0;i<class.classroom.structure.cols;i++){
		eval("var column"+i+"={id:'col"+i+"',columnWidth:.16,style:'padding:10px 0 10px 10px',items:[]}");
		eval("configClass.add("+i+",column"+i+")");
	}
	configClass.doLayout();
	
	// add computer to each column
   for(i=0;i<class.classroom.pclist.length;i++){
		
		var name = Ext.util.Format.ellipsis(class.classroom.pclist[i].loginname,15);
		var pcname = Ext.util.Format.ellipsis(class.classroom.pclist[i].PCname,15);
		var photo = class.classroom.pclist[i].photo;
		
		if(class.classroom.pclist[i].PCname=="none"){
			pcname = "&nbsp;";
			photo = "images/pc_none.png";			
			name="&nbsp;";
		}else if(class.classroom.pclist[i].ON=="0"){
			name="Apagado";
			photo = "images/pc_apagado.png";
		}else if(class.classroom.pclist[i].loginname=="" && class.classroom.pclist[i].ON=="1"){
			name = "Login";
			photo = "images/pc_no_logueado.png";
		}

	   var queColumna = parseInt(i) % parseInt(class.classroom.structure.cols);
	   var posicionEnColumna = parseInt(i) / parseInt(class.classroom.structure.cols);
		
		var computer={
			id: 'pc'+i,
	       	title: pcname,
	        tools: tools,
	        html: '<div style="text-align:center;"><img src="'+photo+'" style="height:50px;"/><br><b>'+name+'</b></div>'
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
	
	// add computer to each column
   for(i=0;i<structureClass.rows;i++){

		var name="Apagado";
		var photo = "images/pc_apagado.png";
		var pcname = "None";
			
		var computer={
//			id: 'pc'+i,
	        title: pcname,
	        tools: tools,
	        html: '<div style="text-align:center;"><img src="'+photo+'" style="height:50px;"/><br><b>'+name+'</b></div>'
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

	// add computer to each column
   for(i=0;i<numCol;i++){

		var name="Apagado";
		var photo = "images/pc_apagado.png";
		var pcname = "None";
			
		var computer={
			//id: 'pc'+i,
	        title: pcname,
	        tools: tools,
	        html: '<div style="text-align:center;"><img src="'+photo+'" style="height:50px;"/><br><b>'+name+'</b></div>'
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

	// add computer to each column
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
