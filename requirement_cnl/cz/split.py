import re

def split_sentences(text):
    # 使用正则表达式匹配标点符号来分句
    sentences = re.split(r'[;]', text)
    # 去除空句子
    sentences = [sentence.strip() for sentence in sentences if sentence.strip()]
     # 打印分句结果
    for i, sentence in enumerate(sentences, 1):
        print(f"句子 {i}: {sentence}")
    return sentences
