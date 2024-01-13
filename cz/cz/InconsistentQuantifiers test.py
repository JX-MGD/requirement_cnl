from fastHan import FastHan
import split
import re
from collections import defaultdict
import cn2an

model = FastHan()
# text = '用户最多可以借三十本书;学生最少可以借二十本书，最多可以借三十本书;老师最多可以借四十本书'
text = '用户最多可以借三十本书;学生最少可以借二十本书，最多可以借三十本书;老师最多可以借四十本书'
answers = model(text, target="Parsing")

# 创建一个空列表来存储字典
book_list = []
for answer in answers:
    print(answer[0])
    # 记录根节点位置和根节点的值
    root_position = None
    root_mean = None
    # 记录并列根节点的词位置和值
    dep_position = None
    dep_mean = None

    # 记录宾语的值(可能有多个)
    dobj_mean = None
    dobj_list = []
    # 记录主语的值
    nsubj_mean = None

    for dependency in answer[0]:

        if 'root' in dependency:
            root_position = answer[0].index(dependency) + 1
            root_mean = dependency[0]
        elif 'dep' in dependency and dependency[1] == root_position:
            dep_position = answer[0].index(dependency) + 1
            dep_mean = dependency[0]
        elif 'nsubj' in dependency:
            nsubj_mean = dependency[0]
        elif 'dobj' in dependency:
            dobj_list.append(dependency[0])

    for dependency in answer[0]:
        if dependency[1] == root_position and dependency[2] == 'advmod':
            book_limits = {'执行者': nsubj_mean, '操作': root_mean + dobj_list[0],
                           dependency[0]: cn2an.cn2an(answer[0][root_position][0])}
            book_list.append(book_limits)
        elif dependency[1] == dep_position and dependency[2] == 'advmod':
            book_limits = {'执行者': nsubj_mean, '操作': dep_mean + dobj_list[1],
                           dependency[0]: cn2an.cn2an(answer[0][dep_position][0])}
            book_list.append(book_limits)
print(book_list)
# 创建一个空字典来存储合并后的信息
merged_data = {}

# 遍历原始列表
for item in book_list:
    # 生成唯一键，由执行者和操作组成
    key = (item['执行者'], item['操作'])

    # 如果键已存在，更新最少和最多的值
    if key in merged_data:
        if '最少' in item:
            merged_data[key]['最少'] = max(merged_data[key]['最少'], item['最少'])
        if '最多' in item:
            merged_data[key]['最多'] = min(merged_data[key]['最多'], item['最多'])
    else:
        # 如果键不存在，直接添加字典
        merged_data[key] = {
            '执行者': item['执行者'],
            '操作': item['操作'],
            '最少': item.get('最少', 0),
            '最多': item.get('最多', float('inf'))
        }

# 将合并后的信息转为列表
result_list = list(merged_data.values())

# 打印结果
print(result_list)

# 创建一个默认字典用于存储相同操作的字典
merged_data = defaultdict(list)

# 合并相同操作的字典
for entry in result_list:
    key = (entry['执行者'], entry['操作'])
    merged_data[key].append(entry)

# 分配区间值
for key, entries in merged_data.items():
    min_value = max_value = None
    for entry in entries:
        # 处理最少值
        if entry['最少']:
            min_value = entry['最少']
        # 处理最多值
        if entry['最多']:
            max_value = entry['最多']

    # 如果最少值没有值，则为0
    min_value = min_value if min_value is not None else 0

    # 如果最多值没有值，则为正无穷
    max_value = max_value if max_value is not None else float('inf')

    # 更新字典中的区间值
    for entry in entries:
        entry['最少'] = min_value
        entry['最多'] = max_value

# 打印结果
print(list(merged_data.values()))

# 比较大小
# demo中先指定linkDataArray
linkDataArray = [[['空间'], '', ['会议室', '卧室'], 'Generalize'],
                 [['用户'], '', ['学生', '老师'], 'Generalize'],
                 [['酒店'], '', ['卧室'], 'null'],
                 [['接待员'], '处理', ['预订'], 'null'],
                 [['客户'], '', ['地址'], 'null'],
                 [['预订'], '', ['空间', '客户'], 'Aggregate'],
                 [['床'], '', ['大床', '单人床', '双人床'], 'Generalize'],
                 [['酒店'], '', ['空间'], 'Aggregate'],
                 [['卧室'], '', ['床'], 'Aggregate'],
                 [['卧室'], '', ['电视机'], 'Aggregate'],
                 [['酒店'], '', ['接待员'], 'Aggregate']]
# 检测条件
for parent_entry in merged_data.values():
    executor = parent_entry[0]['执行者']
    for item in linkDataArray:
        if executor == item[0][0] and item[3] == 'Generalize':
            # 符合条件的元素找到了
            target_values = item[2]
            parent_min = parent_entry[0]['最少']
            parent_max = parent_entry[0]['最多']
            for child_entry in merged_data.values():
                executor = child_entry[0]['执行者']
                if executor in target_values:
                    child_min = child_entry[0]['最少']
                    child_max = child_entry[0]['最多']
                    # 判断一个子区间是否完全包含父区间
                    # 子最小值>=父最小值 and 子最大值<=父最大值
                    if parent_min > child_min or parent_max < child_max:
                        print(f"当前子区间{child_entry[0]['执行者']}[{child_min},{child_max}]没有完全包含于父区间{parent_entry[0]['执行者']}[{parent_min},{parent_max}],可能存在量词不一致性问题")
                        break

