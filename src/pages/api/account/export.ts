import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import {
  users,
  trainings,
  trainingTypes,
  goals,
  personalRecords,
  mediaAttachments,
  userConsents,
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createUnauthorizedError, handleUnexpectedError } from '@/lib/error-handler';
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RateLimitPresets,
} from '@/lib/rate-limit';

/**
 * GET /api/account/export
 * Eksportuje wszystkie dane użytkownika (Art. 20 RODO)
 */
export const GET: APIRoute = async ({ locals, request }) => {
  try {
    const user = locals.user;
    if (!user?.id) {
      return createUnauthorizedError();
    }

    const rateLimitResponse = checkRateLimit(
      getRateLimitIdentifier(request, user.id),
      RateLimitPresets.EXPORT
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const [userInfo, userTrainings, userGoals, userRecords, userMedia, userConsentsList] =
      await Promise.all([
        db.select().from(users).where(eq(users.id, user.id)).limit(1),
        db
          .select({
            id: trainings.id,
            date: trainings.date,
            time: trainings.time,
            durationMinutes: trainings.durationMinutes,
            description: trainings.description,
            ratingOverall: trainings.ratingOverall,
            ratingPhysical: trainings.ratingPhysical,
            ratingEnergy: trainings.ratingEnergy,
            ratingMotivation: trainings.ratingMotivation,
            ratingDifficulty: trainings.ratingDifficulty,
            trainingGoal: trainings.trainingGoal,
            mostSatisfiedWith: trainings.mostSatisfiedWith,
            improveNextTime: trainings.improveNextTime,
            howToImprove: trainings.howToImprove,
            notes: trainings.notes,
            caloriesBurned: trainings.caloriesBurned,
            createdAt: trainings.createdAt,
            trainingTypeName: trainingTypes.name,
          })
          .from(trainings)
          .leftJoin(trainingTypes, eq(trainings.trainingTypeId, trainingTypes.id))
          .where(eq(trainings.userId, user.id)),
        db.select().from(goals).where(eq(goals.userId, user.id)),
        db.select().from(personalRecords).where(eq(personalRecords.userId, user.id)),
        db
          .select({
            id: mediaAttachments.id,
            fileName: mediaAttachments.fileName,
            fileType: mediaAttachments.fileType,
            mimeType: mediaAttachments.mimeType,
            fileSize: mediaAttachments.fileSize,
            trainingId: mediaAttachments.trainingId,
            personalRecordId: mediaAttachments.personalRecordId,
            createdAt: mediaAttachments.createdAt,
          })
          .from(mediaAttachments)
          .where(eq(mediaAttachments.userId, user.id)),
        db.select().from(userConsents).where(eq(userConsents.userId, user.id)),
      ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: userInfo[0],
      trainings: userTrainings,
      goals: userGoals,
      personalRecords: userRecords,
      mediaAttachments: userMedia,
      consents: userConsentsList,
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `trainwise-export-${dateStr}.json`;

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleUnexpectedError(error, 'account/export GET');
  }
};
