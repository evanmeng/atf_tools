#!/usr/bin/python

"""
Utility to parser step assembly matrix items 
Usage: StepMatrixParser.py filename
"""

import sys
import getopt

#Global dictionary data
DicData = {}

def IsToken(word):
    isnumber = word[1:len(word)].isnumeric()
    return (word[0]=='#' and isnumber)

def PrintParameters(line):
    global DicData
    start = line.find('(')
    end = line.find(')')
    paraData = line[start+1:end]
    paraDataArray = paraData.split(',')
    for item in paraDataArray:
        if(IsToken(item)):
            subPara = DicData[item]
            sys.stdout.write(subPara)
            #Print recursively
            PrintParameters(subPara)

def PreExecute(inputfile):
    global DicData
    f = open(inputfile)
    for line in f:
        if(line[0] == '#'):
            pos = line.find('=')
            DicData[line[0:pos]] = line
    f.close()
    
def FindMatrixToken():
    global DicData
    matrixToken = "ITEM_DEFINED_TRANSFORMATION"
    for line in DicData.values():
        if(matrixToken in line):
            #print (line)
            sys.stdout.write(line)
            PrintParameters(line)
            print('\n')

def PostExecute():
    global DicData
    DicData = {}
    
def usage(msg=None):
    if msg is None:
        msg = __doc__
    print(msg, file=sys.stderr)

def main():
    opts, args = getopt.getopt(sys.argv[1:], "")
    
    #Check the arguments number
    argsLen = len(args)
    if(argsLen != 1):
        print("One file name argument required")
        usage()
        return
        
    inputfile = args[0]
    PreExecute(inputfile)
    FindMatrixToken()
    PostExecute()

if __name__ == '__main__':
    main()
