
	var iconProyector ={
			html:'<div style="text-align:center;"><img src="img/computer.png"></div>'}
	var AccnProyector = new Ext.Toolbar({
		width: 330,
		defaults: { bodyStyle: 'padding:30px;font-size: 30px',cls: 'boton'},
   	items : [{
         text:'Conectar',
         handler: function(){
				Ext.Msg.alert('Conectando', 'Preparado para modificar la codificación y pasar al backend');
         },
         },{
			  xtype: 'tbseparator'
			},{
			   xtype: 'tbfill'
			},{
			  xtype: 'tbseparator'
     	},{
         text:'Desconectar',
         handler: function(){
				Ext.Msg.alert('Conectando', 'Preparado para modificar la codificación y pasar al backend');
         }        
    	}]
   });

	var iconGranHermano ={
			html:'<div style="text-align:center;"><img src="img/computer.png"></div>'}
	var AccnGranHermano = new Ext.Toolbar({
		width: 330,
		defaults: { bodyStyle: 'padding:30px;font-size: 30px',cls: 'boton'},
   	items : [{
         text:'Conectar',
         handler: function(){
				Ext.Msg.alert('Conectando', 'Preparado para modificar la codificación y pasar al backend');
         },
         },{
			  xtype: 'tbseparator'
			},{
			   xtype: 'tbfill'
			},{
			  xtype: 'tbseparator'
     	},{
         text:'Desconectar',
         handler: function(){
				Ext.Msg.alert('Conectando', 'Preparado para modificar la codificación y pasar al backend');
         }        
    	}]
   });

	var iconAudioVideo ={
			html:'<div style="text-align:center;"><img src="img/computer.png"></div>'}
	var AccnAudioVideo = new Ext.Toolbar({
		width: 330,
		defaults: { bodyStyle: 'padding:30px;font-size: 30px',cls: 'boton'},
   	items : [{
         text:'Conectar',
         handler: function(){
				Ext.Msg.alert('Conectando', 'Preparado para modificar la codificación y pasar al backend');
         },
         },{
			  xtype: 'tbseparator'
			},{
			   xtype: 'tbfill'
			},{
			  xtype: 'tbseparator'
     	},{
         text:'Desconectar',
         handler: function(){
				Ext.Msg.alert('Conectando', 'Preparado para modificar la codificación y pasar al backend');
         }        
    	}]
   });

	var iconEnviarFichero ={
			html:'<div style="text-align:center;"><img src="img/computer.png"></div>'}
	var AccnEnviarFichero = new Ext.Toolbar({
		width: 330,
		defaults: { bodyStyle: 'padding:30px;font-size: 30px',cls: 'boton'},
   	items : [{
         text:'Conectar',
         handler: function(){
				Ext.Msg.alert('Conectando', 'Preparado para modificar la codificación y pasar al backend');
         },
         },{
			  xtype: 'tbseparator'
			},{
			   xtype: 'tbfill'
			},{
			  xtype: 'tbseparator'
     	},{
         text:'Desconectar',
         handler: function(){
				Ext.Msg.alert('Conectando', 'Preparado para modificar la codificación y pasar al backend');
         }        
    	}]
   });


	var iconEnviarMensaje ={
			html:'<div style="text-align:center;"><img src="img/computer.png"></div>'}
	var AccnEnviarMensaje = new Ext.Toolbar({
		width: 330,
		defaults: { bodyStyle: 'padding:30px;font-size: 30px',cls: 'boton'},
   	items : [{
         text:'Conectar',
         handler: function(){
				Ext.Msg.alert('Conectando', 'Preparado para modificar la codificación y pasar al backend');
         },
         },{
			  xtype: 'tbseparator'
			},{
			   xtype: 'tbfill'
			},{
			  xtype: 'tbseparator'
     	},{
         text:'Desconectar',
         handler: function(){
				Ext.Msg.alert('Conectando', 'Preparado para modificar la codificación y pasar al backend');
         }        
    	}]
   });

	var iconTrabajoGrupo ={
			html:'<div style="text-align:center;"><img src="img/computer.png"></div>'}
	var AccnTrabajoGrupo = new Ext.Toolbar({
		width: 330,
		defaults: { bodyStyle: 'padding:30px;font-size: 30px',cls: 'boton'},
   	items : [{
         text:'Conectar',
         handler: function(){
				Ext.Msg.alert('Conectando', 'Preparado para modificar la codificación y pasar al backend');
         },
         },{
			  xtype: 'tbseparator'
			},{
			   xtype: 'tbfill'
			},{
			  xtype: 'tbseparator'
     	},{
         text:'Desconectar',
         handler: function(){
				Ext.Msg.alert('Conectando', 'Preparado para modificar la codificación y pasar al backend');
         }        
    	}]
   });



	cfg1=new Ext.Panel({
		title:'Proyector',
		id:'proyector',
		html:'<div>Aquí puede ir una explicación de cómo se usa esta opción. </div>',
		items: [iconProyector,AccnProyector]	
	});

	cfg2=new Ext.Panel({
		title:'Gran Hermano',
		id:'granhermano',
		html:'<div>Aquí puede ir una explicación de cómo se usa esta opción. </div>',
		items: [iconGranHermano,AccnGranHermano]	
	});
	cfg3=new Ext.Panel({
		title:'Emitir vídeo/audio',
		id:'emitirvideo',
		html:'<div>Aquí puede ir una explicación de cómo se usa esta opción. </div>',
		items: [iconAudioVideo,AccnAudioVideo]	
	});
	cfg4=new Ext.Panel({
		title:'Enviar Fichero',
		id:'enviarfichero',
		html:'<div>Aquí puede ir una explicación de cómo se usa esta opción. </div>',
		items: [iconEnviarFichero,AccnEnviarFichero]	
	});
	cfg5=new Ext.Panel({
		title:'Enviar Mensaje',
		id:'enviarmensaje',
		html:'<div>Aquí puede ir una explicación de cómo se usa esta opción. </div>',
		items: [iconEnviarMensaje,AccnEnviarMensaje]	
	});
	cfg6=new Ext.Panel({
		title:'Trabajo en Grupo',
		id:'trabajogrupo',
		html:'<div>Aquí puede ir una explicación de cómo se usa esta opción. </div>',
		items: [iconTrabajoGrupo,AccnTrabajoGrupo]	
	});

