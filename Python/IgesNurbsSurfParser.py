#!/usr/bin/python
"""
Utility to parse the nurbs surface parameter data in an igs file
Usage: IgesNurbsSurfParser.py inputfile [outputfile]

for example: IgesNurbsSurfParser.py a.igs a.txt
"""

from sys import stdout, stderr, argv

def GetSplineParameterKeyword(line, lastkeyword):
    #Get the key word "*P" for 128 (nurbs surface) type
    if line.startswith("128") and ("P" in line):
        pos = line.find("P")
        return (line[pos-2 : pos+1], True)
    elif lastkeyword and (lastkeyword in line):
        return (lastkeyword, True)
    
    return (lastkeyword, False)

def ParserNurbsData(filename):
    #Get the string that contains nurbs surface data"
    nurbsData = []
    keyword = ""
    with open(filename) as f:
        for line in f:
            keyword, need_update = GetSplineParameterKeyword(line, keyword)
            if need_update:
                data = line[:-16]
                nurbsData+= data.split(',')
    return [ item for item in nurbsData if not item.isspace() ]
    
def FormatNurbsData(d):
    #Fill the data
    #template string
    template = '''--------------------------------------
Nurbs surface data begin:    
K1 = %s
K2 = %s
M1 = %s
M2 = %s

Prop1 = %s
Prop2 = %s
Prop3 = %s
Prop4 = %s
Prop5 = %s

FirstKnotsValues: 
%s


SecondKnotsValues:
%s


Weights:
%s


ControlPoints:
%s


ParametersUV:
%s


Nurbs surface data End
--------------------------------------
'''
   
    #extract data
    (K1, K2, M1, M2, Prop1, Prop2, Prop3, Prop4, Prop5) = d[1:10]
    
    #temp variables
    N1 = 1 + int(K1) - int(M1)
    N2 = 1 + int(K2) - int(M2)
    A = N1 + 2 * int(M1)
    B = N2 + 2 * int(M2)
    C = (1 + int(K1)) * (1 + int(K2))

    #Get first and second Knots
    FirstKnotsValues = [ d[n] for n in range(10, 10 + A + 1) ]
    SecondKnotsValues = [ d[n] for n in range(11 + A, 11 + A + B + 1) ]
    Weights = [ d[n] for n in range(12 + A + B, 11 + A + B + C + 1) ]
    ControlPoints = [ d[n] for n in range(12 + A + B + C, 11 + A + B + 4 * C + 1) ]
    ParametersUV = [ d[n] for n in range(12 + A + B + 4 * C, 15 + A + B + 4 * C + 1) ]
    
    data = (K1, K2, M1, M2, Prop1, Prop2, Prop3, Prop4, Prop5) + \
    tuple(map(lambda xs: ', '.join(xs), [FirstKnotsValues, SecondKnotsValues, Weights, ControlPoints, ParametersUV]))
    
    return (template % data)

def Print2File(f, s):
    f.write(s)    

def main():
    args = argv[1:]
    
    #Check the arguments number
    argslen = len(args)
    if argslen not in [1, 2]:
        usage("exactly one file argument required")
        return 2
        
    inputfile = args[0]
    
    d = ParserNurbsData(inputfile)
    s = FormatNurbsData(d)
    if (argslen == 1):
        Print2File(stdout, s)
    else:
        with open(args[1], 'w') as f:
            Print2File(f, s)

def usage(msg):
    print >> stderr, msg
    print >> stderr, __doc__

if __name__ == '__main__':
    main()

