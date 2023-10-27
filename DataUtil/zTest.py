#Format to run with command line: python zTest.py 'src folder' 'destination folder'

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import sys, os
import math
import csv

#Default folders to generate charts
srcPop1 = os.getcwd() + "/Charts/zTest/Pop1"
srcPop2 = os.getcwd() + "/Charts/zTest/Pop2"
dest = os.getcwd() + "/Charts/zTestRes/"

STANDARD_TRIALS_NUM = 100

#Support command line argument
if (len(sys.argv) > 1):
    if (sys.argv[1] is not None):
        src = sys.argv[1]
    if (sys.argv[2] is not None):
        dest = sys.argv[2]
#os.chdir(src)
#print(os.listdir())
populationSize = {
    'totalPreyHuntedCount': 100,
    'totalTicksOutOfBounds': 100,
    'totalFoodConsumptionCount': 100,
    'totalCaloriesConsumedAsPrey': 100,
}

# populationSize = {
#     'totalPreyHuntedCount': 50,
#     'totalTicksOutOfBounds': 700,
#     'totalFoodConsumptionCount': 50,
#     'totalCaloriesConsumedAsPrey': 700,
# }


bounds = {
}

fileSrc1 = {

}

fileSrc2 = {
    
}

titles = {
    
}

#Init dictionaries based on populationSize
def init():
    for key in populationSize:
        fileSrc1[key] = ""
        fileSrc2[key] = ""
        titles[key] = ["", ""]
        bounds[key] = [0, 0]

def recurseFolders(curr, src, fileSource, titleID):
    folders = os.listdir(src + curr)
    #print(folders)
    for f in folders:
        if not '.' in f:
            #Keep traversing
            #os.mkdir(dest + curr + '/' + f)
            recurseFolders(curr + '/' + f, src, fileSource, titleID)
        else:
            path = src + curr + '/' + f
            fparts = f.split('_')
            fileSource[fparts[0]] = path
            titles[fparts[0]][titleID] = ' '.join(fparts[1:])
       

def updateValueBounds(file, filepath):
    fparts = file.split('_')
    df = pd.read_csv(filepath)
    #Remove the average column 
    df.drop('Average', axis = 'columns', inplace = True)
     #Format the data correctly by removing NaN values
    df.dropna(axis=1, inplace = True)
       
    cnum = 0
    for c in df.columns:
        if (cnum >= STANDARD_TRIALS_NUM):
            df.drop(c, axis = 'columns', inplace = True)
        else:
            cnum += 1

    #Recalculate the average value corresponding to the existing data
    df['Average'] = df.mean(numeric_only=True, axis=1)

    fMax = df.max().max()
    fMin = df.min().min()

    if (fparts[0] == 'totalPreyHuntedCount'):
        fMax = min(50, fMax)
        #print(fparts, 'Fmax ', fMax, 'Fmin ', fMin)

    currMax = bounds[fparts[0]][1]
    currMin = bounds[fparts[0]][0]
   
    bounds[fparts[0]][1] = max(fMax, currMax)
    bounds[fparts[0]][0] = min(fMin, currMin)

def calZ(d1, d2, n1, n2):
    p1 = d1 / n1
    p2 = d2 / n2
    p = (d1 + d2)/ (n1 + n2)
    res = p1 - p2
    #res /= math.sqrt(p*(1.0 - p) * (1.0/n1 + 1.0/n2))
    try:
        res /= math.sqrt(p*(1.0 - p) * (1.0/n1 + 1.0/n2))
    except Exception:
        print(p, p1, p2, n1, n2)
        #pass  # or you could use 'continue'
    #print(p1, p2, n1, n2)
    return res

def process(title, file1, file2):
    d1 = pd.read_csv(file1)
    d2 = pd.read_csv(file2)

    pop = populationSize[key]
    data1 = d1["Average"]
    data2 = d2["Average"]
    sum1 = sum(data1)
    sum2 = sum(data2)

    if (data1.size != data2.size):
        print('Data mismatch for profile ' + title)
        exit(1)
    
        


    with open(dest + title +".csv", 'w', newline='') as csvfile:
        writer = csv.writer(csvfile, dialect='excel')
        mainZ = calZ(sum1/data1.size, sum2/data2.size, 100, 100)

        count = 0
        writer.writerow([titles[title][0], titles[title][1], "Z", "Significant", "Mean Z", mainZ, abs(mainZ) < 0.05])
        for i in range(data1.size):
            z = calZ(data1[i], data2[i], pop, pop)
            writer.writerow([data1[i], data2[i], z, abs(z) < 0.05])
            if abs(z) < 0.05:
                count += 1
        writer.writerow(["Total significant pairs", count])
            
if len(os.listdir(dest)) != 0:
    print('Please clear your destination directory and try again...', file = sys.stderr)
    exit(1)
init()
recurseFolders('', srcPop1, fileSrc1, 0)
recurseFolders('', srcPop2, fileSrc2, 1)

for key in fileSrc1:
    if fileSrc1[key] == "" or fileSrc2[key] == "":
        print('Missing data')
        exit(1)

for key in fileSrc1:
    process(key, fileSrc1[key], fileSrc2[key] )

#print(fileSrc1)
#print(fileSrc2)
