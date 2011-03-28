#!/usr/bin/env python
# -*- coding: utf-8 -*-
##############################################################################
# Project:     Controlaula/Monitor
# Module:     controlaula_vlc.py
# Purpose:     Broadcasting module interacting with vlc
# Language:    Python 2.5
# Date:        15-Mar-2011.
# Ver.:        15-Mar-2011.
# Copyright:    2009-2011 - José L. Redrejo Rodríguez       <jredrejo @nospam@ debian.org>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
# 
##############################################################################

import gtk
import sys
import ControlAula.Plugins.vlc as vlc
import subprocess
import os
import gobject


# Create a single vlc.Instance() to be share by (possible) multiple players.
instance=vlc.Instance()

class VLCWidget(gtk.DrawingArea):
    """Simple VLC widget.

    Its player can be controlled through the 'player' attribute, which
    is a vlc.MediaPlayer() instance.
    """
    def __init__(self, *p):
        gtk.DrawingArea.__init__(self)
        self.player=instance.media_player_new()
        def handle_embed(*args):
            if sys.platform == 'win32':
                self.player.set_hwnd(self.window.handle)
            else:
                self.player.set_xwindow(self.window.xid)
            return True
        self.connect("map-event", handle_embed)
        self.set_size_request(640, 400)

class DecoratedVLCWidget(gtk.VBox):
    """Decorated VLC widget.

    VLC widget decorated with a player control toolbar.

    Its player can be controlled through the 'player' attribute, which
    is a MediaControl instance.
    """
    def __init__(self, *p):
        gtk.VBox.__init__(self)
        self._vlc_widget=VLCWidget(*p)
        self.player=self._vlc_widget.player
        self.emitter=instance.media_player_new()
        self.pack_start(self._vlc_widget, expand=True)
        
        controls=gtk.HBox()
        
        adj2 = gtk.Adjustment(0.0, 0.0, 1.0, 0.001, 0.1, 0.0)
        adj2.connect("value_changed", self.digits_position)        
        self._position=gtk.HScale(adj2)
        self._position.set_draw_value(False)
        self._position.set_update_policy(gtk.UPDATE_DELAYED)
        controls.pack_start(self._position,expand=True)

        
        
        self._toolbar = self.get_player_control_toolbar()
        controls.pack_start(self._toolbar, expand=False)
        controls.set_homogeneous(False) 
        controls.set_spacing(10)
        
        self.pack_start(controls, expand=False)
        self._position.show()
             
    def digits_position(self,adj):
        self._position.set_digits(adj.value)    
        self.emitter.set_position(adj.value)
        
    def forward(self):
        position=self.emitter.get_position()
        new_position=position + 0.005
        if new_position > 1:new_position=1
        self.emitter.set_position(new_position)
        
    def rewind(self):
        position=self.emitter.get_position()
        new_position=position - 0.005
        if new_position < 0:new_position=0
        self.emitter.set_position(new_position)
        

    def get_player_control_toolbar(self):

        tb=gtk.HBox()

        tb_list = (
            (gtk.STOCK_MEDIA_PLAY, lambda b: self.emitter.play()),
            (gtk.STOCK_MEDIA_PAUSE, lambda b: self.emitter.pause()),
            #( gtk.STOCK_MEDIA_REWIND, lambda b: self.rewind()),     
            #( gtk.STOCK_MEDIA_FORWARD, lambda b: self.forward()),    
            ( gtk.STOCK_QUIT, lambda b: gtk.main_quit()),
            )

        for  stock, callback in tb_list:
            b=gtk.ToolButton(stock)
            b.connect("clicked", callback)
            tb.add(b)
        tb.show_all()

        return tb

class VideoPlayer:

    def __init__(self):
        self.vlc = DecoratedVLCWidget()
        self.port=str(7000+os.getuid())
        self.codec=self.is_h264_available()
        
    def is_h264_available(self):
        """ check if encoding with h264 is possible """
        guess=subprocess.Popen(["vlc","-l"],stdout=subprocess.PIPE)
        guess.wait()
        output=guess.communicate()[0]
        return 'x264' in output        

    def main(self, fname):

        if self.codec:
            command=":sout=#transcode{vcodec=h264,vb=128,fps=16,scale=1,acodec=mp4a,ab=32,channels=1,samplerate=44100}:http{mux=ts,dst=:"+ self.port + "/}"
            try:
                media=instance.media_new(fname,command,":sout-keep",":sout-all",":sout-x264-cabac",":sout-x264-qp=32",":sout-x264-keyint=50",":volume=1024")
                self.vlc.emitter.set_media(media)
            except:
                sys.exit(1)
        else:
            command=":sout=#rtp{dst=239.255.255.0,port=" + self.port + ",mux=ts}"
            try:
                media=instance.media_new(fname,command,":sout-keep",":sout-all",":volume=1024")
                self.vlc.emitter.set_media(media)            
            except:
                sys.exit(1)
        
        if self.codec:
            self.vlc.player.set_media(instance.media_new("http://localhost:" + self.port,":http-caching=10000"))
        else:
            self.vlc.player.set_media(instance.media_new("rtp://@239.255.255.0:"+ self.port,":rtp-caching=5000"))
        
        
        
        
        events = vlc.EventType

        manager = self.vlc.player.event_manager()
        #mediaManager = media.event_manager()
        manager.event_attach(events.MediaPlayerEncounteredError,self.vlc_error,None)
        manager.event_attach(events.VlmMediaInstanceStatusError,self.vlc_error,None)    
        
        self.popup()
        gobject.timeout_add(500, self.vlc.emitter.play)
        gobject.timeout_add(1000, self.vlc.player.play)

        gtk.main()
        
    @vlc.callbackmethod    
    def vlc_error(self,event,data):
        sys.exit(1)        

    def popup(self):
        w=gtk.Window()
        icon_file="/usr/share/pixmaps/controlaula.png"
        w.set_title("ControlAula")
        try:
            w.set_icon_from_file(icon_file)
        except:
            pass #icon file not available        
        w.add(self.vlc)
        w.show_all()
                
        w.connect("destroy", gtk.main_quit)
        return w


if __name__ == '__main__':
    if not sys.argv[1:]:
        print "You must provide at least 1 movie filename"
        sys.exit(1)
    if len(sys.argv[1:]) == 1:

        p=VideoPlayer()
        p.main(sys.argv[1])

