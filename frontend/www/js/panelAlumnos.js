/*
 * panelAlumnos.js
 *
 * Copyright (c) 2009-2010 Juan Sanguino González
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */
  Ext.BLANK_IMAGE_URL = '../../resources/images/default/s.gif';
  Ext.ns('Dashboard');
  Dashboard.Portlet = Ext.extend(Ext.Panel, {
    //  anchor: '100%',
      frame: true,
      collapsible: true,
      draggable: true,
      cls: 'x-portlet',
      height: 80,
	tools : [{
              id: 'gear',
              handler: function() {
                  Ext.Msg.alert('Aviso', 'Pulsado el elemento de Configuración.<br>Esto debe disparar algún elemento del back-end');
              }
          }, {
              id: 'close',
              handler: function(e, target, panel) {
				panel.ownerCt.ownerCt.fireEvent('portletRemoved',panel);
                  panel.ownerCt.remove(panel, true);
              }
	}]
  });

  Ext.reg('portlet', Dashboard.Portlet);

  Dashboard.PortalColumn = Ext.extend(Ext.Container, {
      layout: 'anchor',
      autoEl: 'div',
      defaultType: 'portlet',
      cls: 'x-portal-column'
  });

  Ext.reg('portalcolumn', Dashboard.PortalColumn);

  Dashboard.Portal = function(config) {
      Dashboard.Portal.superclass.constructor.call(this, config);
      this.addEvents({ portletRemoved: true });
  }

  Dashboard.Portal = Ext.extend(Ext.Panel, {
      layout: 'column',
      autoScroll: true,
      cls: 'x-portal',
      defaultType: 'portalcolumn',
      initComponent: function() {
          Dashboard.Portal.superclass.initComponent.call(this);
          this.addEvents({
              validatedrop: true,
              beforedragover: true,
              dragover: true,
              beforedrop: true,
              drop: true
          });
      },
      insertPortlet: function(id, text) {				
          colIdx = 0;
         if (this.items.itemAt(0).items.length > this.items.itemAt(1).items.length) {
            colIdx = 1;
         }
         this.items.itemAt(colIdx).insert(0,{
              title: text, id: id
          });
          this.items.itemAt(colIdx).doLayout(true);
      },
      initEvents: function() {
          Dashboard.Portal.superclass.initEvents.call(this);
          this.dd = new Dashboard.Portal.DropZone(this, this.dropConfig);
      },

      beforeDestroy: function() {
          if (this.dd) {
              this.dd.unreg();
          }
          Dashboard.Portal.superclass.beforeDestroy.call(this);
      }
  });

  Ext.reg('portal', Dashboard.Portal);

  Dashboard.Portal.DropZone = function(portal, cfg) {
      this.portal = portal;
      Ext.dd.ScrollManager.register(portal.body);
      Dashboard.Portal.DropZone.superclass.constructor.call(this, portal.bwrap.dom, cfg);
      portal.body.ddScrollConfig = this.ddScrollConfig;
  };

  Ext.extend(Dashboard.Portal.DropZone, Ext.dd.DropTarget, {

      ddScrollConfig: {
          vthresh: 50,
          hthresh: -1,
          animate: true,
          increment: 200
      },

      createEvent: function(dd, e, data, col, c, pos) {
          return {
              portal: this.portal,
              panel: data.panel,
              columnIndex: col,
              column: c,
              position: pos,
              data: data,
              source: dd,
              rawEvent: e,
              status: this.dropAllowed
          };
      },

      notifyOver: function(dd, e, data) {

          var xy = e.getXY(), portal = this.portal, px = dd.proxy;

          // case column widths
          if (!this.grid) {
              this.grid = this.getGrid();
          }

          // handle case scroll where scrollbars appear during drag
          var cw = portal.body.dom.clientWidth;
          if (!this.lastCW) {
              this.lastCW = cw;
          } else if (this.lastCW != cw) {
              this.lastCW = cw;
              portal.doLayout();
              this.grid = this.getGrid();
          }

          // determine column
          var col = 0, xs = this.grid.columnX, cmatch = false;
          for (var len = xs.length; col < len; col++) {
              if (xy[0] < (xs[col].x + xs[col].w)) {
                  cmatch = true;
                  break;
              }
          }
          // no match, fix last index
          if (!cmatch) {
              col--;
          }

          // find insert position
          var p, match = false, pos = 0,
      c = portal.items.itemAt(col),
      items = c.items.items, overSelf = false;

          for (var len = items.length; pos < len; pos++) {
              p = items[pos];
              var h = p.el.getHeight();
              if (h === 0) {
                  overSelf = true;
              }
              else if ((p.el.getY() + (h / 2)) > xy[1]) {
                  match = true;
                  break;
              }
          }

          pos = (match && p ? pos : c.items.getCount()) + (overSelf ? -1 : 0);
          var overEvent = this.createEvent(dd, e, data, col, c, pos);

          if (portal.fireEvent('validatedrop', overEvent) !== false &&
     portal.fireEvent('beforedragover', overEvent) !== false) {

              // make sure proxy width is fluid
              px.getProxy().setWidth('auto');

              if (p) {
                  px.moveProxy(p.el.dom.parentNode, match ? p.el.dom : null);
              } else {
                  px.moveProxy(c.el.dom, null);
              }

              this.lastPos = { c: c, col: col, p: overSelf || (match && p) ? pos : false };
              this.scrollPos = portal.body.getScroll();

              portal.fireEvent('dragover', overEvent);

              return overEvent.status;
          } else {
              return overEvent.status;
          }

      },

      notifyOut: function() {
          delete this.grid;
      },

      notifyDrop: function(dd, e, data) {

          delete this.grid;
          if (!this.lastPos) {
              return;
          }
          var c = this.lastPos.c, col = this.lastPos.col, pos = this.lastPos.p;

          var dropEvent = this.createEvent(dd, e, data, col, c,
			pos !== false ? pos : c.items.getCount());

          if (this.portal.fireEvent('validatedrop', dropEvent) !== false &&
			this.portal.fireEvent('beforedrop', dropEvent) !== false) {

              dd.proxy.getProxy().remove();
              dd.panel.el.dom.parentNode.removeChild(dd.panel.el.dom);

              if (pos !== false) {
                  if (c == dd.panel.ownerCt && (c.items.items.indexOf(dd.panel) <= pos)) {
                      pos++;
                  }
                  c.insert(pos, dd.panel);
              } else {
                  c.add(dd.panel);
              }

              c.doLayout();

              this.portal.fireEvent('drop', dropEvent);

              // scroll position is lost on drop, fix it
              var st = this.scrollPos.top;
              if (st) {
                  var d = this.portal.body.dom;
                  setTimeout(function() {
                      d.scrollTop = st;
                  }, 10);
              }

          }
          delete this.lastPos;
      },

      // internal cache of body and column coords
      getGrid: function() {
          var box = this.portal.bwrap.getBox();
          box.columnX = [];
          this.portal.items.each(function(c) {
              box.columnX.push({ x: c.el.getX(), w: c.el.getWidth() });
          });
          return box;
      },

      // unregister the dropzone from ScrollManager
      unreg: function() {
          //Ext.dd.ScrollManager.unregister(this.portal.body);
          Dashboard.Portal.DropZone.superclass.unreg.call(this);
      }
  });


  Dashboard.PortletsCatalog = function() {
      Dashboard.PortletsCatalog.superclass.constructor.call(this, {
          root: new Ext.tree.TreeNode('Portlets'),
          region: 'west',
          id: 'portlets-catalog',
          title: 'Portlets Catalog',
          split: true,
          width: 200,
          minSize: 175,
          maxSize: 400,
          collapsible: true,
          rootVisible: false,
          lines: false,
          margins: '35 0 5 5',
          cmargins: '35 5 5 5',
          layoutConfig: {
              animate: true
          }
      });
     this.addEvents({insertPorletRequest:true});
  }
  
  Ext.extend(Dashboard.PortletsCatalog, Ext.tree.TreePanel, {

      addPortletNode: function(attrs, inactive, preventAnim) {
          var exists = this.getNodeById(attrs.id);
          if (exists) {
              if (!inactive) {
                  exists.select();
                  exists.ui.highlight();
              }
              return;
          }
          Ext.apply(attrs, {
              iconCls: 'x-portlet-node-icon',
              leaf: true,
              draggable: true
          });

          var node = new Ext.tree.TreeNode(attrs);
          this.root.appendChild(node);
          if (!inactive) {
              if (!preventAnim) {
                  Ext.fly(node.ui.elNode).slideIn('l', {
                      callback: node.select, scope: node, duration: .4
                  });
              } else {
                  node.select();
              }
          }
          return node;
      },
  	
     contextMenu: new Ext.menu.Menu({
        items: [{
	        id: 'add-portlet',
	        iconCls:'add-portlet-mnu',
	        text: 'Add to Portal'
        }],
        listeners: {
              itemclick: function(item) {
                  switch (item.id) {
                      case 'add-portlet':
                          var n = item.parentMenu.contextNode;
                          if (n.parentNode) {
                             n.getOwnerTree().fireEvent('insertPorletRequest',{id:n.id,text:n.text});
                             n.remove();
                          }
                          break;
                  }
              }
        }
     }),
  	
     listeners: {
        contextmenu: function(node, e) {
	        node.select();
	        var c = node.getOwnerTree().contextMenu;
	        c.contextNode = node;
	        c.showAt(e.getXY());
        }
     }

  });



          var portalPanel = new Dashboard.Portal({
              id: 'portal',
              region: 'center',
              margins: '35 5 5 0',
//
//Esta posición hay que sacarla a un fichero plano configurable y cargarla 
//luego aquí
//
              items: [{
              //  columnWidth: '60px',
                  style: 'padding:10px 0 10px 10px',
                  items: [{
                      title: 'Alumno 01:Nombre',
                      layout: 'fit',
                      id: 'alumno1'
                  }, {
                       title: 'Alumno 04:Nombre',
                       id: 'alumno4'    
                  }, {
                      title: 'Alumno 07:Nombre',
                      id: 'alumno7'
		        }]
		        }, {
                  style: 'padding:10px 10px 10px 10px',
                  items: [{
                  	title: 'Alumno 02:Nombre',
                     id: 'alumno2'
                     
                   }, {
                       title: 'Alumno 05:Nombre',
                       id: 'alumno5'
                  }, {
                  
 		               title: 'Alumno 08:Nombre',
                     id: 'alumno8'
			        }]
              }, {
                   	style: 'padding:10px 10px 10px 10px',
                   	items: [{
                       title: 'Alumno 03:Nombre',
                       id: 'alumno3'

                   }, {
                       title: 'Alumno 06:Nombre',
                       id: 'alumno6'
                   }, {
                       title: 'Alumno 09:Nombre',
                       id: 'alumno9'
			        }]
	        }]

          });

          var catalog = new Dashboard.PortletsCatalog();

          portalPanel.on('portletRemoved', function(panel){
              catalog.addPortletNode({
                  id: panel.id,
                  text: panel.title
              }, true);
          });
          var viewport = new Ext.Viewport({
              layout: 'border',
              items: [portalPanel]

          });
catalog.on('insertPorletRequest', function(portletConfig){
 portalPanel.insertPortlet(portletConfig.id, portletConfig.text);
});

          catalog.addPortletNode({
              id: 'portlet8',
              text: ' '
          }, true);
