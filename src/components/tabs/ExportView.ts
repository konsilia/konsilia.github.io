/**
 * @module components/tabs
 */
import Store from '@/store';
import { savePlain, toICal } from '@/utils';
import lz from 'lz-string';
import { Component } from 'vue-property-decorator';
import $ from 'jquery';

/**
 * component for import/export/print schedules
 * @author Kaiying Shan, Hanzhi Zhou
 */
@Component
export default class ExportView extends Store {
    exportJson: string = 'schedule';
    exportICal: string = 'schedule';
    newName: (string | null)[] = [];

    created() {
        this.newName = this.profile.profiles.map(() => null);
    }

    onUploadJson(event: { target: EventTarget | null }) {
        const { files } = event.target as HTMLInputElement;
        if (!files) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                const msg = this.profile.addProfile(reader.result.toString(), files[0].name);
                if (msg.level === 'success' && !msg.payload) this.loadProfile();
                else if (msg.level === 'error') this.noti.notify(msg);
            } else {
                this.noti.warn('File is empty!');
            }
        };

        try {
            reader.readAsText(files[0]);
        } catch (error) {
            console.error(error);
            this.noti.error(error.message);
        }
    }
    saveToJson() {
        if (!this.semester.currentSemester) return;
        const json = localStorage.getItem(this.profile.current);
        if (json) savePlain(json, (this.exportJson || 'schedule') + '.json');
    }
    saveToIcal() {
        savePlain(toICal(this.schedule.currentSchedule), (this.exportICal || 'schedule') + '.ical');
    }
    exportToURL() {
        if (!this.semester.currentSemester) return;
        const json = localStorage.getItem(this.profile.current);
        if (json) {
            const url = new URL(window.location.href);
            url.searchParams.set('config', lz.compressToEncodedURIComponent(json));
            this.modal.showURLModal(url.href);
        }
    }
    deleteProfile(name: string, idx: number) {
        if (confirm(`Are you sure to delete ${name}?`)) {
            this.newName.splice(idx, 1);
            const prof = this.profile.deleteProfile(name, idx);
            if (prof) this.loadProfile();
        }
    }
    selectProfile(profileName: string) {
        const item = localStorage.getItem(profileName);
        if (!item) return;
        this.profile.current = profileName;
        this.loadProfile();
    }
    finishEdit(oldName: string, idx: number) {
        const raw = localStorage.getItem(oldName);
        if (!raw) return;

        const newName = this.newName[idx];
        if (!newName) return this.noti.error('Name cannot be empty!');
        if (newName !== oldName) {
            const prevIdx = this.profile.profiles.findIndex(n => n === newName);
            if (prevIdx !== -1) return this.noti.error('Duplicated name!');
            this.profile.renameProfile(idx, oldName, newName, raw);
        }
        this.$set(this.newName, idx, null);
    }
    print() {
        window.print();
    }
}
