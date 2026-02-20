from coreengine.skill_db import SKILL_MAP
import re


section_keyword = {
    "education": [
        "education", "academic background",
        "academic qualifications", "academic history"
    ],
    "experience": [
        "experience", "work experience",
        "professional experience", "work history",
        "employment history"
    ],
    "projects": [
        "projects", "academic projects",
        "personal projects", "project experience"
    ],
    "skills": [
        "skills", "technical skills",
        "skills and expertise", "areas of expertise"
    ],
}
def is_likely_section_header(line:str)->bool:
    stripped=line.strip()
    
    if len(stripped)>50:
         return False
    if any (char.isdigit() for char in stripped):
        return False    
    normalized=re.sub(r'[^\w\s]','',stripped)

    word_count=len(normalized.split())

    if stripped.isupper():
        return True
    
    if 1<=word_count <=4 and "." not in stripped:
        return True
    return False



def detection(text:str)->dict:
    section={key :""for key in section_keyword.keys()}
    current_section=None

    lines=text.split("\n")

    for line in lines:
        stripped_line=line.strip()
        if not stripped_line:
            continue

        normalized_line=re.sub(r'[^\w\s]','',stripped_line).lower()

        if is_likely_section_header(stripped_line):
            for section_name,keyword in section_keyword.items():
                if any(re.search(rf"\b{k}\b", normalized_line) for k in keyword):
                    current_section=section_name
                    break

            continue
        if current_section and  stripped_line:
            section[current_section]+=stripped_line+" "

    return section

def normalize_text(text:str)->str:
    text = text.lower()
    text = re.sub(r"[./_-]", " ", text)    
    text = re.sub(r"[^\w\s]", "", text)     
    text = re.sub(r"\s+", " ", text)   
    return text.strip()


def collapser(text:str)->str:
    return text.replace(" ", "")



def skill_detection(sections:dict)->dict:
    relevant_data=(
        sections.get("skills","")+" "+
        sections.get("experience","")+" "+
        sections.get("projects","")
    )
    if not  relevant_data:
        return {}
    # text_lower=relevant_data.lower()
    # text_lower = re.sub(r"[-/]", " ", text_lower)
    # text_lower = re.sub(r"\s+", " ", text_lower)
    # # text_lower=normalize_text(relevant_data)
    # # text_lower=collapser(text_lower)
    # soft_text=normalize_text(relevant_data)
    # hard_text=collapser(soft_text)
    # detected_skill={}

    # for category, skills in SKILL_MAP.items():
    #     category_result = {}

    #     for canonical, variants in skills.items():
    #         count = 0
    #         matched = False

    #         for variant in variants:
    #             variant_normalized = normalize_text(variant)
    #             variant_collapsed = collapser(variant_normalized)

    #             if variant_normalized in soft_text or variant_collapsed in hard_text:
    #                 count += 1
    #                 matched = True

    #     #     for variant in variants:
    #     #         pattern = rf"\b{re.escape(variant.lower())}\b"
    #     #         matches = re.findall(pattern, text_lower)
    #     #         count += len(matches)

    #     #     if count > 0:
    #     #         category_result[canonical] = count

    #     # if category_result:
    #     #     detected_skill[category] = category_result

    soft_text=normalize_text(relevant_data)
    tokens = soft_text.split()
    collapsed_tokens = [collapser(t) for t in tokens]
    detected_skill={}

    for category, skills in SKILL_MAP.items():
        category_result={}

        for canonical, variants in skills.items():
            count=0
            matched=False

            for variant in variants:
                soft_variant=normalize_text(variant)

                pattern = rf"\b{re.escape(soft_variant)}\b"
                matches = re.findall(pattern, soft_text)

                if matches:
                    count += len(matches)
                    matched = True
                    break
            if not matched:
                for variant in variants:
                    soft_variant=normalize_text(variant)
                    hard_variant=collapser(soft_variant)

                    if len(hard_variant)<=3:
                        continue
                    if hard_variant in collapsed_tokens:
                            count += 1
                            break
            if count > 0:
                category_result[canonical] = count

        if category_result:
            detected_skill[category] = category_result
    return detected_skill


def experience_signal_detection(text:str)->dict:
    if not text:
        return {}
    
    text_lower=text.lower()
    years_matches = re.findall(r'(\d+)\+?\s+years', text_lower)
    years_experience = max([int(y) for y in years_matches], default=0)

    percent_count = len(re.findall(r'\d+%', text_lower))

    leadership_keywords = [
        "lead", "senior", "architect",
        "managed", "team lead", "mentored"
    ]
    leadership_count = sum(text_lower.count(k) for k in leadership_keywords)

    deployment_keywords = [
        "deployed", "production", "scalable",
        "performance", "optimized", "cloud"
    ]
    deployment_count = sum(text_lower.count(k) for k in deployment_keywords)

    return {
        "years_experience": years_experience,
        "impact_mentions": percent_count,
        "leadership_mentions": leadership_count,
        "deployment_mentions": deployment_count
    }