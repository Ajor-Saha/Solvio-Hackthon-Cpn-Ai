# Troubleshooting Guide

This document contains solutions to common issues encountered during development.

## Merge Conflicts

### Issue: Merge Conflict in `app-sidebar.tsx` and `server/index.ts` (Announcement Routes Refactoring)

**Date Resolved:** November 2025
**Branches Involved:** Merging announcement category routes refactoring into feature branch

#### Symptoms
- Git shows "both modified" status for:
  - `client/src/components/admin/app-sidebar.tsx`
  - `server/src/index.ts`
- File content may appear duplicated or contain conflict markers

#### Root Cause
A refactoring that replaced individual announcement routes with a unified announcement category system created conflicts when merging into branches that had different route structures.

#### Resolution Steps

##### 1. `client/src/components/admin/app-sidebar.tsx`

**Conflict:** The sidebar navigation menu needed to be updated to include new announcement categories.

**Resolution:**
- ✅ Keep the incoming branch changes (the new announcement structure)
- ✅ Added new imports: `Award`, `GraduationCap`, `Microscope`
- ✅ Updated announcement menu items:
  - Renamed "Job Posting" → "Jobs"
  - Renamed "Competition" → "Competitions"
  - Added "Achievements"
  - Added "Research"
  - Added "Higher Studies"
  - Removed "Showcase"

**Correct Final Structure:**
```typescript
{
  title: "Announcement",
  url: "/announcement",
  icon: <Megaphone size={20} />,
  items: [
    { title: "Jobs", url: "/announcement/jobs", icon: <Briefcase /> },
    { title: "Competitions", url: "/announcement/competitions", icon: <Trophy /> },
    { title: "Achievements", url: "/announcement/achievements", icon: <Award /> },
    { title: "Research", url: "/announcement/research", icon: <Microscope /> },
    { title: "Higher Studies", url: "/announcement/higher-studies", icon: <GraduationCap /> },
  ],
}
```

##### 2. `server/src/index.ts`

**Conflict:** Route imports and mounts needed to be updated from old individual routes to new announcement category routes.

**Resolution:**
- ✅ Replaced old route imports with new announcement category routes:
  - Removed: `competition_router`, `jobpost_router`, `research_router`, `showcase_router`
  - Added: `achievementRouter`, `competitionRouter`, `higherStudyRouter`, `jobRouter`, `researchRouter`
- ✅ Updated route mounts from individual routes to category routes
- ✅ **Important:** Preserved the AI Assistant routes (`/api/ai`) that were in the current branch

**Correct Final Structure:**
```typescript
// New 5 announcement category routes
import achievementRouter from './routes/achievement-routes';
import competitionRouter from './routes/competition-routes';
import higherStudyRouter from './routes/higher-study-routes';
import jobRouter from './routes/job-routes';
import researchRouter from './routes/research-routes';

// ... in route mounting section ...
app.use('/api/achievements', achievementRouter);
app.use('/api/competitions', competitionRouter);
app.use('/api/higher-studies', higherStudyRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/research', researchRouter);
// End announcement routes

// AI Assistant routes (must be preserved!)
app.use('/api/ai', ai_router);
```

#### Verification Checklist
- [ ] `app-sidebar.tsx` has all 5 announcement category menu items
- [ ] `server/index.ts` has all 5 announcement category route imports and mounts
- [ ] AI Assistant routes (`/api/ai`) are still present and mounted
- [ ] No duplicate content in files
- [ ] Git status shows no "Unmerged paths"
- [ ] Files are staged with `git add`

#### Command Reference
```bash
# Check merge conflict status
git status

# View differences between conflicted versions
git diff :2:client/src/components/admin/app-sidebar.tsx :3:client/src/components/admin/app-sidebar.tsx
git diff :2:server/src/index.ts :3:server/src/index.ts

# After resolving, mark as resolved
git add client/src/components/admin/app-sidebar.tsx
git add server/src/index.ts

# Verify resolution
git status
```

#### Prevention Tips
1. **Communicate refactorings:** When making structural changes (like route refactoring), notify team members
2. **Update branches regularly:** Keep feature branches up to date with main to minimize conflicts
3. **Coordinate large changes:** Coordinate major refactorings across the team to avoid parallel conflicting changes

---

## Contributing to This Guide

If you encounter and resolve a new issue:
1. Document the problem, symptoms, root cause, and solution
2. Include code examples where helpful
3. Add verification steps
4. Update this document with your resolution
