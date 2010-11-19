function printInterface(){
		$("#tabsComputers").tabs();
		$("#tabsActions").tabs();
		$("#tabsClassroom").tabs();

		$("#selectable").selectable();

		$("#sortable").sortable({
			stop: function(event, ui) { 
				sendClassroomConfig();
			}
		});

		$("#sortable").disableSelection();
}

function printSliders(){
		$("#sliderRows").slider({
			min: 1,
			max: 8,
			step: 1,
			slide: function(event, ui) {
				$("#rows").val(ui.value);
			},
			stop: function(event, ui) {
				setMaxComputers();
			}
		});

		$("#sliderColumns").slider({
			min: 1,
			max: 6,
			step: 1,
			slide: function(event, ui) {
				$("#columns").val(ui.value);
			},
			stop: function(event, ui) {
				setMaxComputers();
			}
		});

		$("#sliderComputers").slider({
			min: 1,
			max: 30,
			step: 1,
			slide: function(event, ui) {
				$("#computers").val(ui.value);
			}
		});
		$("#computers").val($("#sliderComputers").slider("value"));
}

function printClassroom(equipos){

	var class = eval('(' + equipos + ')');

	if(class.classroom.pclist.length==0)
		return;
//alert(class.classroom.structure.rows+" - "+class.classroom.structure.cols);

	setColsRows(class.classroom.structure.cols, class.classroom.structure.rows);   
	setComputers(class.classroom.structure.computers);

	//$('#selectable .ui-state-default').remove();

	for(var i=0;i<class.classroom.pclist.length;i++){

		var name = class.classroom.pclist[i].loginname;
		var photo = class.classroom.pclist[i].photo;
		var pcname = class.classroom.pclist[i].PCname;
		var internet=mouse=message="img/pcNone.png";
		
		if(class.classroom.pclist[i].PCname=="none"){
			pcname = "&nbsp;";
			name = "&nbsp;";
			photo = "img/pcNone.png";			
		}else if(class.classroom.pclist[i].ON=="0"){
			name = "Apagado";
			photo = "img/turnOff.png";
		}else if(class.classroom.pclist[i].loginname=="" && class.classroom.pclist[i].ON=="1"){
			name = "Login";
			photo = "img/turnOn.png";
		}

		if(class.classroom.pclist[i].internetEnabled=="1") internet="img/icon_web.png";
		if(class.classroom.pclist[i].mouseEnabled=="1") mouse="img/icon_mouse.png";
		if(class.classroom.pclist[i].messagesEnabled=="1") message="img/icon_messages.png";

		$('#selectable').append('<li class="ui-state-default" id="selectable-'+i+'"><div id="pcName">'+pcname+'</div><div style="float:right;"><img src="'+internet+'" style="width:20px; height:20px;"><br><img src="'+mouse+'" style="padding-top:3px; width:20px; height:20px;"><br><img src="'+message+'" style="padding-top:0px; width:20px; height:20px;"></div><img class="thumb-image" src="'+photo+'"/><div id="userName">'+name+'</div></li>');
		//$('#selectable').append('');
//		$('#selectable').append('');

		$('#sortable').append('<li class="ui-state-default" id="sortable-'+i+'"><div id="pcName">'+pcname+'</div><img class="thumb-image" src="'+photo+'"/><div id="userName">'+name+'</div></li>');
	}	
	lastPClist = class.classroom.pclist;
}

function refreshClassroom(equipos){
	var class = eval('(' + equipos + ')');

	if(class.classroom.pclist.length==0)
		return;

	//$('#selectable .ui-state-default').remove();

	for(var i=0;i<class.classroom.pclist.length;i++){

		var name = class.classroom.pclist[i].loginname;
		var photo = class.classroom.pclist[i].photo;
		var pcname = class.classroom.pclist[i].PCname;
		var internet=mouse=message="img/pcNone.png";
		
		if(class.classroom.pclist[i].PCname=="none"){
			pcname = "&nbsp;";
			name = "&nbsp;";
			photo = "img/pcNone.png";			
		}else if(class.classroom.pclist[i].ON=="0"){
			name = "Apagado";
			photo = "img/turnOff.png";
		}else if(class.classroom.pclist[i].loginname=="" && class.classroom.pclist[i].ON=="1"){
			name = "Login";
			photo = "img/turnOn.png";
		}

		if(class.classroom.pclist[i].internetEnabled=="1") internet="img/icon_web.png";
		if(class.classroom.pclist[i].mouseEnabled=="1") mouse="img/icon_mouse.png";
		if(class.classroom.pclist[i].messagesEnabled=="1") message="img/icon_messages.png";

		var refresh = '<img src="'+photo+'"/>'+name;

/*		if($('#selectable #selectable-'+i).html()!=refresh){
			$('#selectable #selectable-'+i).remove();
			$('#selectable').append('<li class="ui-state-default" id="selectable-'+i+'">'+refresh+'</li>');
		}*/
		$('#selectable #selectable-'+i).remove();
		$('#sortable #sortable-'+i).remove();

		$('#selectable').append('<li class="ui-state-default" id="selectable-'+i+'"><div id="pcName">'+pcname+'</div><div style="float:right;"><img src="'+internet+'" style="width:20px; height:20px;"><br><img src="'+mouse+'" style="padding-top:3px; width:20px; height:20px;"><br><img src="'+message+'" style="padding-top:0px; width:20px; height:20px;"></div><img class="thumb-image" src="'+photo+'"/><div id="userName">'+name+'</div></li>');

		$('#sortable').append('<li class="ui-state-default" id="sortable-'+i+'"><div id="pcName">'+pcname+'</div><img class="thumb-image" src="'+photo+'"/><div id="userName">'+name+'</div></li>');

	}
	lastPClist = class.classroom.pclist;
}

var computerSelected="";

function showCapture(element,computer){
	
	computerSelected = computer;

    $("#imageBigBrother").html("<img src='"+$('#thumbCapture_'+element).attr("src")+"' id='imageCoputer-"+computer+"'/><br><br><input type='button' value='Ver equipo' onClick='javascript:connection(\"openVNC\",\"{\\\"args\\\":\\\""+computer+"\\\"}\"   ,\"\");'>");
	$("#imageBigBrother").show("slide",{},500);
}

function refreshCapture(url){
	$("#imageCoputer-"+computerSelected).attr("src",url);
}


function printBigBrother(equipos){

	if(equipos.images.length==0)
		return;

	$('#selectableBigBrother li').remove();

	for(var i=0;i<equipos.images.length;i++){

		var name = equipos.images[i].name;
		var photo = equipos.images[i].url;
		var pcname = equipos.images[i].pcname;
		
		if(equipos.images[i].pcname=="Unknown"){
			pcname = "&nbsp;";
			name = "&nbsp;";
			photo = "img/pcNone.png";			
		}

		$('#selectableBigBrother').append('<li class="ui-state-default" id="selectable-'+i+'" onClick="showCapture(\''+i+'\',\''+pcname+'\');"><div id="pcName_'+i+'">'+pcname+'</div><img class="thumb-imageBigBrother" id="thumbCapture_'+i+'" src="'+photo+'"/><div id="userName_'+i+'">'+name+'</div></li>');
	}
}

function refreshBigBrother(equipos){

	if(equipos.images.length==0)
		return;

	for(var i=0;i<equipos.images.length;i++){

		var name = equipos.images[i].name;
		var photo = equipos.images[i].url;
		var pcname = equipos.images[i].pcname;
		
		if(equipos.images[i].pcname=="Unknown"){
			pcname = "&nbsp;";
			name = "&nbsp;";
			photo = "img/pcNone.png";			
		}else{
			if(pcname!=$('#pcName_'+i).val())
				$('#pcName_'+i).val(pcname)

			if(name!=$('#userName_'+i).val())
				$('#userName_'+i).val(name)

			if(photo!=$('#thumbCapture_'+i).val())
				$('#thumbCapture_'+i).attr("src",photo);

		}

		if(computerSelected==pcname)
			refreshCapture(photo);
	}
}
