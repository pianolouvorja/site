import type VueApexCharts from 'vue3-apexcharts'

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    apexchart: typeof VueApexCharts
  }
}

export {}
