import type { APIRoute } from 'astro';
import { db, trainings, trainingTypes, mediaAttachments } from '@/lib/db';
import { updateTrainingSchema } from '@/lib/validations/training';
import { eq, and, inArray } from 'drizzle-orm';
import { storage } from '@/lib/storage';
import { requireAuthWithRateLimit, requireAuthWithCSRF, RateLimitPresets } from '@/lib/api-helpers';
import {
  handleUnexpectedError,
  handleDatabaseError,
  handleValidationError,
  createNotFoundError,
} from '@/lib/error-handler';

export const GET: APIRoute = async ({ request, params }) => {
  try {
    // Autentykacja + rate limiting
    const authResult = await requireAuthWithRateLimit(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Training ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [result] = await db
      .select({
        training: trainings,
        trainingType: trainingTypes,
      })
      .from(trainings)
      .leftJoin(trainingTypes, eq(trainings.trainingTypeId, trainingTypes.id))
      .where(and(eq(trainings.id, id), eq(trainings.userId, authResult.user.id)));

    if (!result) {
      return createNotFoundError('training', id);
    }

    // Pobierz media załączniki
    const media = await db
      .select()
      .from(mediaAttachments)
      .where(eq(mediaAttachments.trainingId, id));

    const data = {
      ...result.training,
      trainingType: result.trainingType,
      media,
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query'))) {
      return handleDatabaseError(error, 'fetching training');
    }
    return handleUnexpectedError(error, 'trainings/[id] GET');
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    // Autentykacja + rate limiting + CSRF protection
    const authResult = await requireAuthWithCSRF(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Training ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const validation = updateTrainingSchema.safeParse(body);

    if (!validation.success) {
      return handleValidationError(validation);
    }

    const [existing] = await db
      .select()
      .from(trainings)
      .where(and(eq(trainings.id, id), eq(trainings.userId, authResult.user.id)));

    if (!existing) {
      return createNotFoundError('training', id);
    }

    const { mediaIds, ...trainingData } = validation.data;

    // Użyj transakcji aby zapewnić atomiczność operacji
    const updated = await db.transaction(async (tx) => {
      const [training] = await tx
        .update(trainings)
        .set({
          ...trainingData,
          updatedAt: new Date(),
        })
        .where(eq(trainings.id, id))
        .returning();

      // Aktualizuj powiązania z media w tej samej transakcji
      if (mediaIds !== undefined) {
        if (mediaIds && mediaIds.length > 0) {
          // Powiąż nowe media
          await tx
            .update(mediaAttachments)
            .set({ trainingId: id })
            .where(
              and(
                inArray(mediaAttachments.id, mediaIds),
                eq(mediaAttachments.userId, authResult.user.id)
              )
            );
        }
      }

      return training;
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query') || error.message.includes('constraint'))) {
      return handleDatabaseError(error, 'updating training');
    }
    return handleUnexpectedError(error, 'trainings/[id] PUT');
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    // Autentykacja + rate limiting + CSRF protection
    const authResult = await requireAuthWithCSRF(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Training ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [existing] = await db
      .select()
      .from(trainings)
      .where(and(eq(trainings.id, id), eq(trainings.userId, authResult.user.id)));

    if (!existing) {
      return createNotFoundError('training', id);
    }

    // Pobierz wszystkie media załączniki przed usunięciem
    const media = await db
      .select()
      .from(mediaAttachments)
      .where(eq(mediaAttachments.trainingId, id));

    // Usuń trening w transakcji (ON DELETE CASCADE usunie wpisy z media_attachments)
    // Transakcja zapewnia atomiczność operacji na bazie danych
    await db.transaction(async (tx) => {
      await tx.delete(trainings).where(eq(trainings.id, id));
    });

    // Usuń fizyczne pliki po pomyślnym usunięciu z bazy
    // Jeśli usunięcie plików się nie powiedzie, logujemy błąd ale nie rollbackujemy transakcji
    // (pliki można wyczyścić później przez maintenance script)
    for (const m of media) {
      try {
        await storage.deleteFile(m.fileUrl);
      } catch (error) {
        console.error(`Error deleting file ${m.fileUrl}:`, error);
        // Kontynuuj mimo błędu - baza danych jest już spójna
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query'))) {
      return handleDatabaseError(error, 'deleting training');
    }
    return handleUnexpectedError(error, 'trainings/[id] DELETE');
  }
};
