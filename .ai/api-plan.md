# REST API Plan for FlashGenAI

## 1. Resources

- **Users** - Corresponds to `auth.users` table (managed by Supabase Auth)
- **Flashcard Sets** - Corresponds to `flashcard_sets` table
- **Flashcards** - Corresponds to `flashcards` table
- **Source Texts** - Corresponds to `source_texts` table
- **Generation Limits** - Corresponds to `generation_limits` table
- **Generation Logs** - Corresponds to `generation_logs` table

## 2. Endpoints

### Auth Endpoints

Authentication is handled by Supabase Auth. The API will use Supabase's authentication mechanisms, including:

- Sign up
- Sign in
- Password reset
- Sign out

### User Endpoints

#### GET /api/user/profile

- **Description**: Get the current user's profile information
- **Response Structure**:
  ```json
  {
    "id": "uuid",
    "email": "string",
    "created_at": "timestamp"
  }
  ```
- **Success**: 200 OK
- **Errors**: 
  - 401 Unauthorized - User not authenticated

#### GET /api/user/generation-limit

- **Description**: Get the user's remaining daily generation limit
- **Response Structure**:
  ```json
  {
    "max_daily_limit": 5,
    "used_count": "integer",
    "remaining_count": "integer",
    "reset_at": "timestamp" 
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized - User not authenticated

### Flashcard Sets Endpoints

#### GET /api/flashcard-sets

- **Description**: List all flashcard sets for the authenticated user
- **Query Parameters**:
  - `due` (boolean, optional): Filter sets requiring review
  - `sort` (string, optional): Sort field (created_at, last_reviewed_at, title)
  - `order` (string, optional): Sort order (asc, desc)
  - `page` (integer, optional): Page number for pagination
  - `limit` (integer, optional): Items per page (max 50)
- **Response Structure**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "title": "string",
        "created_at": "timestamp",
        "last_reviewed_at": "timestamp",
        "total_cards_count": "integer",
        "is_due_for_review": "boolean"
      }
    ],
    "pagination": {
      "total": "integer",
      "page": "integer",
      "limit": "integer",
      "total_pages": "integer"
    }
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 400 Bad Request - Invalid query parameters
  - 401 Unauthorized - User not authenticated

#### GET /api/flashcard-sets/{id}

- **Description**: Get a specific flashcard set by ID
- **Response Structure**:
  ```json
  {
    "id": "uuid",
    "title": "string",
    "created_at": "timestamp",
    "last_reviewed_at": "timestamp",
    "total_cards_count": "integer",
    "is_due_for_review": "boolean"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User doesn't own this set
  - 404 Not Found - Set not found

#### POST /api/flashcard-sets

- **Description**: Create a new empty flashcard set
- **Request Structure**:
  ```json
  {
    "title": "string"
  }
  ```
- **Response Structure**:
  ```json
  {
    "id": "uuid",
    "title": "string",
    "created_at": "timestamp",
    "total_cards_count": 0
  }
  ```
- **Success**: 201 Created
- **Errors**:
  - 400 Bad Request - Invalid title (empty or too long)
  - 401 Unauthorized - User not authenticated

#### PATCH /api/flashcard-sets/{id}

- **Description**: Update a flashcard set's title
- **Request Structure**:
  ```json
  {
    "title": "string"
  }
  ```
- **Response Structure**:
  ```json
  {
    "id": "uuid",
    "title": "string",
    "created_at": "timestamp",
    "last_reviewed_at": "timestamp",
    "total_cards_count": "integer"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 400 Bad Request - Invalid title
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User doesn't own this set
  - 404 Not Found - Set not found

#### DELETE /api/flashcard-sets/{id}

- **Description**: Delete a flashcard set and all associated flashcards
- **Success**: 204 No Content
- **Errors**:
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User doesn't own this set
  - 404 Not Found - Set not found

#### POST /api/flashcard-sets/generate

- **Description**: Generate flashcard proposals from source text using AI (Step 1 of the generation process)
- **Request Structure**:
  ```json
  {
    "source_text": "string",
    "title": "string" // Optional, if not provided, AI will suggest one
  }
  ```
- **Response Structure**:
  ```json
  {
    "set_id": "uuid", // Temporary ID for the proposals
    "title": "string",
    "flashcards": [
      {
        "id": "uuid",
        "front_content": "string",
        "back_content": "string",
        "creation_mode": "ai"
      }
    ],
    "created_at": "timestamp",
    "total_cards_count": "integer"
  }
  ```
- **Success**: 201 Created
- **Errors**:
  - 400 Bad Request - Invalid source text (too short, too long)
  - 401 Unauthorized - User not authenticated
  - 429 Too Many Requests - Daily generation limit reached

#### POST /api/flashcard-sets/review

- **Description**: Process user decisions about flashcard proposals and save accepted ones (Step 2 of the generation process)
- **Request Structure**:
  ```json
  {
    "set_id": "uuid", // Temporary ID from generation step
    "title": "string", // Final title (possibly edited by user)
    "source_text": "string", // Original source text
    "accept": ["uuid1", "uuid2"], // IDs of flashcards to accept
    "reject": ["uuid3", "uuid4"] // IDs of flashcards to reject
  }
  ```
- **Response Structure**:
  ```json
  {
    "set_id": "uuid", // Permanent ID of the created set
    "accepted_count": "integer",
    "rejected_count": "integer",
    "success": true
  }
  ```
- **Success**: 201 Created
- **Errors**:
  - 400 Bad Request - Invalid request or no flashcards accepted
  - 401 Unauthorized - User not authenticated

#### POST /api/flashcard-sets/suggest-title

- **Description**: Suggest a title for a flashcard set based on source text
- **Request Structure**:
  ```json
  {
    "source_text": "string"
  }
  ```
- **Response Structure**:
  ```json
  {
    "suggested_title": "string"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 400 Bad Request - Invalid source text (too short, too long)
  - 401 Unauthorized - User not authenticated

### Flashcards Endpoints

#### GET /api/flashcard-sets/{set_id}/flashcards

- **Description**: Get all flashcards in a specific set
- **Query Parameters**:
  - `page` (integer, optional): Page number for pagination
  - `limit` (integer, optional): Items per page (max 100)
- **Response Structure**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "front_content": "string",
        "back_content": "string",
        "creation_mode": "string",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "pagination": {
      "total": "integer",
      "page": "integer",
      "limit": "integer",
      "total_pages": "integer"
    }
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User doesn't own this set
  - 404 Not Found - Set not found

#### GET /api/flashcards/{id}

- **Description**: Get a specific flashcard by ID
- **Response Structure**:
  ```json
  {
    "id": "uuid",
    "set_id": "uuid",
    "front_content": "string",
    "back_content": "string",
    "creation_mode": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User doesn't own this flashcard
  - 404 Not Found - Flashcard not found

#### POST /api/flashcard-sets/{set_id}/flashcards

- **Description**: Create a new flashcard in a set
- **Request Structure**:
  ```json
  {
    "front_content": "string",
    "back_content": "string"
  }
  ```
- **Response Structure**:
  ```json
  {
    "id": "uuid",
    "set_id": "uuid",
    "front_content": "string",
    "back_content": "string",
    "creation_mode": "manual",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success**: 201 Created
- **Errors**:
  - 400 Bad Request - Invalid content
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User doesn't own this set
  - 404 Not Found - Set not found

#### PATCH /api/flashcards/{id}

- **Description**: Update a flashcard
- **Request Structure**:
  ```json
  {
    "front_content": "string",
    "back_content": "string"
  }
  ```
- **Response Structure**:
  ```json
  {
    "id": "uuid",
    "set_id": "uuid",
    "front_content": "string",
    "back_content": "string",
    "creation_mode": "string", // Will be updated to "ai_edited" if originally "ai"
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 400 Bad Request - Invalid content
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User doesn't own this flashcard
  - 404 Not Found - Flashcard not found

#### DELETE /api/flashcards/{id}

- **Description**: Delete a flashcard
- **Success**: 204 No Content
- **Errors**:
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User doesn't own this flashcard
  - 404 Not Found - Flashcard not found

### Source Text Endpoints

#### GET /api/flashcard-sets/{set_id}/source-text

- **Description**: Get the source text for a flashcard set
- **Response Structure**:
  ```json
  {
    "id": "uuid",
    "set_id": "uuid",
    "content": "string",
    "created_at": "timestamp"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User doesn't own this set
  - 404 Not Found - Source text not found for this set

### Generation Logs Endpoints

#### GET /api/generation-logs

- **Description**: Get generation logs for the authenticated user
- **Query Parameters**:
  - `page` (integer, optional): Page number for pagination
  - `limit` (integer, optional): Items per page (max 50)
- **Response Structure**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "set_id": "uuid",
        "set_title": "string",
        "generated_count": "integer",
        "accepted_count": "integer",
        "rejected_count": "integer",
        "generated_at": "timestamp"
      }
    ],
    "pagination": {
      "total": "integer",
      "page": "integer",
      "limit": "integer",
      "total_pages": "integer"
    }
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized - User not authenticated

## 3. Authentication and Authorization

### Authentication Mechanism

The API will use Supabase's built-in authentication system, which provides:

- JWT-based authentication
- Secure password management
- Email verification
- Password reset functionality

The client application will receive a JWT token after successful authentication, which should be included in all subsequent API requests as a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Authorization Implementation

1. **Row-Level Security (RLS)**: Supabase's RLS policies will be used to ensure users can only access their own data.

2. **API-Level Authorization**: Before processing any request, the API will:
   - Validate the JWT token
   - Extract the user ID from the token
   - Ensure the requested resource belongs to the authenticated user

3. **Resource Ownership**:
   - Flashcard sets are owned by the user who created them
   - Flashcards are owned indirectly through the set they belong to
   - Source texts are owned indirectly through the set they belong to
   - Generation limits and logs are associated with a specific user

## 4. Validation and Business Logic

### Data Validation

#### Flashcard Sets
- `title`: Required, non-empty, max 255 characters

#### Flashcards
- `front_content`: Required, non-empty, max 500 characters
- `back_content`: Required, non-empty, max 1000 characters
- `creation_mode`: Must be one of: 'manual', 'ai', 'ai_edited'

#### Source Texts
- `content`: Required, min 1000 characters, max 10000 characters

#### Generation Limits
- `used_count`: Integer between 0 and 5 inclusive

### Business Logic Implementation

1. **Two-Step Flashcard Generation Process**:
   - Step 1: User calls `/api/flashcard-sets/generate` to get AI-generated flashcard proposals
   - Step 2: User reviews proposals and calls `/api/flashcard-sets/review` with their decisions
   - Only accepted flashcards are saved to the database
   - Generation logs are created during the review step to track acceptance rates

2. **Daily Generation Limit**:
   - When a user attempts to generate flashcards, check their remaining daily limit
   - If limit reached, return 429 Too Many Requests
   - If limit not reached, increment used_count after successful generation
   - Reset the limit at midnight in UTC+0 timezone

3. **Flashcard Set Review Logic**:
   - When a set is marked as reviewed, update last_reviewed_at to current time
   - Due sets are determined by a configurable algorithm based on spaced repetition principles
   - The API will check sets that are due for review during user login and provide this information

4. **Flashcard Creation Mode**:
   - Manually created flashcards are marked with creation_mode = 'manual'
   - AI-generated flashcards are marked with creation_mode = 'ai'
   - When an AI-generated flashcard is edited, update creation_mode to 'ai_edited'

5. **Generation Statistics**:
   - During the review step, log the generation session details including:
     - Total number of flashcards generated
     - Number of accepted flashcards
     - Number of rejected flashcards
   - Use these statistics to track the AI generation quality metric

6. **Title Suggestion**:
   - When generating flashcards, if no title is provided, use AI to suggest one
   - The title suggestion API can also be used independently
   - User can modify the suggested title during the review step

7. **Cascading Deletion**:
   - When a flashcard set is deleted, all associated flashcards and source text are deleted
   - The database schema enforces this with ON DELETE CASCADE constraints 