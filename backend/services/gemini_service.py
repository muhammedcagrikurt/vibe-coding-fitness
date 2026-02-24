import os
import json
import logging
from google import generativeai

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_KEY:
    generativeai.configure(api_key=GEMINI_KEY)
else:
    # no key -- analysis will be stubbed
    pass

MODEL = "gemini-1.5-flash"

logger = logging.getLogger(__name__)


from ..models.schemas import AIResponse

def analyze_workout(workout_payload: dict) -> dict:
    """Send workout data to Gemini and parse the expected JSON response."""
    prompt_template = (
        "You are an expert personal fitness coach. Analyze this workout and respond ONLY with valid JSON matching this exact schema: "
        "{ summary: string, strengths: string[], improvements: string[], next_session_tips: string, overall_score: number between 1 and 10 }. "
        "Workout data: {workout_json}"
    )
    prompt = prompt_template.replace("{workout_json}", json.dumps(workout_payload))

    if not GEMINI_KEY:
        # return dummy analysis
        return {
            "summary": "No AI key configured",
            "strengths": [],
            "improvements": [],
            "next_session_tips": "",
            "overall_score": 5,
        }
    for attempt in range(2):
        try:
            resp = generativeai.responses.create(
                model=MODEL,
                input=prompt,
            )
            text = resp.output[0].content[0].text
            # parse JSON out of text
            result = json.loads(text)
            # validate
            AIResponse(**result)
            return result
        except Exception as e:
            logger.exception("Error parsing or validating Gemini response, attempt %s", attempt)
            if attempt == 0:
                # tighten prompt
                prompt = (
                    "You are an expert personal fitness coach. Respond ONLY with valid JSON exactly matching schema below. "
                    "Do not include any additional text. Schema: { summary: string, strengths: string[], improvements: string[], next_session_tips: string, overall_score: number between 1 and 10 }. "
                    "Workout data: {workout_json}"
                ).replace("{workout_json}", json.dumps(workout_payload))
                continue
            # if validation still fails, propagate
            raise


def weekly_summary(workouts_payload: list) -> str:
    prompt = (
        "You are a personal fitness coach. Given the following last 7 days of workouts (including exercises), write a concise weekly progress narrative. "
        "Workout history: {history}"
    ).replace("{history}", json.dumps(workouts_payload))
    if not GEMINI_KEY:
        return "No AI key configured, unable to generate summary."
    resp = generativeai.responses.create(model=MODEL, input=prompt)
    return resp.output[0].content[0].text
