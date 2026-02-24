from fastapi import APIRouter, Depends, HTTPException, Response
from typing import List
from ..services.supabase_client import supabase
from ..services.auth import get_current_user, User
from ..models import schemas

router = APIRouter(prefix="/workouts", tags=["workouts"])


@router.post("/", response_model=schemas.Workout, status_code=201)
def create_workout(workout: schemas.WorkoutCreate, user: User = Depends(get_current_user)):
    # insert workout
    data = {
        "user_id": user.id,
        "title": workout.title,
        "date": workout.date.isoformat() if workout.date else None,
        "duration_minutes": workout.duration_minutes,
        "notes": workout.notes,
    }
    res = supabase.table("workouts").insert(data).execute()
    if res.error:
        logger = logging.getLogger(__name__)
        logger.error("Supabase insert workout error: %s", res.error)
        raise HTTPException(status_code=400, detail="Failed to create workout")
    created = res.data[0]
    # insert exercises if any, rollback on failure
    try:
        for ex in workout.exercises:
            exdata = ex.dict()
            exdata["workout_id"] = created["id"]
            er = supabase.table("exercises").insert(exdata).execute()
            if er.error:
                raise Exception(er.error)
    except Exception as e:
        # rollback workout
        supabase.table("workouts").delete().eq("id", created["id"]).execute()
        raise HTTPException(status_code=500, detail="Failed to save exercises")
    # fetch full workout with exercises
    full = supabase.table("workouts").select("*, exercises(*)").eq("id", created["id"]).execute()
    return full.data[0]


@router.get("/", response_model=List[schemas.Workout])
def list_workouts(user: User = Depends(get_current_user)):
    res = (
        supabase.table("workouts").select("*, exercises(*)").eq("user_id", user.id).order("date", desc=True)
    ).execute()
    if res.error:
        logger = logging.getLogger(__name__)
        logger.error("Supabase list workouts error: %s", res.error)
        raise HTTPException(status_code=400, detail="Failed to list workouts")
    return res.data


@router.get("/{workout_id}", response_model=schemas.Workout)
def get_workout(workout_id: str, user: User = Depends(get_current_user)):
    res = (
        supabase.table("workouts").select("*, exercises(*)").eq("id", workout_id).eq("user_id", user.id)
    ).execute()
    if res.error:
        logger = logging.getLogger(__name__)
        logger.error("Supabase get workout error: %s", res.error)
        raise HTTPException(status_code=400, detail="Failed to retrieve workout")
    if not res.data:
        raise HTTPException(status_code=404, detail="Workout not found")
    return res.data[0]


@router.delete("/{workout_id}", status_code=204)
def delete_workout(workout_id: str, user: User = Depends(get_current_user)):
    res = (
        supabase.table("workouts").delete().eq("id", workout_id).eq("user_id", user.id).execute()
    )
    if res.error:
        logger = logging.getLogger(__name__)
        logger.error("Supabase delete workout error: %s", res.error)
        raise HTTPException(status_code=400, detail="Failed to delete workout")
    if not res.data:
        raise HTTPException(status_code=404, detail="Workout not found or already deleted")
    return Response(status_code=204)
