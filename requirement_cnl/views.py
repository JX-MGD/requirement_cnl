from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from docx import Document
import os
from hanlp_restful import HanLPClient

# 导入mgd.mgd.hanlp_test的match, tojson
from mgd.mgd.hanlp_test import match, tojson,togojsjson





# 视图函数Views


def hello(request):
    return HttpResponse("Hello world ! ")


def homepage(request):
    pass
    # 返回相应的response
    return HttpResponse("homepage")


def nlp_request(request):
    print("nlp_request")
    # 返回相应的response
    return HttpResponse("nlp_request")


def nlp_response(request):
    print("nlp_response")
    # 返回相应的response

    return JsonResponse({"code": 200, "msg": "success", "data": "nlp_response"})


def index(request):
    return render(request, 'views/RequirementModel.html')

@csrf_exempt
def upload_docx_or_textfile(request):
    if request.method == 'POST':
        # 处理上传的文件
        # ...
        print("接收到了上传文件")
        print("upload_docx_or_textfile")
        print(request.FILES)

        # 获取上传的文件
        uploaded_file = request.FILES['file']  # 'file' 是文件输入字段的名称

        # 获取文件扩展名
        file_extension = os.path.splitext(uploaded_file.name)[1]
        # 识别出来的类列表
        class_list = []
        relationship_list = []

        # 根据文件类型处理文件内容
        if file_extension == '.txt':
            # TXT 文件，直接读取文件内容
            file_content = uploaded_file.read().decode('utf-8')
        elif file_extension == '.docx':
            # Word 文件，使用 python-docx 库读取文件内容
            doc = Document(uploaded_file)
            file_content = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
        else:
            # 不支持的文件类型
            return JsonResponse({'error': 'Invalid file type'}, status=400)


        print("file_contont"+file_content)
        HanLP = HanLPClient('https://www.hanlp.com/api', auth="MzEzMkBiYnMuaGFubHAuY29tOjVyM2Eya1ZLTmxqbW1Gb00=",
                            language='zh')  # auth不填则匿名，zh中文，mul多语种
        doc = HanLP.parse(file_content, tasks=["dep", "pos"])
        # 使用你的 match 方法处理文件内容
        match(doc,class_list,relationship_list)
        json_data = togojsjson(class_list, relationship_list)
        print("json_data:"+json_data)


        # 返回 JSON 数据
        return JsonResponse(json_data,safe=False)

    # 如果不是 POST 请求，返回一个错误响应
    return JsonResponse({'error': 'Invalid request'}, status=400)