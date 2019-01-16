from app import app
from flask import render_template
import json


@app.route('/test')
def test():
    data = {}
    data["a"] = "a"
    return json.dumps(data)

@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/forms')
def route():
    return render_template('forms.html')
# @app.route('/index')
# def index():
#     user = {'username': 'Miguel'}
#     return render_template('index.html', title='Home', user=user)

@app.route('/predict')
def predict():
    num = Request.args.get('num')
    list = Request.args.get('list')
    size =  Request.args.get('size')
    return json
