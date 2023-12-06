from hanlp_restful import HanLPClient
import json
from docx import Document
import os
from hanlp_test import match, tojson



# 创建HanLP客户端
HanLP = HanLPClient('https://www.hanlp.com/api', auth="MzEzMkBiYnMuaGFubHAuY29tOjVyM2Eya1ZLTmxqbW1Gb00=", language='zh')

# 读取Word文件
def read_word_file(file_path):
    doc = Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return ' '.join(full_text)

# 读取Text文件
def read_text_file(file_path):
    with open(file_path, 'r') as file:
        data = file.read().replace('\n', '')
    return data

def file_type(file_path):
    # 获取文件扩展名
    _, file_extension = os.path.splitext(file_path)
    # 根据文件扩展名调用相应的处理函数
    if file_extension == '.docx':
        return read_word_file(file_path)
    elif file_extension == '.txt':
        return read_text_file(file_path)
    else:
        raise ValueError(f'Unsupported file type: {file_extension}')


# 识别文本
def recognize_text(text):
    doc = HanLP.parse(text, tasks=["dep", "pos"])
    class_list = []
    match(doc, class_list)
    return tojson(class_list)

# Word文件路径
word_file_path = 'your_file_path.docx'
# Text文件路径
text_file_path = 'your_file_path.txt'

# 读取并识别Word文件
word_text = read_word_file(word_file_path)
word_result = recognize_text(word_text)
print(word_result)

# 读取并识别Text文件
text_text = read_text_file(text_file_path)
text_result = recognize_text(text_text)
print(text_result)