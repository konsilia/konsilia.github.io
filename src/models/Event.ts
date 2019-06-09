/**
 * @module models
 * @author Kaiying Shan
 */

/**
 *
 */
import { hashCode, parseTimeAsTimeArray } from '../utils';
import { TimeArray } from '../algorithm';
import Hashable from './Hashable';

/**
 * An Event is a structure different than `Course` or `Section` that can be placed on a Schedule
 *
 * It is uniquely identified by its `days` property
 */
export default class Event implements Hashable {
    public key: string;
    public days: string;
    public display: boolean;
    public title?: string;
    public room?: string;
    public description?: string;
    public selected: boolean;

    constructor(
        days: string,
        display: boolean,
        title?: string,
        description?: string,
        room?: string
    ) {
        this.key = this.days = days;
        this.display = display;
        this.title = title;
        this.description = description;
        this.room = room;
        this.selected = false;
    }

    public hash() {
        return hashCode(this.days);
    }

    public copy() {
        return new Event(this.days, this.display, this.title, this.description, this.room);
    }

    public toTimeArray(): TimeArray {
        return parseTimeAsTimeArray(this.days)!;
    }
}
