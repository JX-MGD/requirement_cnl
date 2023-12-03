from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render


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
