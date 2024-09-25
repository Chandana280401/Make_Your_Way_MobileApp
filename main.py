import pyrebase
import firebase_admin
from sklearn.cluster import DBSCAN
import numpy as np
import math
firebaseConfig={"apiKey": "AIzaSyD8rtDQuqWlLPmYLxWjjsPyalvM-tcnKBU",
  "authDomain": "crudpy-54eb6.firebaseapp.com",
  "databaseURL":"https://crudpy-54eb6-default-rtdb.firebaseio.com",
  "projectId": "crudpy-54eb6",
  "storageBucket": "crudpy-54eb6.appspot.com",
  "messagingSenderId": "188828007307",
  "appId": "1:188828007307:web:d36963d3dc0c5feba4cd8e",
  "measurementId": "G-28EZL785Q3"}
firebase=pyrebase.initialize_app(firebaseConfig)
db=firebase.database()
print("retreiving the data from the database")
d=db.child("data").get()
res=[]
for i in range(0,len(d.val())):
    ele=[]
    ele.append(d.val()[i][0])
    ele.append(d.val()[i][1])
    res.append(ele)
print("retreived the data from the database")
X=np.array(res)
print("performing clustering")
clustering=DBSCAN(eps=0.0004,min_samples=2).fit(X)
print("clustering done")
print(clustering.labels_)
L=clustering.labels_.copy()
L2=list(L)
noc=max(L2)+1
for i in range(noc):
    c=L2.count(i)
    #print(c)
    type=""
    warningdistance=-1
    if c<5:
        type="yellow"
        warningdistance=300
    elif c<10:
        type="orange"
        warningdistance = 500
    else:
        type="red"
        warningdistance = 800
    cpoints = []
    s1=0
    s2=0
    d=c
    while(c):
        idx = L2.index(i)
        s1=s1+res[idx][0]
        s2=s2 + res[idx][1]
        cpoints.append(res[idx])
        L2[idx] = -2
        c=c-1
    avglat=s1/d
    avglong=s2/d
    #print(avglat,avglong)
    minlist=[]
    for j in range(d):
        ele1=math.pow(avglat-cpoints[j][0],2)
        ele2 = math.pow(avglong - cpoints[j][1], 2)
        dist=math.sqrt(ele1+ele2)
        minlist.append(dist)
    minidx=minlist.index(min(minlist))
    maxidx = minlist.index(max(minlist))
    centroidpoint=cpoints[minidx]
    #print("centroidpoint",centroidpoint)
    lon1 = math.radians(centroidpoint[1])
    lon2 = math.radians(cpoints[maxidx][1])
    lat1 = math.radians(centroidpoint[0])
    lat2 = math.radians(cpoints[maxidx][0])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c1 = 2 * math.asin(math.sqrt(a))
    r = 6371
    maxradius=int(c1 * r*1000)
    db.child("clusters").child("cluster"+str(i)).set({"centroid":centroidpoint,"maxradius":maxradius,"clusterpoints":cpoints,"noofpoints":d,"type":type,"alertdistance":maxradius+warningdistance})
