import os
from urllib import response
import xml.etree.ElementTree as ET
from xml.dom import minidom
import json

INVOCATION_TAG = "invokacija"
EXVOCATION_TAG = "eksvokacija"
INVOCATION_GREETING_TAG = "invokacijski_pozdrav"
INVOCATION_RESPONSE_TAG = "invokacijski_odzdrav"
EXVOCATION_GREETING_TAG = "eksvokacijski_pozdrav"
EXVOCATION_RESPONSE_TAG = "eksvokacijski_odzdrav"
XML_DICTIONARY_FILE_NAME = "data/pozz-odzz.xml"

class DictionaryModel:

    # Situation is an xml element from root
    def __init__(self, situation):
        self.attributes = {}
        self.situation = situation
        self.invocations, self.exvocations = self.return_invocations_exvocations()
        
        self.invocation_greetings, self.invocation_responses = self.return_invocation_elements()
        self.exvocation_greetings, self.exvocation_responses = self.return_exvocation_elements()

        self.keys = set(self.attributes.keys())

    def return_invocations_exvocations(self):

        for key in self.situation.attrib.keys():
            self.attributes[key] = self.situation.attrib[key]

        if not (self.situation.find(INVOCATION_TAG)):
            invocations = None
        else:
            invocations= self.situation.findall(INVOCATION_TAG)
            for invocation in invocations:
                for key in invocation.attrib.keys():
                    self.attributes[key] = invocation.attrib[key]
            
        if not (self.situation.find(EXVOCATION_TAG)):
            exvocations = None
        else:
            exvocations =  self.situation.findall(EXVOCATION_TAG)
            for exvocation in exvocations:
                for key in exvocation.attrib.keys():
                    self.attributes[key] = exvocation.attrib[key]

        return invocations, exvocations
        
    def return_invocation_elements(self):
        greetings = []
        responses = []
        if self.invocations is not None:
            for invocation in self.invocations:
                for invocation_element in invocation:
                # Nije dobro jer su tu jos pozdravi/odzdravi
                    for element in invocation_element:
                        for key in element.attrib.keys():
                            self.attributes[key] = element.attrib[key]
                    if invocation_element.tag == INVOCATION_GREETING_TAG:
                        greetings.append(invocation_element)
                    else:
                        responses.append(invocation_element)
        return greetings, responses

    def return_exvocation_elements(self):
        greetings = []
        responses = []
        if self.exvocations is not None:
            for exvocation in self.exvocations:
                for exvocation_element in exvocation:
                    for element in exvocation_element:
                        for key in element.attrib.keys():
                            self.attributes[key] = element.attrib[key]
                    if exvocation_element.tag == EXVOCATION_GREETING_TAG:
                        greetings.append(exvocation_element)
                    else:
                        responses.append(exvocation_element)
        return greetings, responses

def open_file_fill_dictionary(file):
    f = open(file, "r", encoding='utf-8')
    tree = ET.parse(f)
    root = tree.getroot()
    dictionary_model_list = []

    for child in root:
        if len(child) > 0:
            dictionary_model_list.append(DictionaryModel(child))
    return dictionary_model_list

def return_attributes(dictionary_model_list):
    dicts = {}
    keys = set()
    for model in dictionary_model_list:
        keys.update(model.keys)

    for model in dictionary_model_list:
        for key in keys:
            try:
                if key in model.keys:
                    if model.attributes[key] is not None:
                        if key not in dicts.keys():
                            dicts[key] = {model.attributes[key]}
                        else: 
                            tmp = dicts[key]
                            tmp.add(model.attributes[key])
                            dicts[key] = tmp
            except Exception as e:
                # print(key)
                ...
    return dicts

def return_entries():
    script_path = os.path.dirname(os.path.abspath(__file__))
    xml_dictionary_path = os.path.join(script_path, XML_DICTIONARY_FILE_NAME)
    dictionary_model_list = open_file_fill_dictionary(xml_dictionary_path)
    attributes_dictionary = return_attributes(dictionary_model_list)
    entries = {}

    for entry in dictionary_model_list:
        entry_attributes = {}
        if entry.invocations is not None:
            for key in entry.situation.attrib.keys():
                entry_attributes[key] = entry.situation.attrib[key]

            if len(entry.invocation_greetings) > 0:
                for invocation_greeting in entry.invocation_greetings:
                    attributes = {}
                    for invocation_element in invocation_greeting:
                        if invocation_element.tag =="ip_verbalni":
                            attributes["pozdrav"] = invocation_element.text

                            for key in invocation_element.attrib.keys():
                                attributes[key] = invocation_element.attrib[key]
                        else:
                            
                            for key in invocation_element.attrib.keys():
                                attributes[key] = invocation_element.attrib[key]
                            entry_attributes["inv_poz"] = attributes
            
            if len(entry.invocation_responses) > 0:
                for invocation_response in entry.invocation_responses:
                    attributes = {}
                    for invocation_element in invocation_response:
                        if invocation_element.tag == "io_verbalni":
                            attributes["odgovor"] = invocation_element.text

                        for key in invocation_element.attrib.keys():
                            attributes[key] = invocation_element.attrib[key]
                        entry_attributes["inv_odz"] = attributes

        if entry.exvocations is not None:
            for entry_exvocation in entry.exvocations:
                if "zamjena_sudionika" in entry_exvocation.attrib.keys():
                    entry_attributes["zamjena_sudionika"] = entry_exvocation.attrib["zamjena_sudionika"]
            if len(entry.exvocation_greetings) > 0:
                for exvocation_greeting in entry.exvocation_greetings:
                    attributes = {}
                    for exvocation_element in exvocation_greeting:
                        if exvocation_element.tag == "ep_verbalni":
                            attributes["pozdrav"] = exvocation_element.text
                        for key in exvocation_element.attrib.keys():
                            attributes[key] = exvocation_element.attrib[key]
                        entry_attributes["exv_poz"] = attributes
            if len(entry.exvocation_responses) > 0:
                for exvocation_response in entry.exvocation_responses:
                    attributes = {}
                    for exvocation_element in exvocation_response:
                        if exvocation_element.tag == "eo_verbalni":
                            attributes["odgovor"] = exvocation_element.text
                        for key in exvocation_element.attrib.keys():
                            attributes[key] = exvocation_element.attrib[key]
                        entry_attributes["exv_odz"] = attributes

            entries[entry.attributes["entryID"]] = entry_attributes
    return entries
        

def main():
    script_path = os.path.dirname(os.path.abspath(__file__))
    xml_dictionary_path = os.path.join(script_path, XML_DICTIONARY_FILE_NAME)
    dictionary_model_list = open_file_fill_dictionary(xml_dictionary_path)
    attributes_dictionary = return_attributes(dictionary_model_list)
    return attributes_dictionary.keys()