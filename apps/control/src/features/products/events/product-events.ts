/**
 * Product Domain Events Emitter
 * Exposes lifecycle hooks for catalog updates that other parts of the monorepo can subscribe to.
 */

export interface ProductEventPayload {
  productId: string;
  slug: string;
  name: string;
  sellerId?: string | null;
  priceCents: number;
  actorId: string;
  timestamp: string;
}

export function emitProductCreated(payload: ProductEventPayload) {
  console.log(`[Domain Event] ProductCreated: ${payload.name} (${payload.productId}) by actor ${payload.actorId}`);
  // Future integrations can bind to an EventBus, BullMQ queue, or webhooks here
}

export function emitProductPublished(payload: ProductEventPayload) {
  console.log(`[Domain Event] ProductPublished: ${payload.name} (${payload.productId}) by actor ${payload.actorId}`);
}

export function emitProductChangesRequested(payload: ProductEventPayload & { reason: string }) {
  console.log(
    `[Domain Event] ProductChangesRequested: ${payload.name} (${payload.productId}) by actor ${payload.actorId}. Reason: ${payload.reason}`
  );
}

export function emitProductArchived(payload: ProductEventPayload) {
  console.log(`[Domain Event] ProductArchived: ${payload.name} (${payload.productId}) by actor ${payload.actorId}`);
}
