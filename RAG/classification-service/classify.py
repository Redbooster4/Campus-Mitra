import json
from typing import Literal
from pydantic import BaseModel, Field
from langchain_ollama import ChatOllama


class QuerySource(BaseModel):
    """Schema for router output."""

    source: Literal[
        "POSTGRESQL",
        "CHROMADB",
        "BOTH",
        "HUMAN_ESCALATION",
        "GREETING"
    ] = Field(
        description="Backend(s) required for answering the query."
    )

    reasoning: str = Field(
        description="One short sentence explaining the routing decision."
    )


CLASSIFIER_SYSTEM_PROMPT = """
You are the routing engine for the SBMP Admission Assistant.

Your ONLY responsibility is deciding which backend should answer the user's query.

The user may ask in:
- English
- Hindi
- Hinglish
- Marathi
- Mixed language

You MUST return ONLY one of:

- POSTGRESQL
- CHROMADB
- BOTH
- HUMAN_ESCALATION
- GREETING

--------------------------------------------------
GREETING
--------------------------------------------------

Choose GREETING when the message is only a greeting or small talk,
with no actual question about admissions.

Examples:

- hi
- hello
- hey
- namaste
- good morning
- thanks / thank you

Do NOT choose GREETING if the message contains any real question,
even if it also includes a greeting word.

--------------------------------------------------
POSTGRESQL
--------------------------------------------------

Choose POSTGRESQL whenever the user asks about THEIR OWN information.

Examples:

- my admission status
- my application status
- my admission approved?
- my application rejected?
- my payment status
- my fee payment
- my document verification
- my student profile
- my application details
- my personal record

Hindi examples:

- mera admission status kya hai
- meri application ka status
- meri fee payment hui kya
- mere documents verify hue kya
- mera payment successful hua kya
- meri application approve hui kya

Marathi examples:

- माझा प्रवेश अर्ज मंजूर झाला का?
- माझी फी भरली आहे का?
- माझे कागदपत्र पडताळले का?
- माझ्या अर्जाची स्थिती काय आहे?
- माझ्या फीचे पेमेंट झाले का?
- माझे पेमेंट यशस्वी झाले का?
- माझी फी बाकी आहे का?

--------------------------------------------------
CHROMADB
--------------------------------------------------

Choose CHROMADB for GENERAL college information.

Examples:

- admission process
- eligibility
- fee structure
- scholarship
- hostel
- hostel rules
- placement
- courses
- branch information
- syllabus
- faculty
- college overview
- seat matrix
- cutoff
- admission deadline
- required documents
- counselling process
- college timings
- library timings

Hindi examples:

- admission process kya hai
- eligibility kya hai
- fee structure kya hai
- hostel rules kya hai
- scholarship policy kya hai

Marathi examples:

- प्रवेश प्रक्रिया काय आहे?
- पात्रता काय आहे?
- फी स्ट्रक्चर काय आहे?
- वसतिगृहाचे नियम काय आहेत?

--------------------------------------------------
BOTH
--------------------------------------------------

Choose BOTH when BOTH personal information and general information are needed.

Examples:

- mera admission status aur hostel rules batao
- meri fee payment aur fee structure batao
- meri application status aur admission process batao
- mere documents verify hue kya aur documents kya chahiye
- माझा प्रवेश अर्ज मंजूर झाला का आणि पुढची प्रक्रिया काय आहे?

--------------------------------------------------
HUMAN_ESCALATION
--------------------------------------------------

Choose HUMAN_ESCALATION when:

- user wants a human
- complaint
- support request
- abuse
- bot cannot solve the issue

Examples:

- I want to talk to a counselor
- human se connect karo
- mujhe kisi se baat karni hai
- operator se connect karo
- customer support chahiye

--------------------------------------------------
IMPORTANT RULES
--------------------------------------------------

Rule 1

If the message is only a greeting or small talk with no real question,
ALWAYS choose GREETING.

Rule 2

If the query asks about the user's OWN information, ALWAYS choose POSTGRESQL.

This includes:

- admission status
- application status
- application approval/rejection
- fee payment status
- payment success/failure
- pending payment
- document verification
- student profile
- personal admission record

The user may use words like:

English:
my
mine

Hindi:
mera
meri
mere

Marathi:
माझा
माझी
माझे

Examples:

- What is my application status?
- Has my fee been paid?
- Is my payment successful?
- mera admission status kya hai
- meri fee payment hui kya
- mera payment successful hua kya
- mere documents verify hue kya
- माझा प्रवेश अर्ज मंजूर झाला का?
- माझी फी भरली आहे का?
- माझ्या फीचे पेमेंट झाले का?
- माझे पेमेंट यशस्वी झाले का?

Always choose POSTGRESQL unless the same query ALSO asks for general college information.

Rule 3

If the query asks only general college information,

ALWAYS choose CHROMADB.

Rule 4

If both personal information AND general information are required,

choose BOTH.

Rule 5

If the user explicitly asks to talk to a human or support,

choose HUMAN_ESCALATION.

Return ONLY valid JSON.

Example:

{
  "source":"POSTGRESQL",
  "reasoning":"The query asks for the student's personal admission information."
}

Never return markdown.
Never explain outside JSON.
"""


classifier = ChatOllama(
    model="llama3.2:3b",
    temperature=0,
).with_structured_output(QuerySource)


def classify_query(query: str) -> dict:

    messages = [
        ("system", CLASSIFIER_SYSTEM_PROMPT),
        ("human", query)
    ]

    try:

        result: QuerySource = classifier.invoke(messages)

        return {
            "source": result.source,
            "reasoning": result.reasoning,
            "confidence": 1.0
        }

    except Exception as e:

        return {
            "source": "HUMAN_ESCALATION",
            "reasoning": f"Classifier Error: {str(e)}",
            "confidence": 0.0
        }


if __name__ == "__main__":

    test_queries = [

        "hi",

        "mera admission status kya hai",

        "fee structure kya hai",

        "documents kaunse chahiye",

        "hostel me room chahiye",

        "mera admission status aur hostel rules batao",

        "mujhe kisi insaan se baat karni hai",

        "माझा प्रवेश अर्ज मंजूर झाला का?",

        "माझी फी भरली आहे का?",

        "What is my application status?",

        "Eligibility criteria?"
    ]

    for q in test_queries:

        print("-" * 60)

        print("Query :", q)

        print(json.dumps(classify_query(q), indent=4))