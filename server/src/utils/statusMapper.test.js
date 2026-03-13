import { describe, it, expect } from 'vitest';
import { STATUS_BUCKETS, mapStatusToBucket } from './statusMapper.js';

describe('STATUS_BUCKETS', () => {
    it('has the correct keys', () => {
        expect(STATUS_BUCKETS).toHaveProperty('todo', 'todo');
        expect(STATUS_BUCKETS).toHaveProperty('in_progress', 'in_progress');
        expect(STATUS_BUCKETS).toHaveProperty('completed', 'completed');
        expect(STATUS_BUCKETS).toHaveProperty('backlog', 'backlog');
    });
});

describe('mapStatusToBucket', () => {
    describe('completed bucket', () => {
        it('maps "done" to completed', () => {
            expect(mapStatusToBucket('done')).toBe('completed');
        });

        it('maps "closed" to completed', () => {
            expect(mapStatusToBucket('closed')).toBe('completed');
        });

        it('maps "merged" to completed', () => {
            expect(mapStatusToBucket('merged')).toBe('completed');
        });

        it('maps "released" to completed', () => {
            expect(mapStatusToBucket('released')).toBe('completed');
        });

        it('maps "resolved" to completed', () => {
            expect(mapStatusToBucket('resolved')).toBe('completed');
        });

        it('maps "shipped" to completed', () => {
            expect(mapStatusToBucket('shipped')).toBe('completed');
        });
    });

    describe('in_progress bucket', () => {
        it('maps "in progress" to in_progress', () => {
            expect(mapStatusToBucket('in progress')).toBe('in_progress');
        });

        it('maps "in development" to in_progress', () => {
            expect(mapStatusToBucket('in development')).toBe('in_progress');
        });

        it('maps "in review" to in_progress', () => {
            expect(mapStatusToBucket('in review')).toBe('in_progress');
        });

        it('maps "in qa" to in_progress', () => {
            expect(mapStatusToBucket('in qa')).toBe('in_progress');
        });

        it('maps "building" to in_progress', () => {
            expect(mapStatusToBucket('building')).toBe('in_progress');
        });

        it('maps "debugging" to in_progress', () => {
            expect(mapStatusToBucket('debugging')).toBe('in_progress');
        });
    });

    describe('todo bucket', () => {
        it('maps "to do" to todo', () => {
            expect(mapStatusToBucket('to do')).toBe('todo');
        });

        it('maps "todo" to todo', () => {
            expect(mapStatusToBucket('todo')).toBe('todo');
        });

        it('maps "open" to todo', () => {
            expect(mapStatusToBucket('open')).toBe('todo');
        });

        it('maps "planned" to todo', () => {
            expect(mapStatusToBucket('planned')).toBe('todo');
        });

        it('maps "queued" to todo', () => {
            expect(mapStatusToBucket('queued')).toBe('todo');
        });

        it('maps "draft" to todo', () => {
            expect(mapStatusToBucket('draft')).toBe('todo');
        });

        it('maps "selected for development" to todo', () => {
            expect(mapStatusToBucket('selected for development')).toBe('todo');
        });
    });

    describe('backlog bucket (fallback)', () => {
        it('maps unknown status to backlog', () => {
            expect(mapStatusToBucket('some random status')).toBe('backlog');
        });

        it('maps another unknown status to backlog', () => {
            expect(mapStatusToBucket('wontfix')).toBe('backlog');
        });
    });

    describe('edge cases', () => {
        it('maps null to backlog', () => {
            expect(mapStatusToBucket(null)).toBe('backlog');
        });

        it('maps undefined to backlog', () => {
            expect(mapStatusToBucket(undefined)).toBe('backlog');
        });

        it('maps empty string to backlog', () => {
            expect(mapStatusToBucket('')).toBe('backlog');
        });

        it('is case insensitive: "Done" → completed', () => {
            expect(mapStatusToBucket('Done')).toBe('completed');
        });

        it('is case insensitive: "DONE" → completed', () => {
            expect(mapStatusToBucket('DONE')).toBe('completed');
        });

        it('is case insensitive: "IN PROGRESS" → in_progress', () => {
            expect(mapStatusToBucket('IN PROGRESS')).toBe('in_progress');
        });

        it('is case insensitive: "TODO" → todo', () => {
            expect(mapStatusToBucket('TODO')).toBe('todo');
        });

        it('matches keyword as whole word: "Task is done" → completed', () => {
            expect(mapStatusToBucket('Task is done')).toBe('completed');
        });

        it('does not false-positive: "abandoned" should NOT match "done"', () => {
            expect(mapStatusToBucket('abandoned')).toBe('backlog');
        });

        it('does not false-positive: "reopened" should NOT match "open"', () => {
            expect(mapStatusToBucket('reopened')).toBe('backlog');
        });

        it('does not false-positive: "unplanned" should NOT match "planned"', () => {
            expect(mapStatusToBucket('unplanned')).toBe('backlog');
        });
    });
});
