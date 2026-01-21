# 🚀 Migration Guide - Enhanced Training Diary

## Quick Start (Fresh Database)

If you're starting fresh or don't have existing training data:

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env and add your DATABASE_URL

# 2. Push schema to database
pnpm db:push

# 3. Seed default training types
pnpm db:seed

# 4. Start the app
pnpm dev
```

Done! Visit http://localhost:4321

---

## Migration (Existing Data)

If you have existing training data, follow these steps:

### Step 1: Backup Your Data

```bash
# If using PostgreSQL, backup your database
pg_dump -U your_user -d your_database > backup_$(date +%Y%m%d).sql
```

### Step 2: Review What Will Change

The `trainings` table will get these new columns:
- `time` (text, optional)
- `rating_overall` (integer, **REQUIRED**)
- `rating_physical` (integer, optional)
- `rating_energy` (integer, optional)
- `rating_motivation` (integer, optional)
- `rating_difficulty` (integer, optional)
- `training_goal` (text, optional)
- `most_satisfied_with` (text, optional)
- `improve_next_time` (text, optional)
- `how_to_improve` (text, optional)

The old `rating` column will be **removed**.

### Step 3: Apply the Migration

```bash
pnpm db:push
```

### Step 4: Migrate Existing Data

**⚠️ IMPORTANT:** The new schema requires `rating_overall` to be NOT NULL, but your existing trainings don't have this field yet.

Run this SQL to migrate your existing data:

```sql
-- Option 1: Use old 'rating' value if it exists, otherwise default to 3
UPDATE trainings
SET rating_overall = COALESCE(rating, 3)
WHERE rating_overall IS NULL;

-- Option 2: Set all existing trainings to neutral rating
UPDATE trainings
SET rating_overall = 3
WHERE rating_overall IS NULL;

-- Optional: Add default time for existing trainings
UPDATE trainings
SET time = '12:00'
WHERE time IS NULL;
```

### Step 5: Verify Migration

```bash
# Check that all trainings have rating_overall
psql -U your_user -d your_database -c "SELECT COUNT(*) FROM trainings WHERE rating_overall IS NULL;"
# Should return 0
```

### Step 6: Start the App

```bash
pnpm dev
```

---

## What Changed

### Form Changes
The training form now has **3 main sections**:

1. **Basic Info**
   - Date (now with optional time field)
   - Training type
   - Duration

2. **Training Goal** (new)
   - Set your mental and physical goals before the workout

3. **Ratings** (enhanced)
   - Overall satisfaction ⭐ (required)
   - Physical wellness ⭐ (optional)
   - Energy level ⭐ (optional)
   - Motivation ⭐ (optional)
   - Difficulty ⭐ (optional)

4. **Reflection** (new)
   - What am I most satisfied with?
   - What do I want to improve next time?
   - How can I do it?

5. **Additional Info**
   - Calories burned
   - General notes

### Details Page Changes
Training details now show:
- Color-coded reflection boxes
- All 5 rating categories (if provided)
- Better visual hierarchy
- Time displayed with date

---

## Testing Checklist

After migration, test:

- [ ] Create a new training with all fields filled
- [ ] Create a new training with only required fields (type, date, duration, overall rating)
- [ ] View training details page - verify all fields display correctly
- [ ] Edit an existing training
- [ ] View list of trainings - verify they display correctly
- [ ] Filter trainings by date
- [ ] Export a training to PDF (if PDF feature exists)

---

## Rollback (If Needed)

If something goes wrong, restore from backup:

```bash
# Restore database from backup
psql -U your_user -d your_database < backup_YYYYMMDD.sql
```

Then revert code changes:

```bash
git checkout main  # or your previous working branch
```

---

## Need Help?

Check these files for more details:
- `.ai/IMPLEMENTATION_COMPLETE.md` - Full implementation details
- `.ai/implementation-status.md` - What was added and why
- `CLAUDE.md` - Updated architecture documentation

---

## Common Issues

### Issue: "rating_overall cannot be null"

**Solution:** You didn't run the data migration SQL from Step 4. Run:

```sql
UPDATE trainings SET rating_overall = 3 WHERE rating_overall IS NULL;
```

### Issue: Form is very long on mobile

**Solution:** This is expected. The form now has many optional fields for comprehensive tracking. Consider:
- Scrolling through sections
- Only filling required fields for quick entries
- Using desktop for detailed entries

### Issue: Existing trainings show "undefined" for ratings

**Solution:** Old trainings don't have the new rating fields. This is normal. When you edit them, you can add the new ratings.

---

**Ready to migrate? Start with Step 1!** 🚀
