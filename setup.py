#!/usr/bin/env python
# -*- coding: utf-8 -*-

from distutils.core import setup
import os

datafiles = []

for root, dir, files in os.walk('frontend/www'):
    dir = []
    for file in files:
        dir.append(os.path.join(root, file))
    datafiles.append((os.path.join('share/controlaula', root), dir))

datafiles.append(('share/pixmaps',['controlaula.png']))
datafiles.append(('share/applications',['controlaula.desktop']))
datafiles.append(('/etc/xdg/autostart',['startcontrolaula.desktop']))

setup(name='ControlAula',
	version='1.5',
	description='Classroom management tool',
	long_description = """Really long text here.""",
	license='GPL v3 or later',
	author = 'José L. Redrejo Rodríguez and Manu Mora',
	author_email = 'jredrejo@debian.org',
	license = "GNU GPLv3",
    packages=['ControlAula','ControlAula.Plugins','ControlAula.Utils'],
	package_dir={'ControlAula': 'Backend/src/ControlAula'},
	url = 'http://www.itais.net/en/',
	# Those are going to be installed on /usr/bin/
	scripts=['Backend/src/monitor.py','Backend/src/sirvecole.py'],

	data_files=datafiles 
    )

