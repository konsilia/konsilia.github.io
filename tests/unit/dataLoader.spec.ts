import { loadSemesterList } from '@/data/SemesterListLoader';
import { loadFromCache, fallback } from '@/data/Loader';

describe('Data loader test', () => {
    it('semester data', async () => {
        const data = await loadSemesterList(5);
        const payload = data.payload!;
        expect(payload).toBeTruthy();
        expect(payload[0].id).toBeTruthy();
    });

    it('test', async () => {
        const payload = await fallback(
            loadFromCache<string, { modified: string; str: string }>(
                'dummy',
                async () => {
                    throw new Error('dummy error');
                },
                x => x.str,
                {}
            )
        );
        expect(payload.level).toBe('error');
        expect(payload.msg).toBe('dummy error');
    });
});
