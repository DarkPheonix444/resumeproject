import fitz
import docx
import os
import re

def clean_text(text):  
    text=text.replace('\xa0',' ')
    text=re.sub(r'\r\n|\r', '\n', text)
    text=re.sub(r'[ \t]+', ' ', text)
    text=re.sub(r'\n\s*\n+', '\n\n', text) 
    return text.strip()



def extract_text_pdf(file_path):
    # if not os.path.exists(file_path):
    #     raise FileNotFoundError(f"File not found: {file_path}")
    text=''
    try:
        with fitz.open(file_path) as doc:
            for page in doc:
                text+=page.get_text("text")
    except Exception as e:        
        raise RuntimeError(f"Error processing PDF file: {e}")
    return text



def extract_text_doc(file_path):
    # if not os.path.exists(file_path):
    #     raise FileNotFoundError(f"File not found: {file_path}")
    text=""
    try:
        para=docx.Document(file_path)

        for p in para.paragraphs:
            text+=p.text+'\n'
    except Exception as e:        
        raise RuntimeError(f"Error processing DOCX file: {e}")
    # para.close()
    return text



def extract(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    _,ext=os.path.splitext(file_path)
    ext=ext.lower()


    if ext=='.pdf':
        text=extract_text_pdf(file_path)
    elif ext=='.docx':
        text=extract_text_doc(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")

    return clean_text(text)
