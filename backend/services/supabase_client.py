import os
import uuid
import datetime
from typing import Any, Dict, List

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# simple in-memory dataset when no real Supabase is configured
class FakeTable:
    def __init__(self, store: List[Dict[str, Any]], parent: "FakeSupabase"):
        self.store = store
        self.parent = parent
        self._filters = []
        self._order = None
        self._select = "*"
        self._delete = False
        self._on_conflict = None

    def insert(self, data):
        rows = data if isinstance(data, list) else [data]
        added = []
        for row in rows:
            new = row.copy()
            new.setdefault("id", str(uuid.uuid4()))
            new.setdefault("created_at", datetime.datetime.utcnow().isoformat())
            added.append(new)
            # handle upsert conflict
            if self._on_conflict:
                key = self._on_conflict
                existing = [r for r in self.store if r.get(key) == new.get(key)]
                if existing:
                    self.store.remove(existing[0])
            self.store.append(new)
        class Res:
            pass
        res = Res()
        res.data = added
        res.error = None
        return res

    def upsert(self, data, on_conflict=None):
        self._on_conflict = on_conflict
        return self.insert(data)

    def select(self, what="*"):
        self._select = what
        return self

    def eq(self, field, value):
        self._filters.append(("eq", field, value))
        return self

    def gte(self, field, value):
        self._filters.append(("gte", field, value))
        return self

    def order(self, field, desc=False):
        self._order = (field, desc)
        return self

    def delete(self):
        self._delete = True
        return self

    def execute(self):
        data = list(self.store)
        for typ, field, val in self._filters:
            if typ == "eq":
                data = [r for r in data if r.get(field) == val]
            elif typ == "gte":
                if isinstance(val, str) and "now()" in val:
                    # ignore, just keep all
                    continue
                data = [r for r in data if r.get(field) >= val]
        if self._delete:
            removed = data[:]
            for r in removed:
                self.store.remove(r)
            result = removed
        else:
            result = data
        if self._order:
            field, desc = self._order
            result.sort(key=lambda r: r.get(field), reverse=desc)
        # handle simple relationship for workouts->exercises
        if self._select and "exercises(*)" in self._select:
            if self.store is self.parent._data["workouts"]:
                for r in result:
                    r["exercises"] = [e for e in self.parent._data["exercises"] if e.get("workout_id") == r.get("id")]
        class Res:
            pass
        res = Res()
        res.data = result
        res.error = None
        return res


class FakeAuth:
    def __init__(self):
        self._current = {"user": {"id": "guest", "email": "guest@local"}, "session": {"access_token": "dummy"}}

    def sign_in_with_password(self, creds):
        # ignore creds
        return {"data": {"session": self._current}, "error": None}

    def signUp(self, creds):
        return {"data": {"user": {"id": str(uuid.uuid4()), "email": creds.get("email")}}, "error": None}

    def signOut(self):
        self._current = {"user": None, "session": None}
        return {"error": None}

    def setSession(self, token):
        self._current["session"] = {"access_token": token}
        return {"error": None}

    def session(self):
        return self._current.get("session")

    def user(self):
        return self._current.get("user")

    def onAuthStateChange(self, callback):
        # no-op
        return None


class FakeSupabase:
    def __init__(self):
        self.auth = FakeAuth()
        self._data = {"workouts": [], "exercises": [], "ai_analyses": []}

    def table(self, name):
        if name not in self._data:
            self._data[name] = []
        return FakeTable(self._data[name], self)


if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    # fall back to fake in-memory implementation
    supabase = FakeSupabase()  # type: ignore
else:
    from supabase import create_client, Client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
