import sys
import httpx

BASE_URL = "http://localhost:5000/api/v1"

def run_tests():
    print("--- Starting FastAPI Backend Integration Tests ---\n")

    client = httpx.Client(timeout=10.0)

    # Test 1: Register Client A
    print("1. Testing POST /clients (Register Tenant A)...")
    res_client_a = client.post(f"{BASE_URL}/clients", json={"name": "FastAPI Enterprise", "email": "admin@fastapi.corp"})
    assert res_client_a.status_code == 201, f"Client A registration failed: {res_client_a.text}"
    data_client_a = res_client_a.json()
    assert "client_id" in data_client_a and "client_secret" in data_client_a
    client_id_a = data_client_a["client_id"]
    client_secret_a = data_client_a["client_secret"]
    print(f"[OK] Tenant A created: {client_id_a}")

    # Test 2: Auth Token Exchange
    print("\n2. Testing POST /auth/token (Obtain JWT for Tenant A)...")
    res_token_a = client.post(f"{BASE_URL}/auth/token", json={
        "client_id": client_id_a,
        "client_secret": client_secret_a,
    })
    assert res_token_a.status_code == 200, f"Token exchange failed: {res_token_a.text}"
    data_token_a = res_token_a.json()
    token_a = data_token_a["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    print("[OK] JWT Token obtained for Tenant A")

    # Test 3: Create User for Tenant A
    print("\n3. Testing POST /users (Create User for Tenant A)...")
    res_user_1 = client.post(f"{BASE_URL}/users", headers=headers_a, json={
        "name": "Sarah Connor",
        "email": "sarah@fastapi.corp",
        "role": "admin",
        "status": "active",
    })
    assert res_user_1.status_code == 201, f"User 1 create failed: {res_user_1.text}"
    user_1 = res_user_1.json()
    user_1_id = user_1["_id"]
    print(f"[OK] User created: {user_1_id} {user_1['name']}")

    # Create second user for Tenant A
    res_user_2 = client.post(f"{BASE_URL}/users", headers=headers_a, json={
        "name": "John Connor",
        "email": "john@fastapi.corp",
        "role": "member",
        "status": "pending",
    })
    assert res_user_2.status_code == 201, f"User 2 create failed: {res_user_2.text}"
    print("[OK] Second user created for Tenant A")

    # Test 4: List Users with Search and Status Filters
    print("\n4. Testing GET /users with filters...")
    res_list = client.get(f"{BASE_URL}/users", headers=headers_a)
    assert res_list.status_code == 200
    data_list = res_list.json()
    assert data_list["total"] >= 2
    print(f"[OK] Total users returned: {data_list['total']}")

    res_search = client.get(f"{BASE_URL}/users?search=sarah", headers=headers_a)
    assert res_search.status_code == 200
    data_search = res_search.json()
    assert len(data_search["users"]) == 1
    print(f"[OK] Filter ?search=sarah returned: {len(data_search['users'])} user(s)")

    res_status = client.get(f"{BASE_URL}/users?status=pending", headers=headers_a)
    assert res_status.status_code == 200
    data_status = res_status.json()
    assert len(data_status["users"]) == 1
    print(f"[OK] Filter ?status=pending returned: {len(data_status['users'])} user(s)")

    # Test 5: Get User by ID
    print("\n5. Testing GET /users/{id}...")
    res_get = client.get(f"{BASE_URL}/users/{user_1_id}", headers=headers_a)
    assert res_get.status_code == 200
    assert res_get.json()["_id"] == user_1_id
    print(f"[OK] Retrieved user successfully: {res_get.json()['name']}")

    # Test 6: Update User
    print("\n6. Testing PUT /users/{id}...")
    res_update = client.put(f"{BASE_URL}/users/{user_1_id}", headers=headers_a, json={
        "name": "Sarah J. Connor",
        "role": "admin",
    })
    assert res_update.status_code == 200
    assert res_update.json()["name"] == "Sarah J. Connor"
    print(f"[OK] User updated to: {res_update.json()['name']}")

    # Test 7: Hard Multi-Tenant Isolation
    print("\n7. Testing Hard Multi-Tenant Isolation with Tenant B...")
    res_client_b = client.post(f"{BASE_URL}/clients", json={"name": "Cyberdyne Systems", "email": "info@cyberdyne.com"})
    assert res_client_b.status_code == 201
    data_client_b = res_client_b.json()

    res_token_b = client.post(f"{BASE_URL}/auth/token", json={
        "client_id": data_client_b["client_id"],
        "client_secret": data_client_b["client_secret"],
    })
    assert res_token_b.status_code == 200
    headers_b = {"Authorization": f"Bearer {res_token_b.json()['access_token']}"}

    # Attempt cross-tenant access to Tenant A's user using Tenant B's token
    res_cross = client.get(f"{BASE_URL}/users/{user_1_id}", headers=headers_b)
    assert res_cross.status_code == 404, f"Security breach! Expected 404, got {res_cross.status_code}"
    print("[OK] Hard tenant isolation verified: Tenant B cannot access Tenant A user (HTTP 404)")

    res_list_b = client.get(f"{BASE_URL}/users", headers=headers_b)
    assert res_list_b.json()["total"] == 0
    print("[OK] Tenant B user count is 0 (no data leakage)")

    # Test 8: Soft Delete User
    print("\n8. Testing DELETE /users/{id} (Soft delete)...")
    res_del = client.delete(f"{BASE_URL}/users/{user_1_id}", headers=headers_a)
    assert res_del.status_code == 200
    print(f"[OK] User soft-deleted: {res_del.json()['message']}")

    res_list_after = client.get(f"{BASE_URL}/users", headers=headers_a).json()
    assert not any(u["_id"] == user_1_id for u in res_list_after["users"])
    print("[OK] User excluded from active list queries")

    # Test 9: Activity Logs
    print("\n9. Testing GET /activity...")
    res_activity = client.get(f"{BASE_URL}/activity", headers=headers_a)
    assert res_activity.status_code == 200
    data_activity = res_activity.json()
    metrics = data_activity["metrics"]
    print("[OK] Activity telemetry metrics recorded:")
    print(f"  Total requests: {metrics['total_requests']}")
    print(f"  Success rate: {metrics['success_rate_percent']}%")
    print(f"  Recent logs count: {len(data_activity['logs'])}")

    # Test 10: AI Insights
    print("\n10. Testing GET /insights...")
    res_insights = client.get(f"{BASE_URL}/insights", headers=headers_a)
    assert res_insights.status_code == 200
    data_insights = res_insights.json()
    print("[OK] AI Insight generated:")
    print(f"  \"{data_insights['insight']}\"")
    print(f"  Provider: {data_insights['provider']}")

    # Test 11: Swagger Documentation UI
    print("\n11. Testing Swagger Documentation at /api-docs...")
    res_docs = client.get("http://localhost:5000/api-docs")
    assert res_docs.status_code == 200
    print("[OK] Swagger UI is live at http://localhost:5000/api-docs (HTTP 200)")

    print("\n================================================")
    print("ALL 11 FASTAPI INTEGRATION TESTS PASSED!")
    print("================================================\n")

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"\n[ERROR] Test failed: {e}", file=sys.stderr)
        sys.exit(1)
