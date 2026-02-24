from fastapi import APIRouter, Depends, HTTPException
from ..services.supabase_client import supabase
from ..services.auth import get_current_user, User
from ..services import gemini_service
from ..models import schemas
from pydantic import ValidationError
from typing import List
import logging

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/analyze/{workout_id}", response_model=schemas.AIAnalysis, status_code=201)
def analyze(workout_id: str, user: User = Depends(get_current_user)):
    # fetch workout + exercises
    res = (
        supabase.table("workouts").select("*, exercises(*)").eq("id", workout_id).execute()
    )
    if res.error:
        logger = logging.getLogger(__name__)
        logger.error("Supabase fetch workout for analysis error: %s", res.error)
        raise HTTPException(status_code=400, detail="Failed to retrieve workout")
    if not res.data:
        # do not reveal existence
        raise HTTPException(status_code=403, detail="Forbidden")
    workout = res.data[0]
    if workout.get("user_id") != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    # call gemini
    try:
        analysis_raw = gemini_service.analyze_workout(workout)
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.exception("Gemini analysis error")
        raise HTTPException(status_code=500, detail="AI service failed")
    # validate structure
    try:
        analysis = schemas.AIResponse(**analysis_raw)
    except ValidationError:
        logger = logging.getLogger(__name__)
        logger.error("Invalid AI response: %s", analysis_raw)
        raise HTTPException(status_code=500, detail="AI service returned unexpected format")
    # upsert into ai_analyses
    payload = {
        "workout_id": workout_id,
        "user_id": user.id,
        "summary": analysis.summary,
        "strengths": analysis.strengths,
        "improvements": analysis.improvements,
        "next_session_tips": analysis.next_session_tips,
        "overall_score": analysis.overall_score,
    }
    up = supabase.table("ai_analyses").upsert(payload, on_conflict="workout_id").execute()
    if up.error:
        logger = logging.getLogger(__name__)
        logger.error("Supabase upsert ai analysis error: %s", up.error)
        raise HTTPException(status_code=500, detail="Failed to save analysis")
    return up.data[0]

@router.get("/analysis/{workout_id}", response_model=schemas.AIAnalysis)
def get_analysis(workout_id: str, user: User = Depends(get_current_user)):
    res = (
        supabase.table("ai_analyses").select("*").eq("workout_id", workout_id).eq("user_id", user.id)
    ).execute()
    if res.error:
        logger = logging.getLogger(__name__)
        logger.error("Supabase get analysis error: %s", res.error)
        raise HTTPException(status_code=400, detail="Failed to retrieve analysis")
    if not res.data:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return res.data[0]

@router.get("/weekly-summary")
def weekly_summary(user: User = Depends(get_current_user)):
    # fetch workouts last 7 days with exercises
    res = (
        supabase.table("workouts").select("*, exercises(*)").eq("user_id", user.id).gte("date", "now() - interval '7 days'")
    ).execute()
    if res.error:
        logger = logging.getLogger(__name__)
        logger.error("Supabase weekly summary fetch error: %s", res.error)
        raise HTTPException(status_code=400, detail="Failed to fetch workouts")
    workouts = res.data
    try:
        narrative = gemini_service.weekly_summary(workouts)
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.exception("Gemini weekly summary error")
        raise HTTPException(status_code=500, detail="AI service failed")
    return {"narrative": narrative}
