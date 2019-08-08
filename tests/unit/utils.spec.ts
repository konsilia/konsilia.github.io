import * as Utils from '@/utils';
import axios from 'axios';
import config from '@/config';

beforeAll(async () => {
    window.open = jest.fn();
});

describe('Utility Tests', () => {
    it('parse time', () => {
        expect(Utils.parseTimeAll('MoWeFr 11:00AM - 1:50PM')).toEqual([
            ['Mo', 'We', 'Fr'],
            [11 * 60, 13 * 60 + 50]
        ]);
        expect(Utils.parseTimeAsTimeArray('asdasd')).toEqual(null);
        expect(Utils.parseTimeAll('TBA')).toBe(null);
    });

    it('to24hr', () => {
        expect(Utils.to24hr('5:00PM')).toBe('17:00');
        expect(Utils.to24hr('5:00AM')).toBe('5:00');
        expect(Utils.to24hr('12:00PM')).toBe('12:00');
        expect(Utils.to24hr('12:00AM')).toBe('00:00');

        expect(Utils.to24hr(Utils.to12hr('12:00'))).toBe('12:00');
    });

    it('to12hr', () => {
        expect(Utils.to12hr('13:33')).toBe('1:33PM');
        expect(Utils.to12hr('11:00')).toBe('11:00AM');
        expect(Utils.to12hr('0:15')).toBe('12:15AM');
        expect(Utils.to12hr('12:59')).toBe('12:59PM');
    });

    it('Overlap test', () => {
        expect(Utils.calcOverlap(100, 200, 150, 250)).toBe(50);
        expect(Utils.calcOverlap(150, 250, 100, 200)).toBe(50);
        expect(Utils.calcOverlap(100, 300, 100, 200)).toBe(100);
        expect(Utils.calcOverlap(100, 200, 100, 300)).toBe(100);
        expect(Utils.calcOverlap(100, 200, 200, 300)).toBe(0);
        expect(Utils.calcOverlap(100, 200, 300, 400)).toBe(-1);
    });

    it('merge test', () => {
        expect(Utils.blockUnion(100, 200, 150, 250)).toEqual([100, 250]);
        expect(Utils.blockUnion(150, 250, 100, 200)).toEqual([100, 250]);
        expect(Utils.blockUnion(100, 300, 100, 200)).toEqual([100, 300]);
        expect(Utils.blockUnion(100, 200, 100, 300)).toEqual([100, 300]);
        expect(Utils.blockUnion(100, 200, 100, 200)).toEqual([100, 200]);
        expect(Utils.blockUnion(18, 19, 18, 19)).toEqual([18, 19]);
        expect(Utils.blockUnion(100, 200, 300, 400)).toBe(undefined);
    });

    it('err test', async () => {
        try {
            await axios.get('invalid');
        } catch (e) {
            expect(
                Utils.errToStr(e) === 'request rejected by the server' ||
                    Utils.errToStr(e) === 'No internet'
            ).toBeTruthy();
        }
        expect(Utils.errToStr('asd')).toBe('asd');
        expect(Utils.errToStr(new Error('asd') as any)).toBe('asd');
    });

    it('other', () => {
        Utils.openLousList('1198', 1);
        Utils.openVAGrade(window.catalog.getCourse('cs11105'));

        expect(Utils.timeToNum('12:00')).toBeTruthy();
        expect(Utils.timeToNum('12:00')).toBe(8);
        expect(Utils.timeToNum('12:30')).toBe(9);
        console.info(Utils.timeToNum('12:00'));

        expect(Utils.highlightMatch('asd', 'asd')).toBe('asd');
        expect(
            Utils.highlightMatch('01234567890', 'topic', [
                {
                    match: 'topic',
                    start: 4,
                    end: 7
                }
            ])
        ).toBe('0123<span class="bg-warning">456</span>7890');

        try {
            // don't know how to test this one
            Utils.savePlain('sav', 'asv');
            // tslint:disable-next-line: no-empty
        } catch (err) {}

        expect(config).toBeInstanceOf(Object);
    });

    it('timeout', async () => {
        const result = await Utils.timeout(new Promise(resolve => resolve(1)), -1);
        expect(result).toBe(1);
        try {
            await Utils.timeout(
                new Promise((resolve, _) => setTimeout(() => resolve(1), 500)),
                250,
                'msg: timeout'
            );
        } catch (err) {
            expect(err).toBe('msg: timeout');
            expect(Utils.errToStr(err)).toBe('msg: timeout');
        }
    });
});
