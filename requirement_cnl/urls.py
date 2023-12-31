"""
URL configuration for requirement_cnl project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from requirement_cnl import views

# 路由url
urlpatterns = [
    path('admin/', admin.site.urls),
    path('hello/', views.hello),
    path('homepage/', views.homepage),
    path('nlp_request/', views.nlp_request),
    path('nlp_response/', views.nlp_response),
    # 工具主页
    path('index/', views.index),
    # 处理需求文本
    path('upload_file/', views.upload_file, name='upload_file'),
    # 上传文件
    path('upload_docx_or_textfile/', views.upload_docx_or_textfile),

]

