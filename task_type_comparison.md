# Task Types Data Architecture & Logic

This document explains the data flow and mapping logic for the three different types of tasks displayed in the Workorio TV application: **Regular (Assigned) Tasks**, **Immediate Tasks**, and **AI Tasks**. 

Because these tasks originate from different database tables, the backend (`TaskApiController.php`) normalizes them into a single, unified JSON structure so the frontend (`TaskCard.tsx`) can render them consistently.

---

## High-Level Comparison Table

| Field / Column | **Regular Tasks** (`tasks`) | **Immediate Tasks** (`immediate_tasks`) | **AI Tasks** (`signal_ai_tasks` + `whatsapp_msg`) |
| :--- | :--- | :--- | :--- |
| **ID Format** | Raw ID (e.g., `402`) | Prefixed (e.g., `immediate_12`) | Prefixed (e.g., `ai_171`) |
| **Task Title** | `task_name` | Mapped from `title` | Mapped from `title` |
| **Description** | `task` | Mapped from `description` | Mapped from `description` |
| **Status** | Uses `status` relationship obj | Hardcoded array: `['name' => ucfirst(status)]` | Hardcoded array: `['name' => ucfirst(status)]` |
| **Priority** | Uses `priority` relationship obj | Hardcoded: `['name' => 'High']` | Hardcoded: `['name' => 'Normal']` |
| **Due Date** | Native `due_date` column | Hardcoded: `null` | Hardcoded: `null` |
| **Created At** | Native `created_at` timestamp | Native `created_at` timestamp | Fallback chain: `created_at` -> `msg_created_at` -> `now()` |
| **Assigned To (User)**| Uses `user.name` relationship | *(Missing)* Frontend shows "Unassigned" | Mapped from `signal_whatsapp_msg.sender` |
| **Customer** | Uses `customer.name` relationship | *(Missing)* Frontend shows "N/A" | Mapped from `signal_whatsapp_msg.chat` |
| **Frontend Badge** | **A** (Assigned) | **I** (Immediate) | **AI** (AI Generated) |

---

## 1. Regular (Assigned) Tasks
Regular tasks are the core tasks managed in the system. They are fetched using Laravel's Eloquent ORM.

- **Source Table**: `tasks`
- **Backend Logic**:
  - Fetched using `App\Models\Task::with(...)`.
  - Joins all necessary relationships (`user`, `customer`, `status`, `priority`).
  - Filters out completed tasks (`is_done`).
- **Frontend Logic**: 
  - Since these tasks lack specific boolean flags (`is_immediate` or `is_ai`), the frontend `TaskCard` defaults to rendering them with the blue **"A"** (Assigned) badge.

## 2. Immediate Tasks
Immediate tasks are fast-tracked or urgent tasks stored in a separate simplified table.

- **Source Table**: `immediate_tasks`
- **Backend Logic**:
  - Fetched using a raw DB query builder (`DB::table('immediate_tasks')`).
  - Mapped manually via PHP array to match the structure of Regular Tasks.
  - Adds the `'is_immediate' => true` flag.
  - Hardcodes `'priority' => 'High'` since they are urgent.
- **Frontend Logic**:
  - The TV app explicitly checks for the `is_immediate` flag. 
  - Renders with a red **"I"** badge.
  - Bypasses any date filtering logic, making them always visible.
  - Because they lack assigned users and customers, the UI safely falls back to displaying "Unassigned" and "N/A".

## 3. AI Tasks
AI tasks are generated from WhatsApp signals and require joining two tables to construct a complete task card.

- **Source Tables**: `signal_ai_tasks` LEFT JOIN `signal_whatsapp_msg`
- **Backend Logic**:
  - Fetched using raw DB queries.
  - A `leftJoin` on `signal_whatsapp_msg` is required to extract the original message metadata.
  - **Mapping "Assigned To"**: The `sender` column from the WhatsApp message is mapped to the `user` object.
  - **Mapping "Customer"**: The `chat` column from the WhatsApp message is mapped to the `customer` object.
  - Adds the `'is_ai' => true` flag.
  - **Timestamp Fallback**: To ensure AI tasks are sorted correctly on the TV app, `created_at` checks the AI task first, falls back to the WhatsApp message timestamp, and finally defaults to the current time if neither exists.
- **Frontend Logic**:
  - The TV app checks for the `is_ai` flag.
  - Renders with a purple **"AI"** badge.
  - Like immediate tasks, they bypass the active-day filtering because their `due_date` is forcibly set to `null` in the API.

---

## Filtering & Sorting (The "Active Day" Logic)

Once the backend merges all three task arrays into a single collection, they are sorted chronologically:
```php
$allTasks = collect($tasks->toArray())
    ->concat($immediateTasks)
    ->concat($aiTasks)
    ->sortByDesc('created_at');
```

When this payload reaches the TV App (`TaskDashboardScreen.tsx`), the frontend applies a final filter:
1. Rejects any tasks where `status.name` is exactly `"Completed"`.
2. Automatically accepts **Immediate** and **AI** tasks (because their `due_date` is `null`).
3. For regular tasks, it checks the `due_date`. It only accepts tasks where the due date is today, in the past, or exactly tomorrow. Future tasks are hidden from the TV dashboard.
