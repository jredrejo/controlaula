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
			}
		});

		$("#sliderColumns").slider({
			min: 1,
			max: 5,
			step: 1,
			slide: function(event, ui) {
				$("#columns").val(ui.value);
			}
		});

		$("#sliderComputers").slider({
			value:15,
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

		$('#selectable').append('<li class="ui-state-default" id="selectable-'+i+'"><div id="pcName">'+pcname+'</div><img class="thumb-image" src="'+photo+'"/><div id="userName">'+name+'</div></li>');
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

		$('#selectable').append('<li class="ui-state-default" id="selectable-'+i+'"><div id="pcName">'+pcname+'</div><img class="thumb-image" src="'+photo+'"/><div id="userName">'+name+'</div></li>');
		$('#sortable').append('<li class="ui-state-default" id="sortable-'+i+'"><div id="pcName">'+pcname+'</div><img class="thumb-image" src="'+photo+'"/><div id="userName">'+name+'</div></li>');

	}
	lastPClist = class.classroom.pclist;
}
