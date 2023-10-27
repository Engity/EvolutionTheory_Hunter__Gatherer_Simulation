#Format to run with command line: python groupGraph.py 'src folder' 'destination folder'

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import sys, os

#Default folders to generate charts
src = os.getcwd() + "/Charts/RawData_Input"
dest = os.getcwd() + "/Charts/Result"

STANDARD_TRIALS_NUM = 100

bounds = {
    'avgFitness': [0, 0],
    'totalPreyHuntedCount': [0, 0],
    'totalTicksOutOfBounds': [0, 0],
    'avgEnergySpent': [0, 0],
    'avgPercDead': [0, 0],
    'totalFoodConsumptionCount': [0, 0],
    'avgPredWinnerBonus': [0, 0],
    'totalCaloriesConsumedAsPrey': [0, 0],
}

statNames = {
    'avgFitness': "Average Agent Fitness Per Generation",
    'totalPreyHuntedCount': "Total Prey Hunted Per Generation",
    'totalTicksOutOfBounds': "Total Ticks Out of Bounds Per Generation",
    'avgEnergySpent': "Average Energy Spent Per Generation",
    'avgPercDead': "Average Percentage of Time Spent Dead Per Generation",
    'totalFoodConsumptionCount': "Total Food Consumed by Prey Per Generation",
    'avgPredWinnerBonus': "Average Predator Winner Bonus Per Generation",
    'totalCaloriesConsumedAsPrey': "Total Calories Prey Consumed Per Generation",
}

yUnitNames = {
    'avgFitness': "Fitness",
    'totalPreyHuntedCount': "Total Prey Hunted",
    'totalTicksOutOfBounds': "Ticks Out Of Bounds",
    'avgEnergySpent': "Energy",
    'avgPercDead': "Percentage",
    'totalFoodConsumptionCount': "Food Count",
    'avgPredWinnerBonus': "Bonus",
    'totalCaloriesConsumedAsPrey': "Calories Consumed",
}

#Support command line argument
if (len(sys.argv) > 1):
    if (sys.argv[1] is not None):
        src = sys.argv[1]
    if (sys.argv[2] is not None):
        dest = sys.argv[2]

#os.chdir(src)
#print(os.listdir())
def initBounds(profile):
    profile['bounds'] = {
        'avgFitness': [0, 0],
        'totalPreyHuntedCount': [0, 0],
        'totalTicksOutOfBounds': [0, 0],
        'avgEnergySpent': [0, 0],
        'avgPercDead': [0, 0],
        'totalFoodConsumptionCount': [0, 0],
        'avgPredWinnerBonus': [0, 0],
        'totalCaloriesConsumedAsPrey': [0, 0],
    }



profiles = {}
dataRead = {}
def initProfile(profiles):
    for profile in profileNames:
        profiles[profile] = {}
        initBounds(profiles[profile])

def determineMax(curr):
    folders = os.listdir(src + curr)
    #print(folders)
    for f in folders:
        if '.' in f:
            labels = updateValueBounds(f, src + curr + '/' + f )
        else:
            determineMax(curr + '/' + f)

def updateValueBounds(file, filepath, profile):
    fparts = file.split('_')
    df = pd.read_csv(filepath)
    
    if dataRead.get(fparts[0]) is None:
        dataRead[fparts[0]] = {}
    dataRead[fparts[0]][profile] = df
    
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

    # currMax = profile['bounds'][fparts[0]][1]
    # currMin = profile['bounds'][fparts[0]][0]
   
    # profile['bounds'][fparts[0]][1] = max(fMax, currMax)
    # profile['bounds'][fparts[0]][0] = min(fMin, currMin)
    currMax = bounds[fparts[0]][1]
    currMin = bounds[fparts[0]][0]
    bounds[fparts[0]][1] = max(fMax, currMax)
    bounds[fparts[0]][0] = min(fMin, currMin)

def createPlot(data, plotDest, title, x_label, y_label, bounds, profileName = ''):
    df = data
    df.drop('Average', axis = 'columns', inplace = True)
    df.dropna(axis=1, inplace = True)

    cnum = 0
    for c in df.columns:
        if (cnum >= STANDARD_TRIALS_NUM):
            df.drop(c, axis = 'columns', inplace = True)
        else:
            cnum += 1

    #scatter = df.drop('Average', axis = 'columns')
    c_len = len(df.columns)
    for c in df.columns:
        if (c_len - 1 > 10):
            plt.scatter(df.index.array, df[c],  4, alpha = 0.1)
        else: 
            plt.scatter(df.index.array, df[c],  4, label = c, alpha = 0.1)
    df['Average'] = df.mean(numeric_only=True, axis=1)
    plt.plot(df['Average'], linewidth = 1.8, label = 'Average', color = 'black')
    
    SDAbove = []
    SDBelow = []
    df['StandardDeviation'] = df.std(axis = 1, ddof = 0)
    for mean, sd in zip(df['Average'] , df['StandardDeviation']):
        SDAbove.append(mean + sd)
        SDBelow.append(mean - sd)

    #plt.plot(df['StandardDeviation'], linewidth = 1, ls = '--', label = 'Standard Deviation', color = 'red')
    plt.plot(SDAbove, linewidth = 1.2, ls = '-', label = '+SD', color = 'red', alpha = 0.8)
    plt.plot(SDBelow, linewidth = 1.2, ls = '-', label = '-SD', color = 'blue', alpha = 0.8)

    plt.xlabel(x_label)
    plt.ylabel(y_label)
    plt.title(title)
    plt.legend()
    plt.ylim(top = bounds[1], bottom = bounds[0])
    #plt.show()

    fileName = title.replace(' ', '_')
    plt.savefig(plotDest + '/' + fileName + profileName + '.png')
    plt.clf()

    print(profileName.replace('_',' ') + " : " + title + " with " + str(len(df.columns) - 2) + " columns")# to show progress

#Create Plot
def createPlot(data, plotDest, bounds, statID = '', drawSD = False):
    
    sdLabeled = False
    for profile in profiles:
        avg = data[profile].mean(numeric_only=True, axis=1)
        line = plt.plot(avg, linewidth = 1.5, label = profileNames[profile], alpha = 0.8)
        
        #Collect data for SD and draw it
        if drawSD:
            colorOfProfile = line[0].get_color()
            SDAbove = []
            SDBelow = []
            SD = data[profile].std(axis = 1, ddof = 0)
            for mean, sd in zip(data[profile]['Average'] , SD):
                SDAbove.append(mean + sd)
                SDBelow.append(mean - sd)
            if sdLabeled:
                plt.plot(SDAbove, linewidth = 1.2, ls = '-', color = colorOfProfile, alpha = 0.3)
                plt.plot(SDBelow, linewidth = 0.8, ls = ':', color = colorOfProfile, alpha = 0.3)
            else:
                plt.plot(SDAbove, linewidth = 1.2, ls = '-', label = "+SD", color = colorOfProfile, alpha = 0.3)
                plt.plot(SDBelow, linewidth = 0.8, ls = ':', label = "-SD", color = colorOfProfile, alpha = 0.3)
            sdLabeled = True
    
    plt.title(statNames[statID])
    plt.xlabel("Generation")
    plt.ylabel(yUnitNames[statID])
    
    plt.legend()
    #plt.ylim(top = bounds[1], bottom = bounds[0])

    plt.savefig(plotDest + '/' + statID + '.png')
    plt.clf()
    
    print("Complete generate graph for " + statNames[statID])

# Read the data and update the max values
def traverseFolder():
    folders = os.listdir(src)
    #Accessing a profile
    for profile in folders:
        folder = src + '/' + profile +'/'
        filesName = []
        if 'GroupName.json' not in folder:
            filesName = os.listdir(folder)

        # Accessing each files
        for file in filesName:
            if file != 'GroupName.json':
                updateValueBounds(file, folder + file, profile)

# Read file name to match with profile name
import json
groupFolder = ".\GroupName"

def profileSelection(groupFolder = '.\GroupName'):
    print("Currently at " + groupFolder)
    groups = os.listdir(groupFolder)
    i = 0
    print("Select the following profile")
    choices = []
    for group in groups:
        print(str(i) + ". " + group)
        i += 1
        choices.append(group)
    choice = input()
    print("You chose profile: " + choices[int(choice)])

    deeperFolders = os.listdir(groupFolder + '\\' + choices[int(choice)])
  
    if 'GroupName.json' in deeperFolders:
        return groupFolder + '\\' + choices[int(choice)] 
        
    print()
    return profileSelection(groupFolder + '\\' + choices[int(choice)])    

src = profileSelection(src)
profileNames = json.load(open(src + '\\GroupName.json'))

initProfile(profiles)

traverseFolder()

# Draft plot based on each profile
for stat in dataRead:
    createPlot(dataRead[stat], dest, bounds[stat], stat)
print("--------Done--------")


