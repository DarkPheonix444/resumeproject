import spacy
import re
from coreengine.skill_db import SKILL_MAP
nlp=spacy.load("en_core_web_sm")

def analyze_spacy(text:str)->dict:


    if not text.strip():
        return {}
    
    doc=nlp(text)

    noun_count=0
    verb_count=0
    org_count=0
    date_count=0

    for token in doc:
        if token.pos_=="NOUN" or token.pos_=="PROPN":
            noun_count+=1
        elif token.pos_=="VERB":
            verb_count+=1

    for ent in doc.ents:
        if ent.label_=="ORG":
            org_count+=1
        elif ent.label_=="DATE":
            date_count+=1
    total_tokens=len(doc)

    return {
        "noun_ratio": noun_count / total_tokens if total_tokens else 0,
        "verb_ratio": verb_count / total_tokens if total_tokens else 0,
        "org_count": org_count,
        "date_count": date_count
    }

def fallback_skill_detection(sections:dict)->dict:
    relevant_data=(
        sections.get("skills","")+" "+
        sections.get("experience","")+" "+
        sections.get("projects","")
    )
    if not relevant_data:
        return {}
    
    text = relevant_data.lower()
    text = re.sub(r"[-/]", " ", text)
    text = re.sub(r"\s+", " ", text)


    doc=nlp(text)

    extracted_phrases=set()

    for chunks in doc.noun_chunks:
        lemma_phrase=" ".join([token.lemma_ for token in chunks]).strip()
        lemma_phrase = re.sub(r"\s+", " ", lemma_phrase)
        extracted_phrases.add(lemma_phrase)

    detected_skill={}
    for category, skills in SKILL_MAP.items():
        category_result = {}

        for canonical, variants in skills.items():
                matched = False

            
                if canonical.replace("_", " ") in extracted_phrases:
                    matched = True

                
                for variant in variants:
                    normalized_variant = variant.lower().strip()
                    normalized_variant = re.sub(r"[-/]", " ", normalized_variant)
                    normalized_variant = re.sub(r"\s+", " ", normalized_variant)

                    if normalized_variant in extracted_phrases:
                        matched = True
                        break

                if matched:
                    category_result[canonical] = 1

        if category_result:
                detected_skill[category] = category_result

    return detected_skill