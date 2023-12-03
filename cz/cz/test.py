import ToJson
import Postprocessing
import my_functions
import split
import Quantifierprocessing
from fastHan import FastHan

# 示例用法
text = "酒店有一个空间;可出租的空间是卧室或会议室;可出租空间总是有一个特定的租金成本和面积;酒店的卧室有一个独特的房间号和一些床;酒店的卧室可能有一台电视机;每台电视机由序列号和显示尺寸组成;每家酒店至少有一名接待员;接待员处理顾客的预订;每次预订都有一个客户和一个选定的可租用空间;客户由姓名、姓氏标识;预订有开始日期和结束日期;预订也有一个记录信息;每个会议室都有名称和最大容量;会议室可以有投影屏幕;每个预订有一个特定的预定号;每个接待员都有一个工号和相应的工作职责;每个客户的地址包括省份,市区,街道和门牌号;预订可以包含客户的联系方式;卧室的床可能是单人床,双人床或者大床;每个电视机可能有不同的品牌和型号;前台有自己的工作号,姓名,年龄和性别"
# text= "酒店的卧室有一个特定的房间号和一些床"
# text="每个预订有一个特定的预定号"
# text="接待员处理顾客的预订;预订有开始日期和结束日期;可出租的空间是卧室或会议室;可出租空间总是有一个特定的租金成本和面积;每台电视机由序列号和显示尺寸组成;酒店的卧室可能有一台电视机;每家酒店至少有一名接待员;每次预订都有一个客户和一个选定的可租用空间;客户由姓名、姓氏和地址标识;预订也有一个唯一标识符;每个会议室都有名称和最大容量;会议室可以有投影屏幕;酒店的卧室有一个独特的房间号和一些床;酒店提供一个空间"
# text = "学院有学院编号、名称、联系电话;院长有院长编号、姓名、职称、学院;多个学院只有一个院长;一个院长只属于一个学院。 "
# text = "院长有院长编号、姓名、职称;学院有学院编号、名称、联系电话;每个学院只有一个院长;一个院长只属于一个学院;班级有班级编号和班级名称;学生有学生编号、姓名、联系方式;一个班级可以有多个学生。每个学生只属于一个班级;课程有课程编号、课程名称以及教师姓名;一个学生可以有多门课程;一门课程可以有多个学生"
sentences = split.split_sentences(text)
# 结果用两个列表封装
nodeDataArray_temporary = []
linkDataArray_temporary = []
for sentence in sentences:
    model = FastHan()
    answer = model(sentence, target="Parsing")
    pos = model(sentence, target="POS")
    print(answer)
    # 给定依存关系列表
    dependency_list = answer
    pos_list = pos

    # 查找包含 "root" 标签的子列表中的位置
    root_position = None
    prep_position = None
    have_position = None
    root_mean = None
    root_pos = None

    for dependency in dependency_list[0]:
        if 'root' in dependency:
            root_position = dependency_list[0].index(dependency) + 1
            root_mean = dependency[0]
        if '有' in dependency or '属于' in dependency or '包括' in dependency or '包含' in dependency:
            have_position = True
        elif 'prep' in dependency:
            prep_position = dependency_list[0].index(dependency) + 1

    # 打印 "root" 在子列表中的位置
    print("子列表中root的位置：", root_position)
    # 打印 "root" 在子列表中的含义
    print("子列表中root的意思：", root_mean)

    related_elements = None
    for dependency in pos_list[0]:
        if dependency[0] == root_mean:
            related_elements = dependency[1]
            root_pos = dependency[1]
        continue
    # 匹配相对应的pattern
    if have_position:
        # nodeDataArray_temporary.append(
        #     my_functions.have(root_position, dependency_list, have_position, root_pos, root_mean))

        havelist = my_functions.have(root_position, dependency_list,pos_list, have_position, root_pos, root_mean)
        # 对其进行处理,因为类可能因为定语的原因存在多个(现只考虑出现两个类的情况)
        if len(havelist[0])>1:
            nodeData=[]
            nodeData.append([havelist[0][1]])
            nodeData.append(havelist[1])
            nodeDataArray_temporary.append(nodeData)
            linkData=[]
            linkData.append([havelist[0][0]])
            linkData.append('')
            linkData.append([havelist[0][1]])
            linkData.append('null')
            linkDataArray_temporary.append(linkData)
        else:
            nodeDataArray_temporary.append(havelist)


        continue
    elif dependency_list[0][root_position - 1][0] == '是':
        linkDataArray_temporary.append(
            my_functions.Is(root_position, dependency_list))

        # 组成是vv，prep()优先级要高于general()
        continue
    elif dependency_list[0][root_position - 1][0] == '组成' or dependency_list[0][root_position - 1][0] == '标识':
        nodeDataArray_temporary.append(
            my_functions.prep(prep_position, root_position, dependency_list))

        continue
    elif related_elements == 'vv':
        linkDataArray_temporary.append(
            my_functions.general(related_elements, root_position, dependency_list, root_mean))


print("*****************处理前的nodeDataArray*****************")
print(nodeDataArray_temporary)
print("*****************处理前的linkDataArray*****************")
print(linkDataArray_temporary)

# *********************关系冲突处理后的nodeDataArray*********************
checklist = Postprocessing.checkrelation(nodeDataArray_temporary, linkDataArray_temporary)
nodeDataArray_pre = checklist[0]
# *********************关系冲突处理后的linkDataArray*********************
linkDataArray_pre = checklist[1]
# 输出结果
print("*****************关系冲突处理后的nodeDataArray************************")
for sublist in nodeDataArray_pre:
    print(sublist)
print("*****************关系冲突处理后的linkDataArray************************")
for sublist in linkDataArray_pre:
    print(sublist)

mergelist = Postprocessing.mergelist(nodeDataArray_pre, linkDataArray_pre)
# *********************合并处理后的nodeDataArray*********************
nodeDataArray = mergelist[0]
# *********************合并处理后的linkDataArray*********************
linkDataArray = mergelist[1]
# 输出结果
print("*****************合并冲突处理后的nodeDataArray************************")
for sublist in nodeDataArray:
    print(sublist)
print("*****************合并冲突处理后的linkDataArray************************")
for sublist in linkDataArray:
    print(sublist)
# *********************对处理后的linkDataArray进行量词处理*********************
linkDataArray = Quantifierprocessing.Quantifierprocessing(text, linkDataArray)


# 打开文件，没有文件则自动新建，将字典写入文件中
with open("my_dict.json", "w") as fp:
    fp.write(ToJson.to(nodeDataArray, linkDataArray))
    # 关闭文件
    fp.close()
