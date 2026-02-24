from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date, datetime


class ExerciseCreate(BaseModel):
    name: str = Field(..., max_length=100)
    sets: Optional[int] = Field(None, ge=0)
    reps: Optional[int] = Field(None, ge=0)
    weight_kg: Optional[float] = Field(None, ge=0)
    muscle_group: Optional[str] = Field(None, max_length=50)


class WorkoutCreate(BaseModel):
    title: str = Field(..., max_length=100)
    date: Optional[date]
    duration_minutes: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = Field(None, max_length=1000)
    exercises: List[ExerciseCreate] = []


class Exercise(BaseModel):
    id: str
    workout_id: str
    name: str
    sets: Optional[int]
    reps: Optional[int]
    weight_kg: Optional[float]
    muscle_group: Optional[str]

    class Config:
        orm_mode = True


class Workout(BaseModel):
    id: str
    user_id: str
    title: str
    date: date
    duration_minutes: Optional[int]
    notes: Optional[str]
    created_at: datetime
    exercises: List[Exercise] = []

    class Config:
        orm_mode = True



class User(BaseModel):
    id: str
    email: Optional[str]


class AIResponse(BaseModel):
    summary: str
    strengths: List[str]
    improvements: List[str]
    next_session_tips: Optional[str]
    overall_score: int = Field(..., ge=1, le=10)


class AIAnalysis(BaseModel):
    id: str
    workout_id: str
    user_id: str
    summary: str
    strengths: List[str]
    improvements: List[str]
    next_session_tips: Optional[str]
    overall_score: int = Field(..., ge=1, le=10)
    created_at: datetime

    class Config:
        orm_mode = True
