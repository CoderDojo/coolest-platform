<template>
  <div v-if="event && status">
    <div class="row">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
        <circle class="path circle" fill="none" stroke="#73AF55" stroke-width="6" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>
        <polyline class="path check" fill="none" stroke="#73AF55" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>
      </svg>
    </div>
    <div class="row">
      <div class="col">
        <div v-if="status === 'verified'" >
          <h1>Your project has been confirmed.</h1>
          <h2 class="text-center">See you on {{formattedDate}}!</h2>
        </div>
        <div v-else>
          <h1>Your project has been canceled.</h1>
          <h2 class="text-center">That's a shame, see you next year maybe?</h2>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import FetchEventMixin from '@/event/FetchEventMixin';
  import ProjectService from '@/project/service';

  export default {
    name: 'CreateProjectCompleted',
    mixins: [FetchEventMixin],
    computed: {
      status() {
        return this.$route.params.status;
      },
    },
    methods: {
      setProjectStatus() {
        return ProjectService.status.update(
          this.event.id,
          this.$route.params.projectId,
          { status: this.status },
        );
      },
    },
    watch: {
      event() {
        if (this.event) {
          this.setProjectStatus();
        }
      },
    },
  };
</script>
<style lang="scss" scoped>
  svg {
    width: 100px;
    display: block;
    margin: 40px auto 0;
  }

  h2 {
    border-bottom: none;
  }

  .path {
    stroke-dasharray: 1000;
    stroke-dashoffset: 0;
    &.circle {
      animation: dash 2s ease-in-out;
    }
    &.check {
      stroke-dashoffset: -100;
      animation: dash-check 2.5s .35s ease-in-out forwards;
    }
  }

  @-webkit-keyframes dash {
    0% {
      stroke-dashoffset: 1000;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }

  @keyframes dash {
    0% {
      stroke-dashoffset: 1000;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }

  @-webkit-keyframes dash-check {
    0% {
      stroke-dashoffset: -100;
    }
    100% {
      stroke-dashoffset: 900;
    }
  }

  @keyframes dash-check {
    0% {
      stroke-dashoffset: -100;
    }
    100% {
      stroke-dashoffset: 900;
    }
  }

</style>
