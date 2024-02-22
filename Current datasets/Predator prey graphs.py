##Rowan W Osmon

#!/usr/bin/env python
# coding: utf-8

# In[1]:


import os
import pandas as pd
import matplotlib.pyplot as plt


# In[9]:


data_folder_path = os.path.join(os.getcwd(), "Trials300")
graphs_folder_path = os.path.join(os.getcwd(), "Graphs")



# In[10]:


csv_files = [file for file in os.listdir(data_folder_path) if file.endswith('.csv')]


# In[11]:


data_frames = {}
for i, file_name in enumerate(csv_files):
    data_frames[f"{file_name}_{i+1}"] = pd.read_csv(os.path.join(data_folder_path, file_name))


# In[12]:


# Loop through each data frame (run) and create a separate plot for each
for run_name, df in data_frames.items():
    # Extract the relevant part of the file name to use as the title
    file_name_parts = run_name.split("_")
    title_part = "_".join(file_name_parts[0:-1])  # Exclude the first and last parts

    # Create a new figure for each run
    plt.figure(figsize=(10, 6))

    # Create a sequential 'x_column' for each data frame based on trial numbers
    x_column = list(range(1, len(df) + 1))  # Assuming trials are in sequential order

    # Loop through each column (excluding 'Average') and use it as 'y_column' for plotting
    for column in df.columns:
        if column != 'Average':
            plt.plot(x_column, df[column], label=column)

    plt.xlabel('Trial Number')
    plt.ylabel('Fitness')  # Replace with the actual label for your y-axis

    # Use the extracted title_part as the title of the graph
    plt.title(f'Simulation Results - {title_part}')

    plt.legend()
    plt.grid(True)

    # Save the figure with a unique filename in the graphs folder
    save_path = os.path.join(graphs_folder_path, f'{run_name}_plot.png')
    plt.savefig(save_path)

    plt.show()



# In[20]:


import os
import pandas as pd
import matplotlib.pyplot as plt

data_folder_path = os.path.join(os.getcwd(), "Trials100")
graphs_folder_path = os.path.join(os.getcwd(), "Graphs")

csv_files = [file for file in os.listdir(data_folder_path) if file.endswith('.csv')]

data_frames = {}
for i, file_name in enumerate(csv_files):
    data_frames[f"{file_name}_{i+1}"] = pd.read_csv(os.path.join(data_folder_path, file_name))


# Loop through each data frame (run) and create a separate plot for each
for run_name, df in data_frames.items():
    # Extract the relevant part of the file name to use as the title
    file_name_parts = run_name.split("_")
    title_part = "_".join(file_name_parts[1:-1])  # Exclude the first and last parts

    # Create a new figure for each run
    plt.figure(figsize=(10, 6))

    # Create a sequential 'x_column' for each data frame based on trial numbers
    x_column = list(range(1, len(df) + 1))  # Assuming trials are in sequential order

    # Loop through each column (excluding 'Average') and use it as 'y_column' for plotting
    for column in df.columns:
        if column != 'Average':
            plt.plot(x_column, df[column], label=column)

    plt.xlabel('Trial Number')
    plt.ylabel('Fitness')

    # Use the extracted title_part as the title of the graph
    plt.title(f'Simulation Results - {title_part}')

    plt.legend()
    plt.grid(True)

    # Save the figure with a unique filename in the graphs folder
    save_path = os.path.join(graphs_folder_path, f'{run_name}_plot.png')
    plt.savefig(save_path)

    plt.show()



# In[ ]:




