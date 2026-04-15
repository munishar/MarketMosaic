import * as networkQueries from '../queries/network.queries';
import { AppError } from '../middleware/error-handler';
import { eventBus } from '../lib/event-bus';

export async function getGraph(userId: string, filters?: { carrier_id?: string; region?: string }) {
  return networkQueries.getGraphData(userId, filters);
}

export async function searchContacts(term: string) {
  return networkQueries.searchContacts(term);
}

export async function findPath(fromUserId: string, toContactId: string) {
  const paths = await networkQueries.searchPath(fromUserId, toContactId);
  return { paths, found: paths.length > 0 };
}

export async function createRelationship(data: Record<string, unknown>, createdBy: string) {
  const existing = await networkQueries.findRelationship(
    data.user_id as string,
    data.contact_id as string,
  );
  if (existing) {
    throw new AppError(409, 'CONFLICT', 'Relationship already exists between this user and contact');
  }
  const relationship = await networkQueries.createRelationship(data, createdBy);
  return relationship;
}

export async function updateRelationship(id: string, data: Record<string, unknown>, updatedBy: string) {
  const updated = await networkQueries.updateRelationship(id, data, updatedBy);
  if (!updated) {
    throw new AppError(404, 'NOT_FOUND', 'Relationship not found');
  }
  return updated;
}

export async function requestIntroduction(params: {
  requester_id: string;
  colleague_id: string;
  contact_id: string;
  message?: string;
}) {
  // Create a notification for the colleague
  await eventBus.emit('notification:created', {
    user_id: params.colleague_id,
    type: 'network_request',
    title: 'Introduction Request',
    message: params.message ?? 'A colleague has requested an introduction to one of your contacts.',
    entity_type: 'contact',
    entity_id: params.contact_id,
  });

  return { success: true, message: 'Introduction request sent' };
}
