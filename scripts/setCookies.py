from pysqlite2 import dbapi2 as sqlite
import getpass # Availability: Unix, Windows.


def getPathCookiesFirefox():
	path = "/home/"+getpass.getuser()+"/.mozilla/firefox/"
	
	with open(path+"profiles.ini") as f:
		for line in f:
			fields = line.partition("=")
			if(fields[0]=="Path")
				return path+fields[1]


def setCookieFirefox ():

	pathCookies = getPathCookiesFirefox()

	connection = sqlite.connect(pathCookies)
	#memoryConnection = sqlite.connect(':memory:')
	cursor = connection.cursor()

	cursor.execute("DELETE * FROM coockies WHERE name='controlaula.loginname='")
	connection.commit()

	cursor.execute("INSERT INTO coockies (id, name, value) VALUES (null,'controlaula.loginname','"+getpass.getuser()+"')");
	connection.commit()


def setCookieChrome ():

	connection = sqlite.connect("/home/"+getpass.getuser()+"/.config/google-chrome/Default/Cookies")
	#memoryConnection = sqlite.connect(':memory:')
	cursor = connection.cursor()

	cursor.execute("DELETE * FROM coockies WHERE name='controlaula.loginname='")
	connection.commit()

	cursor.execute("INSERT INTO coockies (id, name, value) VALUES (null,'controlaula.loginname','"+getpass.getuser()+"')");
	connection.commit()
