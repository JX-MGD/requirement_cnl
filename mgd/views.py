from django.shortcuts import render

# Create your views here.
from django.views.decorators.csrf import csrf_exempt
from docx import Document
import os
from hanlp_test import match, tojson
