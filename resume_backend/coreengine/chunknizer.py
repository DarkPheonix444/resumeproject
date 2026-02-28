import re 
from typing import List

class chunkingerror(Exception):
    pass


def chunk_text(text:str,max_chars:int=300)->List[str]:
    if not isinstance(text,str):
        raise chunkingerror("Input must be a string.")
    
    if not isinstance(max_chars,int) or max_chars<=0:
        raise chunkingerror("max_chars must be a positive integer.")
    

    text=text.strip()

    if not text:
        raise ValueError("Input text cannot be empty.")
    
    try:
       
        text = re.sub(r'\s+', ' ', text)
        sentences = re.split(r'(?<=[.!?])\s+', text)


        chunks=[]
        current_chunk=""

        for sentence in sentences:
            sentence=sentence.strip()

            if len(sentence)>max_chars:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk=""
                start=0
                while start<len(sentence):
                    end=min(start+max_chars,len(sentence))
                    chunks.append(sentence[start:end].strip())
                    start=end

                continue
            if len(current_chunk)+len(sentence)+(1 if current_chunk else 0)<=max_chars:
                current_chunk+=" "+sentence if current_chunk else sentence
            else:
                chunks.append(current_chunk.strip())
                current_chunk=sentence
            
        if current_chunk:
            chunks.append(current_chunk.strip())
        return chunks

    except Exception as e:
         raise chunkingerror("Chunking process failed") from e