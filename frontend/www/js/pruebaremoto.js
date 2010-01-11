/*!
 * polling.js
 * Copyright(c) Juan Sanguino González
 * Licencia GNU/GPL
 */
var llamadaRemota = function(){
    Ext.Direct.addProvider(
        Ext.app.REMOTING_API,
        {
            type:'polling',
            url: '../cgi-bin/util2.py'
        }
    );

    var salida = new Ext.form.DisplayField({
        //cls: 'x-form-text',
        id: 'salida'
    });

	var p = new Ext.Panel({
	//	title: 'Log de la llamada Remota',
		height: 300,
		id: 'salida',
		bodyStyle:'font-size: .8em;',
		renderTo: 'sremoto',
		//layout:'fit',
		items: [salida]
	});
	

	 Ext.Direct.on('message', function(e){
        salida.append(String.format('<p><b>{0}</b></p>', e.data));
        		salida.el.scroll('b', 50000, true);
    });

}
