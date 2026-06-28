# todos-social

## Current progress

- /auth: +0ms
  - /auth/register, POST route +1ms
  - /auth/login, POST route +0ms
  - /auth/me, GET route +1ms
  - /auth/refresh, POST route +0ms
  - /auth/logout, POST route +0ms
- /users: +0ms
  - /users/me, GET route +0ms
  - /users/me, PATCH route +1ms
  - /users/:username, GET route +0ms
- /friends: +0ms
  - /friends/requests/:username, POST route +1ms
  - /friends/requests/incoming, GET route +0ms
  - /friends/requests/outgoing, GET route +0ms
  - /friends/:id/accept, POST route +0ms
  - /friends/:id/reject, POST route +0ms
  - /friends, GET route +0ms
  - /friends/status/:username, GET route +1ms
- /todos: +0ms
  - /todos, POST route +0ms
  - /todos, GET route +0ms
- Nest application successfully started +80ms
