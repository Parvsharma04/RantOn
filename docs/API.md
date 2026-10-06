# HTTP API

The Express API listens at `http://localhost:8000` by default. Prefix application routes with `/api`. Requests and JSON responses use `Content-Type: application/json` unless the endpoint is explicitly identified as plain text. No endpoint currently defines query parameters.

## Authentication

`POST /api/users/auth` accepts a Firebase Authentication ID token, verifies it with Firebase Admin, upserts the local user, and returns an API JWT. Send that JWT on protected requests as `Authorization: Bearer <token>`. The API token expires after seven days.

```http
POST /api/users/auth
Content-Type: application/json

{"idToken":"<FIREBASE_ID_TOKEN>"}
```

Success (`200`):

```json
{
  "user": {
    "u_id": "uuid",
    "firebaseId": "firebase-uid",
    "email": "person@example.com",
    "username": null,
    "displayName": "Person",
    "photoURL": "https://example.com/photo.jpg",
    "createdAt": "2025-03-01T00:00:00.000Z",
    "updatedAt": "2025-03-01T00:00:00.000Z"
  },
  "token": "<API_JWT>"
}
```

`idToken` is required (`400` if omitted). Token verification or account-sync failures return `500 {"error":"Authentication failed"}`.

## Endpoints

| Method and path | Auth | Request | Success response |
| --- | --- | --- | --- |
| `GET /` | No | — | `200` plain text: `server is running`. |
| `GET /api/users` | No | — | `200` plain text: `router working` (route diagnostic). |
| `POST /api/users/auth` | Firebase ID token in JSON | `{ "idToken": string }` | `200` `{ "user": User, "token": string }`. |
| `GET /api/users/:id` | No | `:id` is the user's `u_id` | `200` `{ "u_id", "displayName", "username", "photoURL" }`; `404` if absent. |
| `GET /api/rants` | No | — | Currently `200` plain text: `Rants route is working!` (see route note below). |
| `GET /api/rants/:id` | No | `:id` is the rant's `r_id` | `200` rant with `comments` and `likes` arrays; `null` if absent. |
| `POST /api/rants` | API JWT | `{ "title": string, "content": string }` | `200` created `Rant`; author is taken from the JWT. |
| `DELETE /api/rants/:id` | API JWT | `:id` is the rant's `r_id` | `200` `{ "message": "Rant deleted" }`; deletion is limited to its author. |
| `GET /api/likes` | No | — | `200` plain text: `Rants route is working!` (route diagnostic). |
| `POST /api/likes/rants/:id/like` | API JWT | `:id` is the rant's `r_id` | `200` created `Like`. |
| `DELETE /api/likes/rants/:id/like` | API JWT | `:id` is the rant's `r_id` | `200` `{ "message": "Unliked" }`. |
| `GET /api/comments` | No | — | `200` plain text: `Rants route is working!` (route diagnostic). |
| `GET /api/comments/rants/:id/comments` | No | `:id` is the rant's `r_id` | `200` array of comments, each including `commentedBy`. |
| `POST /api/comments/rants/:id/comments` | API JWT | `{ "content": string }`; `:id` is the rant's `r_id` | `200` created `Comment`; rant and author are taken from the path and JWT. |
| `DELETE /api/comments/:id` | API JWT | `:id` is the comment's `c_id` | `200` `{ "message": "Comment deleted" }`; deletion is limited to its author. |

**Route-order note:** `GET /api/rants` is registered twice. The first route sends the diagnostic text and ends the response, so the later `getAllRants` handler is unreachable at this path. Although that controller is implemented, there is currently no working all-rants listing endpoint.

## Data shapes

- **User** — `u_id`, `firebaseId`, `email`, `username`, `displayName`, `photoURL`, `createdAt`, `updatedAt`. `username`, `displayName`, and `photoURL` may be `null`; timestamps are ISO-8601 strings. Authentication upserts currently set absent email/name/photo values to empty strings.
- **Rant** — `r_id`, `title`, `content`, `authorId`, plus requested relation arrays. A title must be unique per author. `GET /api/rants/:id` includes `comments` and `likes`, but not `author`; the intended list controller includes `author` and `likes`.
- **Comment** — `c_id`, `content`, `createdAt`, `updatedAt`, `rantId`, `commentedById`. The comment-list endpoint also includes the full `commentedBy` User record.
- **Like** — `l_id`, `likedRantId`, `likedById`. A user can like a given rant only once.

The route handlers return Prisma records directly, so relation objects and scalar fields follow the Prisma schema in `backend/prisma/schema.prisma`. Successful handlers use Express's default `200` status. Most database errors return `500` with `{ "error": "<message>" }`; authentication middleware returns `401` for absent, invalid, or expired JWTs. The API does not currently define a consistent validation/error schema.

## curl examples

Set `API` to the API root (including `/api`) and provide a Firebase ID token obtained through Firebase Authentication:

```bash
API=http://localhost:8000/api
FIREBASE_ID_TOKEN='<firebase-id-token>'

curl -i http://localhost:8000/
curl -i "$API/users"
curl -i -X POST "$API/users/auth" \
  -H 'Content-Type: application/json' \
  -d "{\"idToken\":\"$FIREBASE_ID_TOKEN\"}"
```

Copy the returned `token` into `JWT`, then use it for protected routes:

```bash
JWT='<api-jwt>'

curl -i "$API/users/<user-uuid>"
curl -i -X POST "$API/rants" \
  -H "Authorization: Bearer $JWT" \
  -H 'Content-Type: application/json' \
  -d '{"title":"A first rant","content":"The discussion starts here."}'
curl -i "$API/rants/<rant-uuid>"
curl -i "$API/comments/rants/<rant-uuid>/comments"
curl -i -X POST "$API/comments/rants/<rant-uuid>/comments" \
  -H "Authorization: Bearer $JWT" \
  -H 'Content-Type: application/json' \
  -d '{"content":"Thanks for sharing your view."}'
curl -i -X POST "$API/likes/rants/<rant-uuid>/like" \
  -H "Authorization: Bearer $JWT"
curl -i -X DELETE "$API/likes/rants/<rant-uuid>/like" \
  -H "Authorization: Bearer $JWT"
curl -i -X DELETE "$API/comments/<comment-uuid>" \
  -H "Authorization: Bearer $JWT"
curl -i -X DELETE "$API/rants/<rant-uuid>" \
  -H "Authorization: Bearer $JWT"
```

`GET "$API/rants"` currently returns the diagnostic text described above, not the list controller's expected array.
