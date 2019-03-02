import xlrd  # CSV file does not work well, so I decide to use excel instead
from typing import *
import re
import os
from collections import OrderedDict

DICT = OrderedDict()
lectureType = (
    "Laboratory", "Studio", "Seminar", "Clinical", "Practicum", "Discussion", "Drill", "Independent Study", "Lecture",
    "Workshop")


def getDataPath(filename: str):
    dir_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(dir_path, "data", filename)


def readData():
    """
    Read all the classes and put in a dictionary called DICT
    :return:
    """
    file = xlrd.open_workbook(getDataPath('CS1192Data.xlsx'))
    sheet = file.sheet_by_index(0)
    for i in range(1, sheet.nrows):
        category = str(sheet.cell_value(i, 1)).lower()
        number = str(int(sheet.cell_value(i, 2)))
        lecture = str(sheet.cell_value(i, 4)).lower()
        course = category + number + lecture
        # print(course)
        # input()
        DICT[course] = DICT.get(course, []) + [sheet.row_values(i)]


def readTitle():
    """
    Get all the class titles and output the classTitle.csv
    :return:
    """
    file = xlrd.open_workbook("CompSci1192.xlsx")
    sheet = file.sheet_by_index(0)
    aSet = set()
    for i in range(1, sheet.nrows):
        category = str(sheet.cell_value(i, 1))
        number = str(int(sheet.cell_value(i, 2)))
        course = category + number
        aSet.add(course)
    with open("CompSci_classTitle.csv", "w") as f:
        for element in aSet:
            print(element, file=f)


def readTime():
    """
    Get all the class titles and output the classTime.csv
    :return:
    """
    file = xlrd.open_workbook("CS1192Data.xlsx")
    sheet = file.sheet_by_index(0)
    aSet = set()
    for i in range(1, sheet.nrows):
        info = sheet.cell_value(i, 7).strip()
        aSet.add(info)
    with open("classTime.csv", "w") as f:
        for element in aSet:
            print(element, file=f)
    print(len(aSet))


def sortReq(classList):
    # just use select sort
    for i in range(len(classList)):
        index = i
        for j in range(i + 1, len(classList)):
            if len(classList[index]) > len(classList[j]):
                index = j
        classList[i], classList[index] = classList[index], classList[i]
    return classList


def filterBefore(date, timeBlock, professor, availability, **kwargs):
    """

    :param classList: the list with time
    :param timeLimit: the filter req
    :param professor: professor name
    :param availability:
    :return: true if being filtered
    """
    for key, value in kwargs.items():
        if key == "Days":
            # check timeLimit
            filterDates = []
            placeHolder = 0
            for times in value:
                d, t = parseTime(times)
                filterDates.append([placeHolder, d, t])

            if checkTimeConflict(filterDates, date, timeBlock):
                return True
        if key == "Instructor" and professor != value:
            return True

        if key == "Status" and availability != value:
            return True


def getReq(classes: list, **kwargs):
    # return a list contain a lists of classes 3 dimension: classname, classtime, class info
    classList = []
    for i in classes:
        eachClass = DICT[i]
        # can filter here

        temp = []
        for j in range(len(eachClass)):
            identifier = eachClass[j][0]
            time = eachClass[j][7]
            date, timeBlock = parseTime(time)
            professor = eachClass[j][6]
            availability = eachClass[j][11]

            if filterBefore(date, timeBlock, professor, availability, **kwargs):
                continue
            temp.append([identifier, date, timeBlock])
        classList.append(temp.copy())
    classList = sortReq(classList)
    table = Algorithm(classList)
    return table


def Algorithm(classList: List):
    classNum = 0  # the sequence of the class
    choiceNum = 0  # the sequence of the choices within one class
    timeTable = []  # table store all the time so that we can compare
    finalTable = []  # the final result of all the full matches
    pathMemory = [0] * len(classList)  # the path the search has taken, the number indicates the next search
    while True:
        # print("classNum", classNum)
        if classNum >= len(classList):
            # made a full match and keep searching in the last class
            # print("temptable length",len(tempTable))
            finalTable.append(timeTable.copy())
            # print(finalTable)
            # print("made one")
            classNum -= 1
            choiceNum = pathMemory[classNum]
            timeTable.pop()

        # print(choiceNum, pathMemory)

        classList, classNum, choiceNum, pathMemory, timeTable, exhausted = AlgorithmRetract(classList,
                                                                                            classNum,
                                                                                            choiceNum,
                                                                                            pathMemory,
                                                                                            timeTable)

        if exhausted:
            break

        date = classList[classNum][choiceNum][1]
        timeBlock = classList[classNum][choiceNum][2]
        #
        # print("-----------------")
        # print("pathmem", pathMemory)
        # print("class", classList[classNum][choiceNum][timeNum], classNum)
        # print(date, timeBlock, timeTable)
        # print(checkTimeConflict(timeTable, date, timeBlock), len(classList))
        # print()

        if not checkTimeConflict(timeTable, date, timeBlock):
            # if the schedule matches, record the next path memory and go to the next class, reset the choiceNum = 0
            timeTable.append(classList[classNum][choiceNum])
            pathMemory[classNum] = choiceNum + 1
            classNum += 1
            choiceNum = 0
        else:
            choiceNum += 1
    print(len(finalTable))
    return finalTable


def AlgorithmRetract(classList, classNum, choiceNum, pathMemory, timeTable):
    while choiceNum >= len(classList[classNum]):
        # when all possibilities in on class have exhausted, retract one class
        # explore the next possibilities in the nearest possible class
        # reset the memory path forward to zero
        # print("in the retract",len(classList[classNum]),choiceNum)

        classNum -= 1

        if classNum < 0:
            print("no more matches")
            return classList, classNum, choiceNum, pathMemory, timeTable, True

        timeTable.pop()
        choiceNum = pathMemory[classNum]
        for i in range(classNum + 1, len(pathMemory)):
            pathMemory[i] = 0
    return classList, classNum, choiceNum, pathMemory, timeTable, False


def checkTimeConflict(timeTable: List, date: List, timeBlock: List):
    """
    compare the new class to see if it has conflicts with the existing time table
    :param timeTable: three entries: 1. the class serial number, 2. the date 3. the time
    :param date: contains the date when the class takes place
    :param timeBlock: contains beginTime and endTime of a class
    :return:
    """
    if date == None or None in timeBlock:
        # do not include any TBA
        return True
    if not timeTable:
        return False

    beginTime = timeBlock[0]
    endTime = timeBlock[1]
    for times in timeTable:
        # print("debug 2", times)
        # input()

        dates = times[1]
        begin = times[2][0]
        end = times[2][1]
        for d in date:
            if d not in dates:
                continue
            if (begin <= beginTime <= end or begin <= endTime <= end):
                return True
    return False


def parseTime(classTime: str):
    """
    parse the classTime and return which day the class is on and what time it takes place
    remark: all time are calculated in minute form, starting at 0 and end at 24 * 60
    :param classTime: give the clclassList[classNum][choiceNum][0ass time in form of String
    :return: date: List, timeBlock: List
    """
    if classTime == "TBA":
        # there is TBA
        return None, None

    pattern = r"([A-Za-z]*)\s([0-9]+.*)"
    parser = re.compile(pattern)
    match = parser.match(classTime)

    dates = match.group(1)
    times = match.group(2)

    date = []
    for i in range(0, len(dates), 2):
        date.append(dates[i:i + 2])

    time = times.strip().split("-")
    timeBlock = [0, 0]
    for count, i in enumerate(time):
        if "12" in i and "PM" in i:
            tempTime = i.strip().strip("PM").split(":")
            timeBlock[count] += int(tempTime[0]) * 60 + int(tempTime[1])
        elif "AM" in i:
            tempTime = i.strip().strip("AM").split(":")
            timeBlock[count] += int(tempTime[0]) * 60 + int(tempTime[1])
        elif "PM" in i:
            tempTime = i.strip().strip("PM").split(":")
            timeBlock[count] += (int(tempTime[0]) + 12) * 60 + int(tempTime[1])

    return date, timeBlock


readData()

if __name__ == "__main__":
    # date, time = parseTime("MoTuWeThFr 8:00AM - 10:00PM")
    # print(date,time)
    classLists = [
        "cs2110lecture",
        "cs2110laboratory",
        "ece2630studio",
        "cs2102lecture",
        "sts1500discussion",
        "math3354lecture"
    ]
    classLists2 = [
        "FREN1020Lecture",
        "ENWR1510Seminar",
        "CS2110Lecture",
        "CS2110Laboratory",
        "MATH2310Lecture",
        "MATH2310Discussion",
        "CS2102Lecture",

    ]
    kwargs = {"Days": ["MoTuWeThFr 00:00AM - 08:00AM", "MoTuWeThFr 08:00PM - 10:00PM"], "Status": "Open"}
    k = getReq(classLists, **kwargs)
    # for i in k:
    #     for j in i:
    #         print(j)
    #     print()

"""
classLists2 = [
        "FREN1020Lecture",
        "ENWR1510Seminar",
        "CS2110Lecture",
        "CS2110Laboratory",
        "MATH2310Lecture",
        "MATH2310Discussion",
        "CS2102Lecture"
    ]
"""
