/**
 * @module components
 */
import config from '@/config';
import { SemesterJSON } from '@/models/Catalog';
import Section from '@/models/Section';
import { Component, Prop, Vue } from 'vue-property-decorator';
/**
 * Component for displaying detailed information of a single Section
 * @author Kaiying Shan, Hanzhi Zhou
 */
@Component
export default class SectionModal extends Vue {
    get config() {
        return config.external;
    }
    @Prop(Section) readonly section!: Section;
    @Prop(Object) readonly semester!: SemesterJSON;
}
