import my_functions
import split
from fastHan import FastHan

# 处理量词(必须4个)
def Quantifierprocessing(text, linkDataArray):
    sentences = split.split_sentences(text)
    model = FastHan()

    for linklist in linkDataArray:
        values_to_check = [linklist[0][0], linklist[2][0]]
        first_positions = []
        # 存储寻找到的量词
        numberlist = []
        # 存储多关系对应对象
        manylist=[]
        for sentence in sentences:
            answer = model(sentence, target="Parsing")
            print(answer)
            for sublist in answer[0]:
                first_positions.append(sublist[0])
            # 检查是否所有值都存在于子列表中

            if all(value in first_positions for value in values_to_check):

                for sublist in answer[0]:

                    if sublist[2] == 'nsubj' or sublist[2] == 'dobj' or sublist[2] == 'top':
                        for numlist in answer[0]:

                            if numlist[2] == 'det':
                                if numlist[1] == answer[0].index(sublist) + 1:

                                    numberlist.append(numlist[0])

                            if numlist[2] == 'nummod':
                                if numlist[1] == answer[0].index(sublist):
                                    numberlist.append(numlist[0])
                                    if numlist[0]=='多':
                                        manylist.append(sublist[0])
                # 清空
                first_positions=[]
        # 集合不为空则添加
        if len(numberlist) > 0:
            linklist.append(numberlist)
        if len(manylist)>0:
            linklist.append(manylist)

    # print(numberlist)
    # print(linkDataArray[0])
    return linkDataArray
