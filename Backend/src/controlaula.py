#!/usr/bin/env python
# -*- coding: utf-8 -*-
from subprocess import call
from time import sleep
import sys

if __name__ == '__main__': 
    exitSignal=call(["python","/usr/share/controlaula/monitor.py"])
    while True:

        if exitSignal == 97:
            sleep(2.0)
            exitSignal=call(["python","/usr/share/controlaula/monitor.py"])
        else:
            sys.exit(0)