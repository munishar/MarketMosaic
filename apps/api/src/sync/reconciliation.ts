import * as syncQueries from '../queries/sync.queries';
import { eventBus } from '../lib/event-bus';

export interface ReconciliationResult {
  total_checked: number;
  mismatches_found: number;
  mismatches: ReconciliationMismatch[];
}

export interface ReconciliationMismatch {
  entity_type: string;
  entity_id: string;
  reason: string;
  details: Record<string, unknown>;
}

/**
 * Reconciliation engine.
 * Compares submission_targets with status = 'bound' against AMS policy data.
 * Flags mismatches and emits sync:reconciliationMismatch events.
 */
export async function reconcilePolicies(
  jobId: string,
  amsPolicies: Record<string, unknown>[] = [],
): Promise<ReconciliationResult> {
  const boundTargets = await syncQueries.findBoundSubmissionTargets();
  const mismatches: ReconciliationMismatch[] = [];

  // Index AMS policies by policy number for lookup
  const amsPolicyMap = new Map<string, Record<string, unknown>>();
  for (const policy of amsPolicies) {
    const policyNumber = policy.policy_number as string;
    if (policyNumber) {
      amsPolicyMap.set(policyNumber, policy);
    }
  }

  for (const target of boundTargets) {
    const policyNumber = target.policy_number as string | undefined;

    if (!policyNumber) {
      // No policy number recorded for a bound target
      mismatches.push({
        entity_type: 'submission_target',
        entity_id: target.id as string,
        reason: 'No policy number found for bound submission target',
        details: {
          client_name: target.client_name,
          carrier_name: target.carrier_name,
        },
      });

      await eventBus.emit('sync:reconciliationMismatch', {
        job_id: jobId,
        entity_type: 'submission_target',
        entity_id: target.id as string,
      });
      continue;
    }

    // If we have AMS data, check for mismatches
    if (amsPolicies.length > 0) {
      const amsPolicy = amsPolicyMap.get(policyNumber);
      if (!amsPolicy) {
        mismatches.push({
          entity_type: 'submission_target',
          entity_id: target.id as string,
          reason: 'Policy number not found in AMS system',
          details: {
            policy_number: policyNumber,
            client_name: target.client_name,
            carrier_name: target.carrier_name,
          },
        });

        await eventBus.emit('sync:reconciliationMismatch', {
          job_id: jobId,
          entity_type: 'submission_target',
          entity_id: target.id as string,
        });
      }
    }
  }

  return {
    total_checked: boundTargets.length,
    mismatches_found: mismatches.length,
    mismatches,
  };
}
