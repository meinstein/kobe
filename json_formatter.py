import csv
import time
import re
from json import dumps

csv_input = open('./data/csv/2015-16.csv', 'rU')
reader = csv.reader(csv_input)
next(reader, None) # skip headers
x = 0
output = []

for row in reader:

	playoffs = int(row[ 0 ])
	pts = int(row[ 27 ])
	rbs = int(row[ 21 ])
	ast = int(row[ 22 ])
	opp = row[ 6 ]
	date = row[ 2 ]
	order = int(row[ 1 ])

	# mp_array = row[ 9 ].split(':')
	# if int(mp_array[1]) >= 30:
	# 	mp = int(mp_array[0]) + 1
	# else:
	mp = int(row[ 9 ].split(':')[0]) 

	if not row[ 5 ]:
		away = 0
	else:
		away = 1

	print away
		
	dic = {"g":[pts,rbs,ast,mp,playoffs,date,away,opp,order]}
	output.append(dic)

json_output = open('./data/json/2015-16.json', 'w')
json_output.write(dumps(output, json_output, separators=(',',':'), sort_keys=True))
