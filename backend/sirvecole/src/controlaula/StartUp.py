##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula/Sirvecole
# Module:     StartUp.py
# Purpose:     Starting module for this daemon
# Language:    Python 2.5
# Date:        22-Dic-2009.
# Ver.:        22-Dic-2009.
# Copyright:    2009 - José L. Redrejo Rodríguez       <jredrejo @nospam@ debian.org>
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
# Important:    WHEN EDITING THIS FILE, USE TABS TO INDENT - NOT SPACES!
##############################################################################

import Internet, AvahiTeacher, Printer, RemoteOnOff
import signal,sys

def SigHandler(signum, frame):
    print 'Stopping Sirvecole'
    sys.exit()
                                                    
        
if __name__ == '__main__':
    
    # Initialise the signal handler.
    signal.signal(signal.SIGINT, SigHandler)  