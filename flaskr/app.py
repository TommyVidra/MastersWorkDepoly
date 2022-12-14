import os
import json
import sys
script_path = os.path.dirname(os.path.abspath(__file__))
sys.path.append(script_path)
import xml_reader 
from flask import Flask, render_template, request
from werkzeug.utils import secure_filename

class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)

# Create and configure app
script_path = os.path.dirname(os.path.abspath(__file__))
templates_path = os.path.join(script_path, "templates")
app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = "test_upload"
ALLOWED_EXTENSIONS = 'xml'

def save_file(file):
    if file.filename.rsplit(".")[1] in ALLOWED_EXTENSIONS:
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    else:
        raise Exception("Pogrešna datoteka je prenesena, mora biti tipa xml")

@app.route('/uploader', methods = ['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            return 'Nema prenesene datoteke!'
        file = request.files['file']
        if file.filename == '':
            return 'Nije odabrana datoteka'
        try:
            save_file(file)
            return 'Unesen je riječnik!'
        except Exception as e:
            return 'Dogodila se greška '+ str(e)

@app.route("/return")
def return_entries():
    list_dictionary = xml_reader.return_entries()
    list_dictionary = json.dumps(list_dictionary, cls=SetEncoder, sort_keys=True, ensure_ascii=False)
    return list_dictionary

@app.route("/dict", methods=['GET'])
def return_dict():
    dictionary_attributes= set(xml_reader.main())
    json_dictionary_attributes = json.dumps(dictionary_attributes, cls=SetEncoder, sort_keys=True, ensure_ascii=False)
    return json_dictionary_attributes

@app.route("/")
def starting_page():
    
    return render_template('home.html')