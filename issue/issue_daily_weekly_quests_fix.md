### Issue: Daily/Weekly Quests Display and Data Synchronization Fixes

**Problem Description:**

Previously, the daily quest count displayed on the dashboard was incorrect, showing 1/10 even when all tasks were unchecked. This issue stemmed from stale data within `completedDailyTasks` in the character context, where old or non-existent quest IDs were still marked as `true`.

Additionally, the term "퀘스트" (Quest) was used inconsistently throughout the application, and the user requested to change it to "숙제" (Homework/Daily Task) for better clarity and consistency.

**Root Cause Analysis:**

1.  **Incorrect Daily Quest Count:** The `createInitialQuestProgress` function in `contexts/character-context.tsx` did not properly filter out old quest IDs that were no longer present in `public/data/quests.json`. This led to `completedDailyTasks` containing `true` values for non-existent tasks, inflating the count.
2.  **Redundant `questProgress` Initialization:** In `contexts/character-context.tsx`, the `addCharacter` function had a redundant `questProgress` initialization after merging `initialQuestProgress`, which could potentially overwrite correct data.
3.  **Inconsistent Terminology:** The term "퀘스트" was used in various files (`app/page.tsx`, `app/quests/page.tsx`, `components/sidebar.tsx`, `components/character-selector.tsx`, `app/guides/page.tsx`, `app/favorites/page.tsx`) and needed to be standardized to "숙제."

**Resolution:**

1.  **Refined `createInitialQuestProgress`:** Modified `contexts/character-context.tsx` to ensure that `createInitialQuestProgress` only merges `completedDailyTasks` and `completedWeeklyTasks` for task IDs that currently exist in `public/data/quests.json`. This cleans up stale data and ensures accurate counting.
2.  **Removed Redundant Initialization:** Eliminated the redundant `questProgress` initialization in the `addCharacter` function within `contexts/character-context.tsx`.
3.  **Terminology Standardization:** Replaced all instances of "퀘스트" with "숙제" across the identified `.tsx` files to maintain consistent terminology.
4.  **Logger Import Fix:** Corrected the missing `logger` import in `app/quests/page.tsx` that caused a runtime error.

**Affected Files:**

*   `app/page.tsx`
*   `app/quests/page.tsx`
*   `contexts/character-context.tsx`
*   `public/data/quests.json`
*   `components/sidebar.tsx`
*   `components/character-selector.tsx`
*   `app/guides/page.tsx`
*   `app/favorites/page.tsx`

**Testing:**

*   Verified that daily and weekly quest counts are now accurately reflected on the dashboard and quests page, even after toggling tasks on/off and refreshing.
*   Confirmed that all instances of "퀘스트" have been successfully replaced with "숙제."
*   Ensured no new runtime errors were introduced. 