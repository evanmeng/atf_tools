#!/usr/bin/python
"""
Utility to remove outdated 3rd parties under 3p folder
By default, it will keep 3 copies for under each sub folder of 3p
Usage: simplify3p.py
"""

import os
import sys
import shutil

def simplify(nMaxKeepCopies, outdatedFolders):
    print ("Listing all the folders will be removed:")
    
    # Get 3p folder from os environment
    rootfolder = os.getenv("_ASM_3RD_PARTY_LOCALDIR")

    # Traverse 3p folder
    for folder_1 in os.listdir(rootfolder):    
        filepath1 = os.path.join(rootfolder, folder_1)
        
        # Traverse sub folder under 3p
        if(os.path.isdir(filepath1)):
            d = {}
            for folder_2 in os.listdir(filepath1):
                filepath2 = os.path.join(filepath1, folder_2)
                if(os.path.isdir(filepath2)):
                    t1 = os.path.getctime(filepath2)

                    # add folder time and file name to the dictory
                    d[t1] = filepath2
                
            #print sorted dict based on last modification time
            i = len(d)       
            for k in sorted(d.keys()):
                if(i > nMaxKeepCopies):
                    print (d[k])
                    i = i-1                    
                    outdatedFolders.append(d[k])

def onerror(func, path, exc_info):
    import stat
    if not os.access(path, os.W_OK):
        # Is the error an access error ?
        os.chmod(path, stat.S_IWUSR)
        func(path)
    else:
        raise
    
def removeDirs(outdatedFolders):
    print ("Begin to clean ................................")
    for k in outdatedFolders:
        print( "Removing..." + k)
        shutil.rmtree(k, False, onerror)
        #shutil.rmtree(k)
    print ("End to clean...................................")

def main():
    while(1):
        nMaxKeepCopies = 3
        sInput = input("input the number of copies you want to keep: \n(press enter to keep the default number for 3)?")
        sInput = sInput.strip()
        if(sInput.isdigit()):
            nMaxKeepCopies = int(sInput)
        
        outdatedFolders = []
        simplify(nMaxKeepCopies, outdatedFolders)
        
        sInput = input("Remove the above folders(y or n)?")
        sInput = sInput.strip()

        print (sInput)
        if(sInput == "y" or sInput == "Y"):
            removeDirs(outdatedFolders)
            
        sInput = input("Quit(y or n)?")
        sInput = sInput.strip()
        if(sInput == "y" or sInput == "Y"):
            quit()
    
if __name__ == '__main__':
    main()
