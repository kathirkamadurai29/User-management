import os
from dotenv import load_dotenv

env_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
if os.path.exists(env_file):
    load_dotenv(env_file)
else:
    load_dotenv()

from datetime import datetime, timezone
from typing import Dict, Any

is_firebase_initialized = False

try:
    import firebase_admin
    from firebase_admin import credentials, messaging

    cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    project_id = os.getenv("FIREBASE_PROJECT_ID")
    client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
    private_key = os.getenv("FIREBASE_PRIVATE_KEY")

    if cred_path:
        possible_paths = [
            cred_path,
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", cred_path)),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "serviceAccountKey.json")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ServiceAccountKey.json")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ServiceAccountKey.json.json")),
        ]
        found_path = next((p for p in possible_paths if os.path.exists(p)), None)
        if found_path:
            cred = credentials.Certificate(found_path)
            firebase_admin.initialize_app(cred)
            is_firebase_initialized = True
            print(f"[Firebase Admin] Initialized with service account file: {os.path.basename(found_path)}")
    elif project_id and client_email and private_key:
        private_key = private_key.replace("\\n", "\n")
        cred = credentials.Certificate({
            "project_id": project_id,
            "client_email": client_email,
            "private_key": private_key,
        })
        firebase_admin.initialize_app(cred)
        is_firebase_initialized = True
        print("[Firebase Admin] Initialized with environment credentials")
    else:
        print("[Firebase Admin] Credentials not configured. Operating in simulated notification/event mode.")
except Exception as e:
    print(f"[Firebase Admin] Initialization warning: {e}")


async def trigger_user_created_event(user: Dict[str, Any]) -> Dict[str, Any]:
    event_payload = {
        "eventType": "USER_CREATED",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "clientId": user.get("client_id"),
        "userId": str(user.get("_id", user.get("id", ""))),
        "email": user.get("email"),
        "name": user.get("name"),
        "role": user.get("role"),
    }
    print(f"[Firebase Admin Event] Triggered USER_CREATED: {event_payload}")

    if is_firebase_initialized:
        try:
            topic = f"tenant_{user.get('client_id', '').replace('-', '_')}"
            message = messaging.Message(
                topic=topic,
                notification=messaging.Notification(
                    title="New User Registered",
                    body=f"User {user.get('name')} ({user.get('email')}) was added.",
                ),
                data={"eventType": "USER_CREATED", "userId": event_payload["userId"]},
            )
            messaging.send(message)
        except Exception as err:
            print(f"[Firebase Admin] Message delivery warning: {err}")

    return event_payload


async def trigger_user_deleted_event(user: Dict[str, Any]) -> Dict[str, Any]:
    event_payload = {
        "eventType": "USER_DELETED",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "clientId": user.get("client_id"),
        "userId": str(user.get("_id", user.get("id", ""))),
        "email": user.get("email"),
        "name": user.get("name"),
    }
    print(f"[Firebase Admin Event] Triggered USER_DELETED: {event_payload}")

    if is_firebase_initialized:
        try:
            topic = f"tenant_{user.get('client_id', '').replace('-', '_')}"
            message = messaging.Message(
                topic=topic,
                notification=messaging.Notification(
                    title="User Deactivated",
                    body=f"User {user.get('name')} ({user.get('email')}) was deactivated.",
                ),
                data={"eventType": "USER_DELETED", "userId": event_payload["userId"]},
            )
            messaging.send(message)
        except Exception as err:
            print(f"[Firebase Admin] Message delivery warning: {err}")

    return event_payload
