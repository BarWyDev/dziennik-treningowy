import type { APIRoute } from 'astro';
import { db, personalRecords, mediaAttachments } from '@/lib/db';
import { updatePersonalRecordSchema } from '@/lib/validations/personal-record';
import { auth } from '@/lib/auth';
import { eq, and, inArray } from 'drizzle-orm';
import { storage } from '@/lib/storage';

export const GET: APIRoute = async ({ request, params }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Record ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [record] = await db
      .select()
      .from(personalRecords)
      .where(and(eq(personalRecords.id, id), eq(personalRecords.userId, session.user.id)));

    if (!record) {
      return new Response(JSON.stringify({ error: 'Record not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pobierz media załączniki
    const media = await db
      .select()
      .from(mediaAttachments)
      .where(eq(mediaAttachments.personalRecordId, id));

    const data = {
      ...record,
      media,
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching personal record:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Record ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const validation = updatePersonalRecordSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation error', details: validation.error.flatten() }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const [existing] = await db
      .select()
      .from(personalRecords)
      .where(and(eq(personalRecords.id, id), eq(personalRecords.userId, session.user.id)));

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Record not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { mediaIds, ...recordData } = validation.data;

    const [updated] = await db
      .update(personalRecords)
      .set({
        ...recordData,
        updatedAt: new Date(),
      })
      .where(eq(personalRecords.id, id))
      .returning();

    // Aktualizuj powiązania z media
    if (mediaIds !== undefined) {
      if (mediaIds && mediaIds.length > 0) {
        // Powiąż nowe media
        await db
          .update(mediaAttachments)
          .set({ personalRecordId: id })
          .where(
            and(
              inArray(mediaAttachments.id, mediaIds),
              eq(mediaAttachments.userId, session.user.id)
            )
          );
      }
    }

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating personal record:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Record ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [existing] = await db
      .select()
      .from(personalRecords)
      .where(and(eq(personalRecords.id, id), eq(personalRecords.userId, session.user.id)));

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Record not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pobierz wszystkie media załączniki przed usunięciem
    const media = await db
      .select()
      .from(mediaAttachments)
      .where(eq(mediaAttachments.personalRecordId, id));

    // Usuń fizyczne pliki
    for (const m of media) {
      try {
        await storage.deleteFile(m.fileUrl);
      } catch (error) {
        console.error(`Error deleting file ${m.fileUrl}:`, error);
        // Kontynuuj mimo błędu
      }
    }

    // Usuń rekord (ON DELETE CASCADE usunie wpisy z media_attachments)
    await db.delete(personalRecords).where(eq(personalRecords.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting personal record:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
