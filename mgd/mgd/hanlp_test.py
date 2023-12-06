from hanlp_restful import HanLPClient
import json
import django

print(django.get_version())
HanLP = HanLPClient('https://www.hanlp.com/api', auth="MzEzMkBiYnMuaGFubHAuY29tOjVyM2Eya1ZLTmxqbW1Gb00=", language='zh') # auth不填则匿名，zh中文，mul多语种

text1_ALL = "学院信息包括学院编号、名称、联系电话。院长信息包括院长编号、姓名、职称、所属学院。每个学院只有一个院长，而一个院长只属于一个学院。班级信息包括班级编号和班级名称。学生信息包括学生编号、姓名、联系方式以及所属班级。一个班级可以有多个学生，但每个学生只属于一个班级。课程信息包括课程编号、课程名称以及教师姓名。一个学生可以选择多门课程，而一门课程可以被多个学生选修。"
text1_ALLone = "学院包括学院编号、名称、联系电话。院长包括院长编号、姓名、职称、所属学院。每个学院只有一个院长。一个院长只属于一个学院。班级包括班级编号和班级名称。学生包括学生编号、姓名、联系方式以及所属班级。一个班级可以有多个学生。每个学生只属于一个班级课程。包括课程编号、课程名称以及教师姓名。一个学生可以选择多门课程。一门课程可以被多个学生选修。"
text1_one = "学院信息包括学院编号、名称、联系电话。"
text1_two = "院长包括院长编号、姓名、职称、所属学院。"
text1_three = "院长包括院长编号、姓名、职称。学院包括学院编号、名称、联系电话。每个学院只有一个院长。一个院长只属于一个学院。"
text1_four = "班级包括班级编号和班级名称。学生包括学生编号、姓名、联系方式。一个班级可以有多个学生。每个学生只属于一个班级。"
text1_five = "学生包括学生编号、姓名、联系方式。课程包括课程编号、课程名称以及教师姓名。一个学生可以选择多门课程。多个学生可以选择一门课程。"

text1_final = "院长包括院长编号、姓名、职称。学院包括学院编号、名称、联系电话。每个学院只有一个院长。一个院长只属于一个学院。班级包括班级编号和班级名称。学生包括学生编号、姓名、联系方式。一个班级可以有多个学生。每个学生只属于一个班级。课程包括课程编号、课程名称以及教师姓名。一个学生可以选择多门课程。多个学生可以选择一门课程。"

text2_ALL ="可出租的空间是酒店卧室或会议室;可出租空间总是有一个特定的租金成本和面积;酒店的卧室有一个独特的房间号和一些床;酒店的卧室可能有一台电视机;每台电视机由序列号和显示尺寸组成;每家酒店至少有一名接待员;接待员处理顾客的预订;每次预订都有一个客户和一个选定的可租用空间;客户由姓名、姓氏和地址标识;预订有开始日期和结束日期;预订也有一个唯一标识符;每个会议室都有名称和最大容量;议室可以有投影屏幕"
text2_one="可出租的空间是酒店卧室或会议室"
text2_two="可出租空间总是有一个特定的租金成本和面积"
text2_three="可出租的空间是酒店卧室或会议室。可出租空间总是有一个特定的租金成本和面积。酒店的卧室有一个独特的房间号和一些床。酒店的卧室可能有一台电视机。每台电视机由序列号和显示尺寸组成。每家酒店至少有一名接待员。"
text2_four="酒店的卧室有一个独特的房间号和一些床。"


# doc = HanLP.parse(text,tasks='tok,pos,ner,srl,dep,con,parse')
# 结果是中文依存标签
doc = HanLP.parse(text1_final, tasks=["dep", "pos"])

# 可视化依存句法树
print("依存句法树--\n")
doc.pretty_print()


# 转化为CoNLL格式
# print("CoNll--\n",doc.to_conll())

# "tok/fine": 细粒度分词结果，每个子列表包含一句话被分词后的单词序列。
# "tok/coarse": 粗粒度分词结果，每个子列表包含一句话被分词后的单词序列。
# "pos/ctb": 使用CTB标注集的词性标注结果，每个子列表包含一句话中每个单词的词性标签。
# "pos/pku": 使用PKU标注集的词性标注结果，每个子列表包含一句话中每个单词的词性标签。
# "pos/863": 使用863标注集的词性标注结果，每个子列表包含一句话中每个单词的词性标签。
# "ner/msra": MSRA命名实体识别结果，每个子列表包含一句话中每个单词的命名实体标签，此处为空列表。
# "ner/pku": PKU命名实体识别结果，每个子列表包含一句话中每个单词的命名实体标签，此处为空列表。
# "ner/ontonotes": OntoNotes命名实体识别结果，每个子列表包含一句话中每个单词的命名实体标签，此处为空列表。
# "srl": 语义角色标注结果，每个子列表包含一个句子的语义角色标注信息，包括论元、谓词和其在句子中的起止位置。
# "dep": 依存句法分析结果，每个子列表包含一个句子的依存关系信息，包括头部词索引和依存关系类型。
# "sdp": 语义依存图分析结果，每个子列表包含一个句子的语义依存图信息，包括关系和关系的头部索引。
# "con": 句法分析树结构，以中文括号表达的树结构表示句子的句法分析结果。
print("doc--", doc)

# 识别出来的类列表
class_list = []
relationship_list = []


# 定义类结构
class ClassStructure:
    def __init__(self):
        self.class_name = None
        self.attributes = {}
        self.methods = []
        self.relationships = []

    def set_class_name(self, class_name):
        self.class_name = class_name

    def get_class_name(self):
        return self.class_name

    def add_attribute(self, attribute_name, attribute_value):
        self.attributes[attribute_name] = attribute_value

    def add_method(self, method_name):
        self.methods.append(method_name)

    def add_relationship(self, relationship):
        self.relationships.append(relationship)

    def get_class_structure(self):
        relationships_list = [relationship.get_relationship() for relationship in self.relationships]
        return {
            "class_name": self.class_name,
            "attributes": self.attributes,
            "methods": self.methods,
            "relationships": relationships_list
        }

    def gojs_json(self):
        return {
            "category": "ClassNode",
            "name": self.class_name,
            "properties": [{"name": attribute_name, "visibility": "public", "type": attribute_value} for attribute_name, attribute_value in self.attributes.items()],
            "methods": [{"name": method_name, "visibility": "public", "type": ""} for method_name in self.methods],
            "key": self.class_name,
            "text": self.class_name,
            "description": ""
        }


class Relationship:
    def __init__(self, from_entity, to_entity, relationship_type):
        self.from_entity = from_entity
        self.from_quant = ""
        self.relationship_type = relationship_type
        self.to_quant = ""
        self.to_entity = to_entity

    def get_from_entity(self):
        return self.from_entity

    def set_from_quant(self, quant):
        self.from_quant = quant

    def get_from_quant(self):
        return self.from_quant

    def get_to_entity(self):
        return self.to_entity

    def set_to_quant(self, quant):
        self.to_quant = quant

    def get_to_quant(self):
        return self.to_quant

    def get_relationship_type(self):
        return self.relationship_type

    def get_relationship(self):
        return {
            "from_quant": self.from_quant,
            "from_entity": self.from_entity,
            "relationship_type": self.relationship_type,
            "to_quant": self.to_quant,
            "to_entity": self.to_entity
        }

    # {"category":"Association", "text":"association", "fromText":"", "toText":"", "from":-3, "to":-1},
    def gojs_json(self):
        return {
            "category": "Association",
            "text": self.relationship_type,
            "fromText": self.from_quant,
            "toText": self.to_quant,
            "from": self.from_entity,
            "to": self.to_entity
        }


# 分析句子结构，提取实体和属性
# 匹配
def match(doc, class_list, relationship_list):
    tokens_list = doc["tok/fine"]
    pos_tags_list = doc["pos/ctb"]
    dependencies_list = doc["dep"]
    for s in range(len(tokens_list)):
        tokens = tokens_list[s]  # 获取词语标记
        pos_tags = pos_tags_list[s]  # 获取词性标记
        dependencies = dependencies_list[s]  # 获取依存关系

        # tokens = doc["tok/fine"][0]  # 分词结果
        # pos_tags = doc["pos/ctb"][0]  # 词性标注结果
        # dependencies = doc["dep"][0]  # 依存句法分析结果

        # 定义 class_structure 变量
        class_structure = None

        for i, word in enumerate(tokens):
            if dependencies[i][1] == "nsubj" or dependencies[i][1] == "dep":
                # 判断dep类型的词的依存词是不是root
                if dependencies[i][0] != 0 and dependencies[dependencies[i][0]-1][1] != "root":
                    continue
                class_word = word
                for j, dep in enumerate(dependencies):
                    if dep[0] == i + 1 and dep[1] == "compound:nn":
                        class_word = tokens[j] + class_word
                # 初始化 class_exists 变量为 False
                class_exists = False
                # 检查 class_list 中是否已经存在该类
                for existing_class in class_list:
                    if existing_class.get_class_name() == class_word:
                        class_structure = existing_class
                        class_exists = True
                        break
                # 如果 class_list 中不存在该类，则创建一个新的 ClassStructure 对象
                if not class_exists:
                    class_structure = ClassStructure()
                    class_structure.set_class_name(class_word)
                    class_list.append(class_structure)
            elif dependencies[i][1] == "dobj" or dependencies[i][1] == "conj":
                attribute_word = word
                prev_dep = dependencies[i - 1] if i > 0 else None
                if prev_dep and prev_dep[1] == "compound:nn":
                    attribute_word = tokens[i - 1] + attribute_word
                # 检查该宾语是否是一个类，如果是则当成关系处理
                for existing_class in class_list:
                    if existing_class.get_class_name() == attribute_word:
                        if class_structure is not None:
                            from_class = class_structure.get_class_name()
                            to_class = attribute_word
                            # 查找与root对应的词作为关系类型
                            root_word = None
                            for i, dep in enumerate(dependencies):
                                if dep[1] == "root":
                                    root_word = tokens[i]
                                    break
                            # 使用root 词作为关系类型
                            relationship_type = root_word
                            class_relationship = Relationship(from_class,to_class, relationship_type)
                            # 判断关系
                            from_quant = ""
                            to_quant = ""
                            print("---------判断关系量词中-------")
                            # 判断主语是否有量词
                            for i, dep in enumerate(dependencies):
                                if dep[1] == "nummod" and dependencies[dep[0]-1][1] == "nsubj":
                                    # from_quant = tokens[i]
                                    if tokens[i] == "一":
                                        from_quant = "1"
                                    else:
                                        from_quant = "*"
                                elif dep[1] == "dep" and dependencies[dep[0]-1][1] == "nsubj":
                                    # from_quant = tokens[i]
                                    from_quant = "*"
                                elif dep[1] == "det" and dependencies[dep[0]-1][1] == "nsubj":
                                    # from_quant = tokens[i]
                                    from_quant = "1"
                            print("from_quant", from_quant)
                            # 如果宾语有量词，则将量词添加到to_quant
                            for i, dep in enumerate(dependencies):
                                if dep[1] == "nummod" and dependencies[dep[0]-1][1] == "dobj":
                                    # to_quant = tokens[i]
                                    if tokens[i] == "一":
                                        to_quant = "1"
                                    else:
                                        to_quant = "*"
                                elif dep[1] == "dep" and dependencies[dep[0]-1][1] == "dobj":
                                    # to_quant = tokens[i]
                                    to_quant = "*"
                                elif dep[1] == "det" and dependencies[dep[0]-1][1] == "dobj":
                                    # to_quant = tokens[i]
                                    to_quant = "*"
                            print("to_quant", to_quant)
                            class_relationship.set_from_quant(from_quant)
                            class_relationship.set_to_quant(to_quant)
                            # 将关系添加到当前类的关系列表中
                            class_structure.add_relationship(class_relationship)
                            # 添加到关系列表中
                            relationship_list.append(class_relationship)
                        break
                # 将属性添加到当前类的属性列表中
                else:
                    if class_structure is not None:  # 检查 class_structure 是否存在
                        class_structure.add_attribute(attribute_word, "String")
        print(s, class_structure.get_class_structure())


# 返回的json格式
def tojson(class_list):
    # 将列表转换为 JSON 数据格式
    return json.dumps([item.get_class_structure() for item in class_list], ensure_ascii=False)


def togojsjson(class_list, relationship_list):
    # 将列表转换为 JSON 数据格式
    class_data = [item.gojs_json() for item in class_list]
    relationship_data = [item.gojs_json() for item in relationship_list]
    return json.dumps({"class": "go.GraphLinksModel","linkKeyProperty": "id",
                       "nodeDataArray": class_data, "linkDataArray": relationship_data}, ensure_ascii=False)


match(doc, class_list, relationship_list)
print("class_list_leng",class_list.__len__())

# 构建JSON数据结构

print("---------Class列表----------------")
# 打印class_list
for item in class_list:
    print(item.get_class_structure())
print("-----------常规Class的Json-------------------")
# 将列表转换为 JSON 数据格式
json_data = tojson(class_list)
print(json_data)
print("-----------Gojs形式的Json-------------------")
json_data= togojsjson(class_list, relationship_list)
print(json_data)
