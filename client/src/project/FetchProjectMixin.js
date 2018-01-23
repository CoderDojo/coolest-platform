import ProjectService from '@/project/service';
import FetchEventMixin from '@/event/FetchEventMixin';

export default {
  mixins: [FetchEventMixin],
  props: {
    projectId: {
      required: true,
      type: String,
    },
    _project: {
      type: Object,
    },
  },
  data() {
    return {
      project: {},
    };
  },
  watch: {
    event() {
      if (!this.project.id && this.event.id) {
        this.fetchProject();
      }
    },
  },
  methods: {
    async fetchProject() {
      this.project = (await ProjectService.get(this.event.id, this.projectId)).body;
    },
  },
  created() {
    if (this._project) {
      this.project = this._project;
    } else if (this.event.id) {
      this.fetchProject();
    }
  },
};
