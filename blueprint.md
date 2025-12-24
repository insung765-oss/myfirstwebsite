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
    *   A recommendation system (`upvotes`) allows logged-in users to vote for a post once. The UI provides clear feedback for voted, non-voted, and processing states.
    *   The community main page conditionally displays icons for upvotes and comments only when their count is greater than zero.

*   **Database:** Supabase is used for the backend, with tables like `community_posts`, `community_comments`, and `community_votes` managing the data.

## 3. Current Task: Implement Edit/Delete Functionality for Posts and Comments

This section outlines the plan for the current development task.

### 3.1. Goal

Allow users to modify or remove their own contributions (posts and comments) within the community section, enhancing user control and content management. Anonymous ("익명") contributions will not be editable or deletable.

### 3.2. Implementation Plan

1.  **Modify Post Detail Page (`/community/[id]/page.tsx`):**
    *   **Post Actions:** Add "Edit" and "Delete" buttons to the main post section. These buttons will be conditionally rendered, appearing only if the logged-in user (`user.name`) is the author of the post (`post.user_name`).
    *   **Comment Actions:** For each comment, add "Edit" and "Delete" buttons. These will be conditionally rendered, appearing only if the logged-in user is the author of the comment.
    *   **Delete Logic:**
        *   Implement a `handleDeletePost` function that shows a confirmation dialog, then removes the post from the `community_posts` table upon confirmation. After deletion, it will redirect the user to the main community page (`/community`).
        *   Implement a `handleDeleteComment` function that shows a confirmation dialog, removes the comment from the `community_comments` table, and then re-fetches the comment list to update the UI instantly.
    *   **Inline Comment Editing:**
        *   Implement a state management system to track which comment is being edited (e.g., `editingCommentId`).
        *   When a user clicks "Edit" on their comment, the comment text will be replaced by an input field, pre-filled with the current content, and "Save" / "Cancel" buttons will appear.
        *   Implement a `handleUpdateComment` function to save the changes to the database and refresh the comment list.

2.  **Create Post Edit Page (`/community/[id]/edit/page.tsx`):**
    *   Create a new page and route for editing posts.
    *   When a user clicks the "Edit" button on their post, they will be navigated to this page.
    *   The page will feature a form, pre-populated with the post's current title and content, which it fetches from the database.
    *   A `handleUpdatePost` function will handle the form submission, updating the corresponding record in the `community_posts` table and redirecting the user back to the post detail page upon completion.
