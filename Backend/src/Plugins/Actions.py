##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:     Actions.py
# Purpose:     Several  simple actions to be executed by ControlAula
# Language:    Python 2.5
# Date:        17-Feb-2010.
# Ver:        17-Feb-2010.
# Author:    José L. Redrejo Rodríguez
# Copyright:   2010 - José L. Redrejo Rodríguez    <jredrejo @nospam@ debian.org>
#
# ControlAula is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# HMIServer is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# You should have received a copy of the GNU General Public License
# along with ControlAula. If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from twisted.internet.utils import getProcessValue

def setSound(value):
    '''value must be mute or unmute'''
    d=getProcessValue('amixer', ['-c','0','--','sset','Master',value])
    #'amixer -c 0 -- sset Master ' + value