#Rowan W Osmon
# ver1.1
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import sys, os

# Default folders to generate charts
#src = os.getcwd() + "/Current datasets/Trials100/WidePredNarrowPrey"
#dest = os.getcwd() +  "/Current datasets/Graphs/WidePredNarrowPrey"

src = os.getcwd() + "/Current datasets/Trials100/StockDB"
dest = os.getcwd() +  "/Current datasets/Graphs/StockDB"

STANDARD_TRIALS_NUM = 100

# Support command line argument
if (len(sys.argv) > 1):
    if (sys.argv[1] is not None):
        src = sys.argv[1]
    if (sys.argv[2] is not None):
        dest = sys.argv[2]

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

def determineMax(curr):
    folders = os.listdir(src + curr)
    #print(folders)
    for f in folders:
        if '.' in f:
            labels = updateValueBounds(f, src + curr + '/' + f )
        else:
            determineMax(curr + '/' + f)

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

    # if (fparts[0] == 'totalPreyHuntedCount'):
    #     fMax = min(50, fMax)
    #     #print(fparts, 'Fmax ', fMax, 'Fmin ', fMin)

    currMax = bounds[fparts[0]][1]
    currMin = bounds[fparts[0]][0]
   
    bounds[fparts[0]][1] = max(fMax, currMax)
    bounds[fparts[0]][0] = min(fMin, currMin)

def getBounds(file):
    fparts = file.split('_')
    res = bounds.get(fparts[0])
    if (res == None):
        return [0,0]
    return res

def recurseFolders(curr):
    folders = os.listdir(src + curr)
    #print(folders)
    for f in folders:
        if not '.' in f:
            os.mkdir(dest + curr + '/' + f)
            recurseFolders(curr + '/' + f)
        else:
            labels = getPlotLabels(f)
            #print(labels)
            
            profileName = curr.replace('/', '_')
            createPlot(src + curr + '/' + f, dest + curr, labels[0], labels[1], labels[2], getBounds(f), profileName)

def getPlotLabels(file):
    fparts = file.split('_')
    labels = []
    labels.append(getTitle(fparts))
    labels.append('Generation')
    labels.append(getYLabel(fparts))
    return labels

def getTitle(fparts):
    titleId = fparts[0]
    titleId2 = fparts[1]
    if titleId == 'avgFitness':
        return 'Average Agent Fitness Per Generation'
    elif titleId == 'totalPreyHuntedCount':
        return 'Total Prey Hunted Per Generation'
    elif titleId == 'totalTicksOutOfBounds' and titleId2 == 'Predator':
        return 'Total Predator Ticks Out of Bounds Per Generation'
    elif titleId == 'totalTicksOutOfBounds' and titleId2 == 'Prey':
        return 'Total Prey Ticks Out of Bounds Per Generation'
    elif titleId == 'totalTicksOutOfBounds':
        return 'Total Ticks Out of Bounds Per Generation'
    elif titleId == 'avgEnergySpent':
        return 'Average Energy Spent Per Generation'
    elif titleId == 'avgPercDead':
        return 'Average Percentage of Time Spent Dead Per Generation'
    elif titleId == 'totalFoodConsumptionCount':
        return 'Total Food Consumed by Prey Per Generation'
    elif titleId == 'avgPredWinnerBonus':
        return 'Average Predator Winner Bonus Per Generation'
    elif titleId == 'totalCaloriesConsumedAsPrey':
        return 'Total Calories Prey Consumed Per Generation'
    else:
        print('A title ID does not exist yet! Add ' + titleId + ' to the getTitle(titleId) method.', file=sys.stderr)
    return 'error :('

def getYLabel(fparts):
    titleId = fparts[0]
    if titleId == 'avgFitness':
        return 'Average Agent Fitness'
    elif titleId == 'totalPreyHuntedCount':
        return 'Total Prey Hunted'
    elif titleId == 'totalTicksOutOfBounds':
        return 'Total Ticks Out of Bounds'
    elif titleId == 'avgEnergySpent':
        return 'Average Energy Spent'
    elif titleId == 'avgPercDead':
        return 'Average Percentage of Time Spent Dead'
    elif titleId == 'totalFoodConsumptionCount':
        return 'Total Food Consumed by Prey'
    elif titleId == 'avgPredWinnerBonus':
        return 'Average Predator Winner Bonus'
    elif titleId == 'totalCaloriesConsumedAsPrey':
        return 'Total Calories Prey Consumed'
    else:
        print('A title ID does not exist yet! Add ' + titleId + ' to the getTitle(titleId) method.', file=sys.stderr)
    return 'error :('

def createPlot(csv_path, plotDest, title, x_label, y_label, bounds, profileName=''):
    df = pd.read_csv(csv_path)
    df.drop('Average', axis='columns', inplace=True)
    df.dropna(axis=1, inplace=True)
    cnum = 0
    for c in df.columns:
        if (cnum >= STANDARD_TRIALS_NUM):
            df.drop(c, axis='columns', inplace=True)
        else:
            cnum += 1

    #!!!!!
    # Plotting individual trials as scatter points without labels
    for c in df.columns:
        plt.scatter(df.index.array, df[c], 4, alpha=0.5)

    # Plotting the average as a line plot
    df['Average'] = df.mean(numeric_only=True, axis=1)
    average_line, = plt.plot(df['Average'], linewidth=1.8, label='Average', color='red')

    # Calculating +SD and -SD
    SDAbove = []
    SDBelow = []
    df['StandardDeviation'] = df.std(axis=1, ddof=0)
    for mean, sd in zip(df['Average'], df['StandardDeviation']):
        SDAbove.append(mean + sd)
        SDBelow.append(mean - sd)

    # Plotting +SD and -SD
    sd_above_line, = plt.plot(SDAbove, linewidth=1.2, ls='-', label='+SD', color='blue', alpha=0.8)
    sd_below_line, = plt.plot(SDBelow, linewidth=1.2, ls='-', label='-SD', color='black', alpha=0.8)

    plt.xlabel(x_label)
    plt.ylabel(y_label)
    plt.title(title)
    plt.legend(handles=[average_line, sd_above_line, sd_below_line]) 
    plt.ylim(top=bounds[1], bottom=bounds[0])

    fileName = title.replace(' ', '_')
    plt.savefig(plotDest + '/' + fileName + profileName + '.png')
    plt.clf()

    print(profileName.replace('_', ' ') + " : " + title + " with " + str(len(df.columns) - 2) + " columns")  # to show progress

if len(os.listdir(dest)) != 0:
    print('Please clear your destination directory and try again...', file=sys.stderr)
    exit(1)
determineMax('')
recurseFolders('')