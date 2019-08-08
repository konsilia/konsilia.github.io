/**
 * @module store
 */
import { StoreModule } from '.';

export interface PaletteState {
    savedColors: { [x: string]: string };
}

/**
 * the palette module handles the customization of colors of courses and events
 * @author Hanzhi Zhou
 */
class Palette implements StoreModule<PaletteState, PaletteState> {
    public savedColors: { [x: string]: string } = {};

    fromJSON(obj: PaletteState) {
        this.savedColors = obj.savedColors || {};
    }

    getDefault() {
        return new Palette();
    }

    toJSON() {
        return this;
    }
}

export const palette = new Palette();
export default palette;
