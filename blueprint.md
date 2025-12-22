# Momotwo (모모22) Blueprint

## 1. Project Overview

**Momotwo (모모22)** is a web application designed for music lovers, centered around the concept of "digging" - the act of deeply exploring and discovering new music. The application provides a space for users to get music recommendations and engage with a community of fellow music enthusiasts.

Key features include:
- A main landing page introducing the app's philosophy.
- A "Digging" section for music discovery.
- A "Community" section with posts, comments, and a recommendation (vote) system.

## 2. Implemented Design & Features

This section documents all the styles, designs, and features implemented in the application from the initial version to the current one.

### 2.1. Visual Design & Layout

*   **Theme:** Modern dark theme (`bg-gray-800`) for the landing page and a clean, light theme (`bg-white`) for the community sections.
*   **Typography:** A blend of a custom "PAPERLOGY" font for narrative sections and `Noto Sans KR` for general UI, creating a strong typographic hierarchy.
*   **Component Styling:**
    *   **Menu Items:** Interactive cards with semi-transparent, blurred backgrounds (`backdrop-blur-lg`).
    *   **Buttons & Inputs:** Styled with soft colors, rounded corners, and clear hover/focus/disabled states for intuitive interaction.
*   **Layout:** Utilizes Flexbox and Grid for responsive and centered layouts, ensuring a consistent experience across devices.

### 2.2. Features & Interactivity

*   **Framer Motion Animations:** The landing page features a section that smoothly fades and slides into view on scroll, configured to trigger each time it enters the viewport.
*   **User Authentication:** A context-based authentication system (`useAuth`) manages user state, showing login/signup links or a logout button accordingly.
*   **Community Board:**
    *   Users can view posts, which include a title, content, author, and creation date.
    *   Users can view comments associated with a post.
    *   Users (including anonymous ones) can submit comments.
*   **Database:** Supabase is used for the backend, with tables like `community_posts`, `community_comments`, and `community_votes` managing the data.

## 3. Task: Fixing Community Post Recommendation Logic

This section outlines the problem and solution for the most recently completed task.

### 3.1. The Problem

The recommendation (vote) feature on the community post detail page (`src/app/community/[id]/page.tsx`) had a critical bug: when a non-logged-in user clicked the recommend button, the action was not blocked correctly. This led to confusing UI behavior where the vote count might appear to change temporarily, or the wrong alert message was shown.

### 3.2. The Solution: Server-First, Strict-Validation Strategy

To fix this, the logic was completely overhauled to prioritize data integrity and a clear user experience. The new implementation is based on a "Server-First" principle.

1.  **State-Driven UI:**
    *   New state variables `isVoted` and `isProcessingVote` were introduced.
    *   When the page loads, it checks the `community_votes` table to see if the current user has already voted. The result is stored in `isVoted`.
    *   The recommendation button's appearance and `disabled` status are now directly tied to these states, providing immediate and accurate visual feedback.

2.  **Strict Guard Clauses:**
    *   The `handleRecommend` function now begins with strict checks:
        1.  It first checks if the user is logged out (`!user`). If so, it shows the "로그인이 필요합니다" alert and stops immediately.
        2.  It then checks if `isVoted` is `true`. If so, it shows the "이미 추천했습니다" alert and stops.
    *   This prevents any unnecessary code from running for invalid actions.

3.  **Reliable Server Update:**
    *   Only if the guard clauses are passed does the function proceed.
    *   It initiates a request to the server to update the database.
    *   To ensure atomic operations and prevent race conditions, a Supabase RPC function (`increment_upvotes`) is used to increment the post's vote count.
    *   A new entry is added to the `community_votes` table to log the user's vote.

4.  **Synchronized UI Update:**
    *   **Only after** the server successfully confirms that the database has been updated, the UI is updated by re-fetching the data.
    *   This eliminates the "optimistic update" bugs and ensures the UI is always a true reflection of the database state.

This robust, server-first approach has resolved the bug, prevented visual inconsistencies, and made the recommendation feature reliable and predictable for all user states.
