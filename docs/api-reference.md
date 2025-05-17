# API Reference

Base URL: `{{api_url}}`  
Exemplo local: `http://localhost:3001`

---

## 🔐 Auth

### POST `/auth/login`

**Request:**
```json
{
  "email": "teste@example.com",
  "password": "Teste123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "message": "Login successful"
  },
  "messages": []
}
```

---

### GET `/auth/validate`

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "message": "Token is valid"
  },
  "messages": []
}
```

---

### GET `/auth/me`

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "id": "cmasfs3ql0001rr6gi2hfypt8",
    "name": "Teste",
    "lastName": "Tester",
    "email": "teste@example.com",
    "role": "TENANT",
    "tenantId": "cmasfs3ql0000rr6gj2kqx0gq",
    "image": null,
    "emailVerifiedAt": null,
    "isTwoFactorEnabled": false,
    "createdAt": "2025-05-17T16:23:11.853Z",
    "updatedAt": "2025-05-17T16:23:11.853Z"
  },
  "messages": []
}
```

---

### POST `/auth/logout`

**Response:**
```json
{
  "message": "Logout successful"
}
```

---

## 🏢 Tenants

### POST `/tenants/create-with-user`

**Request:**
```json
{
  "name": "Example Company",
  "user": {
    "name": "Teste",
    "lastName": "Tester",
    "password": "Teste123",
    "confirm_password": "Teste123",
    "email": "teste@example.com"
  }
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "id": "cmasfs3ql0000rr6gj2kqx0gq",
    "name": "Example Company",
    "slug": "example-company",
    "createdAt": "2025-05-17T16:23:11.853Z",
    "updatedAt": "2025-05-17T16:23:11.853Z",
    "User": [
      {
        "id": "cmasfs3ql0001rr6gi2hfypt8",
        "name": "Teste",
        "lastName": "Tester",
        "role": "TENANT",
        "email": "teste@example.com",
        "password": "$2b$10$bpHypl9LlQBwvLrodbQwT.XrUsiS6ikSf4yUFxdMALyxuzK/o2mGG",
        "taxId": null,
        "tenantId": "cmasfs3ql0000rr6gj2kqx0gq",
        "image": null,
        "emailVerifiedAt": null,
        "isTwoFactorEnabled": false,
        "createdAt": "2025-05-17T16:23:11.853Z",
        "updatedAt": "2025-05-17T16:23:11.853Z"
      }
    ]
  },
  "messages": []
}
```
