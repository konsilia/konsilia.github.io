/**
 * @module components/tabs
 */
import { Component, Vue } from 'vue-property-decorator';
import Store from '@/store';
import Course from '@/models/Course';
import ClassList from '../ClassList.vue';

/**
 * component for performing fuzzy-search against the catalog of courses
 * @author Hanzhi Zhou
 */
@Component({
    components: {
        ClassList
    }
})
export default class FuzzyView extends Store {
    inputCourses: Course[] = [];

    /**
     * represent the current state of the fuzzy search component.
     * disable the input box if true
     */
    loading = false;

    workerLoaded = !!window.catalog.worker;

    /**
     * initialize catalog's search worker if it is not yet initialized
     */
    async initWorker() {
        if (!window.catalog.worker) {
            this.loading = true;
            this.noti.info('Gathering data for fuzzy search...');
            await window.catalog.initWorker();
            this.noti.success('Success!', 2.5);
            this.loading = false;
            this.workerLoaded = true;
        }
    }

    disposeWorker() {
        window.catalog.disposeWorker();
        this.workerLoaded = false;
    }

    /**
     * get classes that match the input query.
     * clear search results on falsy parameter.
     *
     * if a generated schedule is displayed, switch to proposed schedule,
     * because we're adding stuff to the proposed schedule
     *
     * @see Catalog.search
     */
    async getClass(query: string) {
        if (!query) {
            this.inputCourses = [];
            return;
        }
        this.loading = true;
        if (this.schedule.generated) this.schedule.switchSchedule(false);
        window.catalog.initWorker();

        console.time('query');
        try {
            this.inputCourses = await window.catalog.fuzzySearch(query);
        } catch (err) {
            const e: Error | ErrorEvent = err;
            this.noti.error(e.message);
            console.error(e);
        } finally {
            this.loading = false;
            console.timeEnd('query');
        }
    }

    closeClassList() {
        (this.$refs.classSearch as HTMLInputElement).value = '';
        this.getClass('');
    }

    /**
     * @see Schedule.update
     */
    updateCourse(key: string, section: number, remove: boolean = false) {
        this.schedule.currentSchedule.update(key, section, remove);

        // note: adding a course to schedule.All cannot be detected by Vue.
        // Must use forceUpdate to re-render component
        const classList = this.$refs.enteringClassList;
        if (classList instanceof Vue) (classList as Vue).$forceUpdate();
        this.saveStatus();
    }
}
